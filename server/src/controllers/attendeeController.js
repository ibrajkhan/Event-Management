import { Attendee } from "../models/Attendee.js";
import { config } from "../config.js";
import { buildQrCodeDataUrl } from "../services/badgeService.js";
import { parseAttendeeWorkbook, buildAttendeeExport } from "../services/excelService.js";
import { sendAttendeeQrMail } from "../services/emailService.js";
import { buildQrToken, buildRegistrationNumber, normalizeAttendeeRow } from "../utils/attendeeHelpers.js";

async function applyEmailDeliveryResult(attendee) {
  const result = await sendAttendeeQrMail(attendee);
  const now = new Date();

  attendee.emailDelivery = {
    status: result.status || (result.delivered ? "sent" : "failed"),
    attempts: (attendee.emailDelivery?.attempts || 0) + 1,
    lastAttemptAt: now,
    lastSentAt: result.delivered ? now : attendee.emailDelivery?.lastSentAt,
    failureReason: result.delivered ? "" : result.reason || "Email sending failed.",
    lastMessageId: result.messageId || attendee.emailDelivery?.lastMessageId || ""
  };

  await attendee.save();
  return result;
}

export async function listAttendees(req, res) {
  const search = String(req.query.search || "").trim();
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { employeeId: { $regex: search, $options: "i" } },
          { registrationNumber: { $regex: search, $options: "i" } }
        ]
      }
    : {};

  const attendees = await Attendee.find(query).sort({ createdAt: -1 }).lean();
  res.json(attendees);
}

export async function importAttendees(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Excel file is required." });
  }

  const rows = parseAttendeeWorkbook(req.file.buffer);
  const currentCount = await Attendee.countDocuments();
  const created = [];
  let sequence = currentCount;

  for (const [index, row] of rows.entries()) {
    const normalized = normalizeAttendeeRow(row);
    if (!normalized.employeeId || !normalized.name) {
      continue;
    }

    const existing = await Attendee.findOne({ employeeId: normalized.employeeId });
    if (existing) {
      continue;
    }

    sequence += 1;

    const attendee = new Attendee({
      ...normalized,
      registrationNumber: buildRegistrationNumber(sequence),
      qrToken: buildQrToken(),
      eventAddress: config.event.address,
      rawData: row
    });

    attendee.qrCodeDataUrl = await buildQrCodeDataUrl(attendee);
    attendee.badgeUrl = `${config.publicBaseUrl}/api/attendees/${attendee.qrToken}/badge`;
    await attendee.save();
    created.push(attendee);
  }

  res.status(201).json({
    imported: created.length,
    attendees: created
  });
}

export async function exportAttendees(req, res) {
  const attendees = await Attendee.find().sort({ name: 1 }).lean();
  const buffer = await buildAttendeeExport(attendees);

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="attendees-export.xlsx"');
  res.send(Buffer.from(buffer));
}

export async function sendBadgeEmail(req, res) {
  const attendee = await Attendee.findById(req.params.id);
  if (!attendee) {
    return res.status(404).json({ message: "Attendee not found." });
  }

  const result = await applyEmailDeliveryResult(attendee);
  res.json({
    ...result,
    attendee
  });
}

export async function sendAllBadgeEmails(req, res) {
  const attendees = await Attendee.find().sort({ createdAt: 1 });
  const summary = {
    total: attendees.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    results: []
  };

  for (const attendee of attendees) {
    const result = await applyEmailDeliveryResult(attendee);
    summary[result.status] += 1;
    summary.results.push({
      attendeeId: attendee.id,
      name: attendee.name,
      email: attendee.email,
      status: result.status,
      reason: result.reason || ""
    });
  }

  res.json(summary);
}
