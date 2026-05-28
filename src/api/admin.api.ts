import { api } from "./client";

// ==========================================
// TYPES
// ==========================================

export interface ReportsSummary {
  user_totals: Record<string, number>;
  job_totals: Record<string, number>;
  payment_totals: Record<string, number>;
  dispute_totals: Record<string, number>;
  escrow_held: string;
  platform_fee_collected: string;
  timeline: {
    month: string;
    users: number;
    revenue: string | number;
    disputes: number;
  }[];
}

// ==========================================
// USERS
// ==========================================

export const listUsers = async (params?: { category?: string; search?: string }) => {
  const res = await api.get("/admin/users/", { params });
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const banUser = async (userId: string, reason?: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/ban/`, { reason });
};

export const fetchUserReportCounts = async (threshold?: number): Promise<any[]> => {
  const res = await api.get("/admin/users/report-counts/", { params: { threshold } });
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const fetchUserReportCount = async (username: string): Promise<number> => {
  const res = await api.get("/admin/users/report-count/", { params: { username } });
  return res.data?.report_count ?? 0;
};

// ==========================================
// JOBS
// ==========================================

export const listJobs = async () => {
  const res = await api.get("/jobs/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

// ==========================================
// PAYMENTS
// ==========================================

export const listPayments = async () => {
  const res = await api.get("/payments/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const fetchPaymentFees = async (): Promise<any[]> => {
  const res = await api.get("/admin/payments/fees/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

// ==========================================
// REVIEWS
// ==========================================

export const listReviews = async () => {
  const res = await api.get("/reviews/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

// ==========================================
// NOTIFICATIONS
// ==========================================

export const listNotifications = async () => {
  const res = await api.get("/notifications/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

// ==========================================
// VERIFICATION REQUESTS
// ==========================================

export const listVerificationRequests = async () => {
  const res = await api.get("/verification/requests/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const reviewVerificationRequest = async (
  id: string,
  status: "approved" | "rejected",
  notes?: string
) => {
  const res = await api.patch(`/verification/requests/${id}/`, { status, notes });
  return res.data;
};

// ==========================================
// DISPUTES
// ==========================================

export const listDisputes = async () => {
  const res = await api.get("/disputes/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const claimDispute = async (id: string, _staffName: string) => {
  const res = await api.post(`/disputes/${id}/claim/`);
  return res.data;
};

export const resolveDispute = async (
  id: string,
  payout_customer: number,
  payout_professional: number,
  resolutionNotes: string
) => {
  const res = await api.post(`/disputes/${id}/resolve/`, {
    resolution: `Refund Customer: $${payout_customer}, Payout Professional: $${payout_professional}. Notes: ${resolutionNotes}`,
  });
  return res.data;
};

// ==========================================
// CHAT / MESSAGES (scoped to dispute job)
// ==========================================

export const getChatMessages = async (disputeId: string) => {
  try {
    const res = await api.get(`/conversations/${disputeId}/messages/`);
    return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
  } catch {
    return [];
  }
};

// ==========================================
// MODERATORS (Admin-only)
// ==========================================

export const listModerators = async () => {
  const res = await api.get("/admin/moderators/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const createModerator = async (data: Record<string, string>) => {
  const res = await api.post("/admin/moderators/", data);
  return res.data;
};

export const toggleModeratorStatus = async (id: string, active: boolean) => {
  const res = await api.patch(`/admin/moderators/${id}/`, { is_active: active });
  return res.data;
};

export const setTempPassword = async (moderatorId: string, password: string): Promise<void> => {
  await api.post(`/admin/moderators/${moderatorId}/temp-password/`, { password });
};

export const updatePassword = async (password: string): Promise<void> => {
  await api.post("/users/change-temp-password/", { password });
};

export const fetchModeratorActivity = async (): Promise<any[]> => {
  const res = await api.get("/admin/moderators/activity/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const fetchModeratorDetail = async (id: string): Promise<any> => {
  const res = await api.get(`/admin/moderators/${id}/detail/`);
  return res.data;
};

// ==========================================
// BAN REQUESTS (Moderator submits → Admin approves)
// ==========================================

export const submitBanRequest = async (payload: {
  username: string;
  email: string;
  phone: string;
  role: string;
  report_count: number;
  reason: string;
}): Promise<void> => {
  await api.post("/moderator/ban-requests/", payload);
};

export const fetchBanRequests = async (): Promise<any[]> => {
  const res = await api.get("/admin/ban-requests/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const approveBanRequest = async (id: string, reason?: string): Promise<void> => {
  await api.post(`/admin/ban-requests/${id}/approve/`, { reason });
};

export const rejectBanRequest = async (id: string, notes?: string): Promise<void> => {
  await api.post(`/admin/ban-requests/${id}/reject/`, { notes });
};

// ==========================================
// REPORTS SUMMARY (Single aggregated endpoint)
// ==========================================

export const fetchReportsSummary = async (): Promise<ReportsSummary> => {
  const res = await api.get("/admin/reports/summary/");
  return res.data as ReportsSummary;
};
