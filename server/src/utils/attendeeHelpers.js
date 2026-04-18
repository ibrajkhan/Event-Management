import crypto from "crypto";

export function buildRegistrationNumber(sequence) {
  return `EVT-${String(sequence).padStart(5, "0")}`;
}

export function buildQrToken() {
  return crypto.randomBytes(16).toString("hex");
}

export function normalizeAttendeeRow(row) {
  return {
    employeeId: String(row["Employee ID"] || row.employeeId || "").trim(),
    name: String(row.Name || row.name || "").trim(),
    email: String(row.Email || row.email || "").trim(),
    phone: String(row.Phone || row.phone || "").trim(),
    designation: String(row.Designation || row.designation || "").trim(),
    department: String(row.Department || row.department || "").trim(),
    company: String(row.Company || row.company || "").trim()
  };
}
