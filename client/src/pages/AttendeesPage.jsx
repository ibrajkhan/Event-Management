import { useEffect, useState } from "react";
import { downloadExport, fetchAttendees, sendAllBadgeEmails, sendBadgeEmail } from "../api";
import ImportPanel from "../components/ImportPanel.jsx";
import AttendeeTable from "../components/AttendeeTable.jsx";

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadAttendees();
  }, [search]);

  async function loadAttendees() {
    const data = await fetchAttendees(search);
    setAttendees(data);
  }

  async function handleSendEmail(id) {
    setSendingEmailId(id);
    try {
      const result = await sendBadgeEmail(id);
      setMessage(result.delivered ? "Email sent successfully." : result.reason);
      await loadAttendees();
    } finally {
      setSendingEmailId("");
    }
  }

  async function handleSendAllEmails() {
    setIsSendingAll(true);
    try {
      const result = await sendAllBadgeEmails();
      setMessage(
        `Bulk email complete. Sent: ${result.sent}, Failed: ${result.failed}, Skipped: ${result.skipped}.`
      );
      loadAttendees();
    } finally {
      setIsSendingAll(false);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      await downloadExport();
      setMessage("Excel export downloaded successfully.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Attendee Management</p>
        <h2>Import, search, export, and resend attendee M-badges.</h2>
      </section>

      <ImportPanel onImported={loadAttendees} onImportingChange={setIsImporting} />

      <section className="panel controls-row">
        <input
          type="search"
          placeholder="Search by name, email, employee ID, or registration number"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button onClick={handleExport} disabled={isExporting || isImporting}>
          {isExporting ? "Exporting..." : "Export Excel"}
        </button>
        <button onClick={handleSendAllEmails} disabled={isSendingAll}>
          {isSendingAll ? "Sending..." : "Send Email To All"}
        </button>
      </section>

      {message ? <p className="status-text">{message}</p> : null}

      <AttendeeTable attendees={attendees} onSendEmail={handleSendEmail} sendingEmailId={sendingEmailId} />
    </div>
  );
}
