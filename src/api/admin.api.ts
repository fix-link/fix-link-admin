import { api } from "./client";

export const listUsers = async () => {
  const res = await api.get("/users/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const listJobs = async () => {
  const res = await api.get("/jobs/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const listPayments = async () => {
  const res = await api.get("/payments/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const listReviews = async () => {
  const res = await api.get("/reviews/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const listNotifications = async () => {
  const res = await api.get("/notifications/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};
