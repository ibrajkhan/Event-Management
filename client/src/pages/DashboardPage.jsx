import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { fetchDashboard, getStoredAuth } from "../api";
import StatCard from "../components/StatCard.jsx";

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    total: 0,
    checkedIn: 0,
    lunchTaken: 0,
    dinnerTaken: 0,
    kitsDistributed: 0,
    pendingCheckIn: 0,
    recent: []
  });

  useEffect(() => {
    const socket = io((import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace("/api", ""), {
      auth: {
        token: getStoredAuth()?.token || ""
      }
    });

    loadSummary();
    socket.on("attendance:updated", loadSummary);

    return () => {
      socket.off("attendance:updated", loadSummary);
      socket.close();
    };
  }, []);

  async function loadSummary() {
    const data = await fetchDashboard();
    setSummary(data);
  }

  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Admin Dashboard</p>
        <h2>Live event visibility across entry and meals.</h2>
      </section>

      <section className="stats-grid">
        <StatCard label="Total Attendees" value={summary.total} tone="blue" />
        <StatCard label="Checked In" value={summary.checkedIn} tone="green" />
        <StatCard label="Lunch Taken" value={summary.lunchTaken} tone="amber" />
        <StatCard label="Dinner Taken" value={summary.dinnerTaken} tone="red" />
        <StatCard label="Kits Distributed" value={summary.kitsDistributed} tone="blue" />
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Recent Activity</h2>
          <p>Latest attendee changes sync automatically.</p>
        </div>
        <div className="activity-list">
          {summary.recent.map((item) => (
            <article key={item._id} className="activity-item">
              <strong>{item.name}</strong>
              <span>{item.registrationNumber}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
