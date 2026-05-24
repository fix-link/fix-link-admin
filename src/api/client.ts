import axios from "axios";

const rawBase = (
  import.meta.env.VITE_API_URL || "https://fix-link-5332f899c079.herokuapp.com"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export const API_URL = `${rawBase}/api`;

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const parseError = (error: unknown): string => {
  const err = error as { response?: { status?: number; data?: unknown }; message?: string };
  const status = err.response?.status;
  if (status && status >= 500) {
    return "Server error. Please try again shortly.";
  }
  const data = err.response?.data;
  if (data && typeof data === "object" && data !== null) {
    const d = data as Record<string, unknown>;
    if (typeof d.detail === "string") return d.detail;
    if (Array.isArray(d.non_field_errors)) return String(d.non_field_errors[0]);
    const entries = Object.entries(d);
    if (entries.length > 0) {
      return entries
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
        .join(" | ");
    }
  }
  return err.message || "Something went wrong.";
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_access_token");
  const isAuth =
    config.url?.includes("/login") || config.url?.includes("/token");
  if (token && token !== "undefined" && !isAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("admin_access_token");
      if (token && token.startsWith("mock_")) {
        return Promise.reject(error);
      }
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("admin_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
