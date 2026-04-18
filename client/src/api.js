import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
});

export async function fetchDashboard() {
  const { data } = await api.get("/dashboard/summary");
  return data;
}

export async function fetchAttendees(search = "") {
  const { data } = await api.get("/attendees", { params: { search } });
  return data;
}

export async function uploadAttendees(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/attendees/import", formData);
  return data;
}

export function downloadExport() {
  window.open(`${api.defaults.baseURL}/attendees/export`, "_blank");
}

export async function sendBadgeEmail(id) {
  const { data } = await api.post(`/attendees/${id}/send-email`);
  return data;
}

export async function sendAllBadgeEmails() {
  const { data } = await api.post("/attendees/send-all-emails");
  return data;
}

export async function recordScan(type, token) {
  const { data } = await api.post(`/scan/${type}/${token}`, {
    deviceLabel: "Scanner Web App",
    byUser: "Event Staff"
  });
  return data;
}

export default api;
