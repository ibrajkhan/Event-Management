import mongoose from "mongoose";

const attendanceStateSchema = new mongoose.Schema(
  {
    scannedAt: Date,
    deviceLabel: String,
    byUser: String
  },
  { _id: false }
);

const emailDeliverySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "skipped"],
      default: "pending"
    },
    attempts: {
      type: Number,
      default: 0
    },
    lastAttemptAt: Date,
    lastSentAt: Date,
    failureReason: String,
    lastMessageId: String
  },
  { _id: false }
);

const attendeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    designation: { type: String, trim: true },
    department: { type: String, trim: true },
    company: { type: String, trim: true },
    qrToken: { type: String, required: true, unique: true, index: true },
    qrCodeDataUrl: String,
    badgeUrl: String,
    eventAddress: String,
    rawData: { type: Map, of: String },
    emailDelivery: {
      type: emailDeliverySchema,
      default: () => ({})
    },
    attendance: {
      entry: attendanceStateSchema,
      lunch: attendanceStateSchema,
      dinner: attendanceStateSchema,
      kitDistribution: attendanceStateSchema
    }
  },
  { timestamps: true }
);

export const Attendee = mongoose.model("Attendee", attendeeSchema);
