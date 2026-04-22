import { Attendee } from "../models/Attendee.js";

export async function getDashboardSummary(req, res) {
  const [total, checkedIn, lunchTaken, dinnerTaken, kitsDistributed, recent] = await Promise.all([
    Attendee.countDocuments(),
    Attendee.countDocuments({ "attendance.entry.scannedAt": { $exists: true } }),
    Attendee.countDocuments({ "attendance.lunch.scannedAt": { $exists: true } }),
    Attendee.countDocuments({ "attendance.dinner.scannedAt": { $exists: true } }),
    Attendee.countDocuments({ "attendance.kitDistribution.scannedAt": { $exists: true } }),
    Attendee.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("name registrationNumber attendance updatedAt")
      .lean()
  ]);

  res.json({
    total,
    checkedIn,
    lunchTaken,
    dinnerTaken,
    kitsDistributed,
    pendingCheckIn: total - checkedIn,
    recent
  });
}
