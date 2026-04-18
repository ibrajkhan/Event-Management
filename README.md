# Event Management & Attendance System

MERN stack scaffold for:

- attendee import from Excel
- QR-based badge generation
- event entry, lunch, and dinner scanning
- duplicate scan prevention
- admin analytics dashboard
- Excel export with badge URLs
- email delivery integration hooks

## Project Structure

- `server/` Express + MongoDB API
- `client/` React + Vite admin and scanner UI

## Core Flows

1. Import attendees from Excel into MongoDB.
2. Generate a registration number, QR token, and badge URL for each attendee.
3. Send attendees their badge/QR details by email.
4. Scan QR at event entry, lunch, or dinner.
5. Store real-time attendance events and block duplicate meal claims.
6. Review analytics and export enriched attendee data to Excel.

## Planned Integrations

- Excel import/export: `xlsx`
- QR generation: `qrcode`
- PDF badge rendering: `pdf-lib`
- Email delivery: `nodemailer`
- Realtime dashboard updates: `socket.io`

## Getting Started

1. Create `.env` files from the provided examples.
2. Install dependencies in `server/` and `client/`.
3. Start MongoDB.
4. Run the API and frontend locally.

## Local Run

### Option 1: Quick local check without installing MongoDB

The server is configured with `USE_IN_MEMORY_DB=true` in [server/.env](C:/IBRAZ/Event%20Software%20Online%20Registration/server/.env:1), so it can run with an embedded development database for local testing.

Open two terminals in the project root:

```powershell
npm.cmd run dev:server
```

```powershell
npm.cmd run dev:client
```

Then open `http://localhost:5173`.

### Option 2: Use your own MongoDB instance

Update [server/.env](C:/IBRAZ/Event%20Software%20Online%20Registration/server/.env:1):

```env
USE_IN_MEMORY_DB=false
MONGODB_URI=mongodb://127.0.0.1:27017/event_management
```

Then start the same `dev:server` and `dev:client` commands.

## Notes

- Badge PDF design is stored in [server/assets/M-badge Design.pdf](C:/IBRAZ/Event%20Software%20Online%20Registration/server/assets/M-badge%20Design.pdf:1) and used as the base badge template.
- Email sending is implemented as a service boundary so SMTP or a provider like SendGrid can be plugged in easily.
- Scanner UI is mobile-friendly and designed for event staff.
