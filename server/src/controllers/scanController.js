import { Attendee } from "../models/Attendee.js";

const scanLabels = {
  entry: "Event entry recorded.",
  lunch: "Lunch recorded.",
  dinner: "Dinner recorded."
};

export async function resolveQr(req, res) {
  const attendee = await Attendee.findOne({ qrToken: req.params.token }).lean();
  if (!attendee) {
    return res.status(404).json({ message: "Invalid QR token." });
  }

  res.json(attendee);
}

export async function recordScan(req, res) {
  const { token, type } = req.params;
  if (!["entry", "lunch", "dinner"].includes(type)) {
    return res.status(400).json({ message: "Invalid scan type." });
  }

  const attendee = await Attendee.findOne({ qrToken: token });
  if (!attendee) {
    return res.status(404).json({ message: "Invalid QR token." });
  }

  if (attendee.attendance?.[type]?.scannedAt) {
    return res.status(409).json({
      message: `${type[0].toUpperCase()}${type.slice(1)} already taken.`,
      attendee
    });
  }

  attendee.attendance[type] = {
    scannedAt: new Date(),
    deviceLabel: req.body.deviceLabel || "Web scanner",
    byUser: req.body.byUser || "Staff"
  };

  await attendee.save();
  const updated = attendee.toObject();

  req.app.get("io").emit("attendance:updated", {
    attendeeId: attendee.id,
    type,
    scannedAt: updated.attendance[type].scannedAt
  });

  res.json({
    message: scanLabels[type],
    attendee: updated
  });
}
