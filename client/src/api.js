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

export async function downloadExport() {
  const response = await api.get("/attendees/export", {
    responseType: "blob"
  });

  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = "attendees-export.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
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
  const { data } = await api.get(`/scan/${type}/${encodeURIComponent(token)}`, {
    params: {
      deviceLabel: "Scanner Web App",
      byUser: "Event Staff"
    },
    timeout: 12000
  });
  return data;
}

export default api;
