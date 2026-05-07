import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { fetchSession, getStoredAuth, setStoredAuth } from "./api";
import DashboardPage from "./pages/DashboardPage.jsx";
import AttendeesPage from "./pages/AttendeesPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ScannerPage from "./pages/ScannerPage.jsx";

export default function App() {
  const [user, setUser] = useState(getStoredAuth()?.user || null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(
    Boolean(getStoredAuth()?.token),
  );

  useEffect(() => {
    const storedAuth = getStoredAuth();
    if (!storedAuth?.token) {
      setIsCheckingAuth(false);
      return;
    }

    fetchSession()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setStoredAuth(null);
        setUser(null);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  function handleLogout() {
    setStoredAuth(null);
    setUser(null);
  }

  if (isCheckingAuth) {
    return (
      <div className="login-shell">
        <section className="login-card">
          <h1>Checking access...</h1>
        </section>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="eyebrow">ICCW Tech(Ibraj khan)</p>
        <h1>Event Control Center</h1>
        <p className="status-text">Signed in as {user.username}</p>
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/attendees">Attendees</NavLink>
          <NavLink to="/scanner">Scanner</NavLink>
        </nav>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
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
