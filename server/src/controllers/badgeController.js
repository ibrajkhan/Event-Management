import { Attendee } from "../models/Attendee.js";
import { createBadgePdf } from "../services/badgeService.js";

export async function getBadgePdf(req, res) {
  const attendee = await Attendee.findOne({ qrToken: req.params.token });
  if (!attendee) {
    return res.status(404).json({ message: "Badge not found." });
  }

  if (!attendee.qrCodeDataUrl) {
    return res.status(400).json({ message: "QR code not generated for attendee." });
  }

  const pdfBytes = await createBadgePdf(attendee);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${attendee.registrationNumber}.pdf"`);
  res.send(Buffer.from(pdfBytes));
}
