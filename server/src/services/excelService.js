import XLSX from "xlsx";
import ExcelJS from "exceljs";

export function parseAttendeeWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
}

export async function buildAttendeeExport(attendees) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendees");

  sheet.columns = [
    { header: "Employee ID", key: "employeeId", width: 18 },
    { header: "Registration Number", key: "registrationNumber", width: 22 },
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 28 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Designation", key: "designation", width: 20 },
    { header: "Department", key: "department", width: 20 },
    { header: "Company", key: "company", width: 20 },
    { header: "Entry Status", key: "entryStatus", width: 16 },
    { header: "Lunch Status", key: "lunchStatus", width: 16 },
    { header: "Dinner Status", key: "dinnerStatus", width: 16 },
    { header: "M-Badge URL", key: "badgeUrl", width: 40 },
    { header: "Email Status", key: "emailStatus", width: 16 },
    { header: "Email Attempts", key: "emailAttempts", width: 14 },
    { header: "Last Email Attempt", key: "lastEmailAttempt", width: 22 },
    { header: "Last Email Sent", key: "lastEmailSent", width: 22 },
    { header: "Email Failure Reason", key: "emailFailureReason", width: 40 }
  ];

  attendees.forEach((attendee) => {
    sheet.addRow({
      employeeId: attendee.employeeId,
      registrationNumber: attendee.registrationNumber,
      name: attendee.name,
      email: attendee.email,
      phone: attendee.phone,
      designation: attendee.designation,
      department: attendee.department,
      company: attendee.company,
      entryStatus: attendee.attendance?.entry?.scannedAt ? "Checked In" : "Pending",
      lunchStatus: attendee.attendance?.lunch?.scannedAt ? "Taken" : "Pending",
      dinnerStatus: attendee.attendance?.dinner?.scannedAt ? "Taken" : "Pending",
      badgeUrl: attendee.badgeUrl,
      emailStatus: attendee.emailDelivery?.status || "pending",
      emailAttempts: attendee.emailDelivery?.attempts || 0,
      lastEmailAttempt: attendee.emailDelivery?.lastAttemptAt
        ? new Date(attendee.emailDelivery.lastAttemptAt).toLocaleString()
        : "",
      lastEmailSent: attendee.emailDelivery?.lastSentAt
        ? new Date(attendee.emailDelivery.lastSentAt).toLocaleString()
        : "",
      emailFailureReason: attendee.emailDelivery?.failureReason || ""
    });
  });

  return workbook.xlsx.writeBuffer();
}
