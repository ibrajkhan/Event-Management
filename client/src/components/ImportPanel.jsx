import { useState } from "react";
import { uploadAttendees } from "../api";

export default function ImportPanel({ onImported }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  async function handleImport(event) {
    event.preventDefault();
    if (!file) {
      setMessage("Choose an Excel file first.");
      return;
    }

    const result = await uploadAttendees(file);
    setMessage(`${result.imported} attendees imported.`);
    onImported();
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Import Attendees</h2>
        <p>Upload Excel with Employee ID, Name, Email, Phone, Designation, and related columns.</p>
      </div>
      <form className="inline-form" onSubmit={handleImport}>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        <button type="submit">Import</button>
      </form>
      {message ? <p className="status-text">{message}</p> : null}
    </section>
  );
}
