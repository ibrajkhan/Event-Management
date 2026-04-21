import { useEffect, useState } from "react";
import { downloadExport, fetchAttendees, sendBadgeEmail } from "../api";
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
  const [bulkEmailProgress, setBulkEmailProgress] = useState({ current: 0, total: 0 });

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
    setBulkEmailProgress({ current: 0, total: attendees.length });
    try {
      let sent = 0;
      let failed = 0;
      let skipped = 0;

      for (const [index, attendee] of attendees.entries()) {
        setBulkEmailProgress({ current: index + 1, total: attendees.length });
        const result = await sendBadgeEmail(attendee._id);
        if (result.status === "sent") {
          sent += 1;
        } else if (result.status === "skipped") {
          skipped += 1;
        } else {
          failed += 1;
        }
      }

      setMessage(`Bulk email complete. Sent: ${sent}, Failed: ${failed}, Skipped: ${skipped}.`);
      loadAttendees();
    } finally {
      setIsSendingAll(false);
      setBulkEmailProgress({ current: 0, total: 0 });
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
          {isSendingAll
            ? `Sending ${bulkEmailProgress.current} / ${bulkEmailProgress.total}`
            : "Send Email To All"}
        </button>
      </section>

      {message ? <p className="status-text">{message}</p> : null}

      <AttendeeTable attendees={attendees} onSendEmail={handleSendEmail} sendingEmailId={sendingEmailId} />
    </div>
  );
}
