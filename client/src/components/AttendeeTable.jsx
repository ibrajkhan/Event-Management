export default function AttendeeTable({ attendees, onSendEmail, sendingEmailId }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Attendee Directory</h2>
        <p>Search, verify attendance state, and resend badge access links.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Reg No</th>
              <th>Email</th>
              <th>Entry</th>
              <th>Lunch</th>
              <th>Dinner</th>
              <th>Kit</th>
              <th>Email Status</th>
              <th>Badge</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((attendee) => (
              <tr key={attendee._id}>
                <td>{attendee.name}</td>
                <td>{attendee.registrationNumber}</td>
                <td>{attendee.email || "-"}</td>
                <td>{attendee.attendance?.entry?.scannedAt ? "Yes" : "No"}</td>
                <td>{attendee.attendance?.lunch?.scannedAt ? "Yes" : "No"}</td>
                <td>{attendee.attendance?.dinner?.scannedAt ? "Yes" : "No"}</td>
                <td>{attendee.attendance?.kitDistribution?.scannedAt ? "Yes" : "No"}</td>
                <td>
                  <strong>{attendee.emailDelivery?.status || "pending"}</strong>
                  <div>{attendee.emailDelivery?.failureReason || "-"}</div>
                </td>
                <td>
                  <a href={attendee.badgeUrl} target="_blank" rel="noreferrer">
                    Open Badge
                  </a>
                </td>
                <td>
                  <button onClick={() => onSendEmail(attendee._id)} disabled={sendingEmailId === attendee._id}>
                    {sendingEmailId === attendee._id
                      ? "Sending..."
                      : attendee.emailDelivery?.status === "sent"
                        ? "Resend"
                        : "Send"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
