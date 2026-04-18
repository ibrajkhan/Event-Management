# Architecture Notes

## Backend

- `Attendee` stores profile details, QR token, badge URL, and attendance states.
- Import endpoint accepts Excel and creates normalized attendee records.
- Scan endpoints handle `entry`, `lunch`, and `dinner` with duplicate protection.
- Dashboard endpoint returns summary analytics and recent attendee activity.
- Export endpoint produces an Excel workbook with attendee details and badge URL.

## Frontend

- `DashboardPage` shows live summary cards with Socket.IO refresh.
- `AttendeesPage` handles import, search, export, and resend email actions.
- `ScannerPage` is optimized for quick scan submissions on mobile devices.

## Next Build Steps

- Add authentication and role-based access for admins and scan staff.
- Replace manual token entry in scanner with camera-based QR scanning via `@zxing/browser`.
- Support uploading your final badge design PDF and placing fields at exact coordinates.
- Add audit trail tables for every scan event and email delivery attempt.
