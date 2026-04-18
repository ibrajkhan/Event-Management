import { NavLink, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage.jsx";
import AttendeesPage from "./pages/AttendeesPage.jsx";
import ScannerPage from "./pages/ScannerPage.jsx";

export default function App() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="eyebrow">IBRAZ Events</p>
        <h1>Event Control Center</h1>
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/attendees">Attendees</NavLink>
          <NavLink to="/scanner">Scanner</NavLink>
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/attendees" element={<AttendeesPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
        </Routes>
      </main>
    </div>
  );
}
