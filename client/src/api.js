import axios from "axios";

const AUTH_STORAGE_KEY = "event_admin_auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
});

export function getStoredAuth() {
  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
  return rawValue ? JSON.parse(rawValue) : null;
}

export function setStoredAuth(auth) {
  if (!auth) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    delete api.defaults.headers.common.Authorization;
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  api.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
}

const existingAuth = typeof window !== "undefined" ? getStoredAuth() : null;
if (existingAuth?.token) {
  api.defaults.headers.common.Authorization = `Bearer ${existingAuth.token}`;
}

export async function login(username, password) {
  const { data } = await api.post("/auth/login", { username, password });
  setStoredAuth(data);
  return data;
}

export async function fetchSession() {
  const { data } = await api.get("/auth/session");
  return data;
}

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
