import { api } from "./client";

const isMock = () => {
  const token = localStorage.getItem("admin_access_token");
  return token && token.startsWith("mock_");
};

// ==========================================
// MOCK DATASETS (For local bypass mode)
// ==========================================

const MOCK_USERS = [
  { id: "u-1", username: "alex_admin", email: "alex@fixlink.com", role: "admin", is_verified: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "u-2", username: "sarah_mod", email: "sarah@fixlink.com", role: "moderator", is_verified: true, created_at: "2026-01-05T00:00:00Z" },
  { id: "u-3", username: "john_customer", email: "john@gmail.com", role: "customer", is_verified: true, created_at: "2026-02-10T12:00:00Z" },
  { id: "u-4", username: "plumber_pro", email: "contact@proplumbing.com", role: "professional", is_verified: true, created_at: "2026-03-15T09:30:00Z" },
  { id: "u-5", username: "electric_spark", email: "spark@electro.com", role: "professional", is_verified: false, created_at: "2026-04-01T14:20:00Z" },
  { id: "u-6", username: "mary_doe", email: "mary@example.com", role: "customer", is_verified: true, created_at: "2026-04-12T16:45:00Z" },
];

const MOCK_JOBS = [
  { id: "j-1", title: "Leaky Faucet in Kitchen", status: "in_progress", address: "123 Maple St, Seattle", budget: "$150" },
  { id: "j-2", title: "Living Room Light Fixture Installation", status: "pending", address: "456 Oak Rd, Seattle", budget: "$200" },
  { id: "j-3", title: "Whole House Rewiring", status: "booked", address: "789 Pine Ave, Bellevue", budget: "$3,500" },
  { id: "j-4", title: "Garden Irrigation System Repair", status: "done", address: "101 Cedar Ln, Redmond", budget: "$450" },
  { id: "j-5", title: "Unclog Main Sewer Line", status: "disputed", address: "202 Birch Way, Kirkland", budget: "$600" },
];

const MOCK_PAYMENTS = [
  { id: "pay-1", amount: "150.00", currency: "USD", status: "completed", provider: "Stripe" },
  { id: "pay-2", amount: "200.00", currency: "USD", status: "pending", provider: "Stripe" },
  { id: "pay-3", amount: "3500.00", currency: "USD", status: "completed", provider: "Stripe" },
  { id: "pay-4", amount: "450.00", currency: "USD", status: "completed", provider: "PayPal" },
  { id: "pay-5", amount: "600.00", currency: "USD", status: "disputed", provider: "Stripe" },
];

const MOCK_REVIEWS = [
  { id: "r-1", job_title: "Garden Irrigation System Repair", rating: 5, comment: "Excellent work, fast response, fixed the issue immediately!" },
  { id: "r-2", job_title: "Leaky Faucet in Kitchen", rating: 4, comment: "Good service, but arrived a bit late." },
];

const MOCK_NOTIFICATIONS = [
  { id: "n-1", title: "New professional registered", body: "electric_spark applied for professional verification.", channel: "dashboard", status: "unread" },
  { id: "n-2", title: "Dispute opened", body: "Customer initiated a dispute on job 'Unclog Main Sewer Line'.", channel: "email", status: "read" },
  { id: "n-3", title: "System Maintenance", body: "Scheduled maintenance on May 28th at 02:00 UTC.", channel: "broadcast", status: "unread" },
];

const MOCK_VERIFICATION_REQUESTS = [
  {
    id: "v-1",
    user_detail: { username: "plumber_pro", first_name: "John", last_name: "Plumber", email: "john@plumbing.com", profession_name: "Plumbing" },
    document_type: "business_license",
    document_number: "BL-992384-A",
    cv_resume_url: "https://511cc6d43eb78361586ceaf3171e639f.r2.cloudflarestorage.com/fix-link/professional_documents/cv/Painter_Professional_CV.pdf",
    status: "pending",
    notes: "Please verify my active business license in King County.",
    submitted_at: "2026-05-22T08:00:00Z"
  },
  {
    id: "v-2",
    user_detail: { username: "electric_spark", first_name: "Sarah", last_name: "Spark", email: "sarah@spark.com", profession_name: "Electrical" },
    document_type: "passport",
    document_number: "PP-3342551",
    cv_resume_url: "https://511cc6d43eb78361586ceaf3171e639f.r2.cloudflarestorage.com/fix-link/professional_documents/cv/Painter_Professional_CV.pdf",
    status: "pending",
    notes: "I uploaded my certification and passport details.",
    submitted_at: "2026-05-23T14:30:00Z"
  },
  {
    id: "v-3",
    user_detail: { username: "painter_pro", first_name: "Bob", last_name: "Painter", email: "bob@paint.com", profession_name: "Painting" },
    document_type: "id_card",
    document_number: "ID-112233",
    cv_resume_url: "https://511cc6d43eb78361586ceaf3171e639f.r2.cloudflarestorage.com/fix-link/professional_documents/cv/Painter_Professional_CV.pdf",
    status: "approved",
    notes: "National ID upload.",
    submitted_at: "2026-05-20T10:15:00Z"
  }
];

// Extended user profiles with phone numbers and report counts
export const MOCK_USER_PROFILES: Record<string, { phone: string; report_count: number }> = {
  "mary_doe":      { phone: "+1 (206) 555-0182", report_count: 1 },
  "plumber_pro":   { phone: "+1 (425) 555-0234", report_count: 2 },
  "john_customer": { phone: "+1 (206) 555-0317", report_count: 4 },
  "electric_spark":{ phone: "+1 (253) 555-0491", report_count: 5 },
  "sarah_mod":     { phone: "+1 (206) 555-0102", report_count: 0 },
  "painter_pro":   { phone: "+1 (425) 555-0378", report_count: 0 },
};

const MOCK_DISPUTES = [
  {
    id: "d-1",
    job_detail: { id: "j-5", title: "Unclog Main Sewer Line", address: "202 Birch Way, Kirkland", description: "The professional started but left mid-way because he said he didn't have the right machine. The drain is still clogged." },
    raised_by_detail: { username: "mary_doe", role: "customer", email: "mary@example.com", phone: "+1 (206) 555-0182" },
    against_detail: { username: "plumber_pro", role: "professional", email: "contact@proplumbing.com", phone: "+1 (425) 555-0234" },
    payment_detail: { id: "pay-5", amount: "600.00", currency: "USD" },
    reason: "Incomplete Work",
    description: "Mary Doe claims John Plumber left the house with a half-unclogged pipe and charged full. John claims the pipe had root damage requiring heavy machinery which was not part of the bid.",
    status: "open",
    claimed_by_name: null,
    created_at: "2026-05-23T11:00:00Z"
  },
  {
    id: "d-2",
    job_detail: { id: "j-1", title: "Leaky Faucet in Kitchen", address: "123 Maple St, Seattle", description: "Fix the kitchen sink faucet leaks." },
    raised_by_detail: { username: "plumber_pro", role: "professional", email: "contact@proplumbing.com", phone: "+1 (425) 555-0234" },
    against_detail: { username: "john_customer", role: "customer", email: "john@gmail.com", phone: "+1 (206) 555-0317" },
    payment_detail: { id: "pay-1", amount: "150.00", currency: "USD" },
    reason: "Refusal of Release",
    description: "The professional says the job is fully done, but the customer is refusing to confirm completion and release the escrow because of a small scratch on the sink basin.",
    status: "in_review",
    claimed_by_name: "sarah_mod",
    created_at: "2026-05-24T01:30:00Z"
  }
];

// Ban requests submitted by moderators, pending admin action
export const MOCK_BAN_REQUESTS: {
  id: string; username: string; email: string; phone: string; role: string;
  report_count: number; reason: string; submitted_by: string;
  submitted_at: string; status: "pending" | "approved" | "rejected";
}[] = [
  {
    id: "br-1", username: "john_customer", email: "john@gmail.com", phone: "+1 (206) 555-0317",
    role: "customer", report_count: 4,
    reason: "User has been reported 4 times for abusive language towards professionals. Repeated violations after warnings.",
    submitted_by: "sarah_mod", submitted_at: "2026-05-24T09:00:00Z", status: "pending"
  },
  {
    id: "br-2", username: "electric_spark", email: "spark@electro.com", phone: "+1 (253) 555-0491",
    role: "professional", report_count: 5,
    reason: "Professional has 5 reports for fraud — misrepresenting qualifications and abandoning jobs after partial payment.",
    submitted_by: "john_mod", submitted_at: "2026-05-23T14:30:00Z", status: "pending"
  }
];

const MOCK_CHAT_MESSAGES: Record<string, { sender: string; text: string; time: string }[]> = {
  "d-1": [
    { sender: "customer", text: "Hi, when are you arriving?", time: "09:00 AM" },
    { sender: "pro", text: "Hi Mary, I am on my way. Be there in 15 mins.", time: "09:05 AM" },
    { sender: "pro", text: "I arrived and inspected the pipe. It looks like it is blocked with tree roots.", time: "09:30 AM" },
    { sender: "customer", text: "Can you unclog it? I booked the unclog service.", time: "09:35 AM" },
    { sender: "pro", text: "I tried with my snake, but it's stuck. I need a heavy hydro-jetter machine which costs more and I don't have it on me.", time: "10:15 AM" },
    { sender: "customer", text: "You should have known. I want a refund because my drain is still clogged.", time: "10:20 AM" },
    { sender: "pro", text: "I spent 1.5 hours working on it. I still expect to be paid for my labor.", time: "10:30 AM" },
  ],
  "d-2": [
    { sender: "pro", text: "Hello John, I have installed the new faucet.", time: "02:00 PM" },
    { sender: "customer", text: "Looks good, but wait, there is a scratch on my stainless steel sink basin!", time: "02:15 PM" },
    { sender: "pro", text: "That scratch was already there. I was very careful with my tools.", time: "02:18 PM" },
    { sender: "customer", text: "No, it was not. I am not releasing the escrow until this is resolved.", time: "02:20 PM" },
    { sender: "pro", text: "It's just a tiny cosmetic scratch that was already there. Please release the $150.", time: "02:25 PM" },
  ]
};

const MOCK_MODERATORS = [
  { id: "mod-1", username: "sarah_mod", email: "sarah@fixlink.com", active_disputes: 1, resolved_disputes: 15, is_active: true },
  { id: "mod-2", username: "john_mod", email: "john_mod@fixlink.com", active_disputes: 0, resolved_disputes: 8, is_active: true },
  { id: "mod-3", username: "steve_mod", email: "steve@fixlink.com", active_disputes: 0, resolved_disputes: 0, is_active: false }
];

// ==========================================
// API IMPLEMENTATIONS
// ==========================================

export const listUsers = async (params?: { category?: string; search?: string }) => {
  if (isMock()) {
    let filtered = [...MOCK_USERS];
    if (params?.category) {
      filtered = filtered.filter((u) => u.role === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    return filtered;
  }
  const res = await api.get("/users/", { params });
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const listJobs = async () => {
  if (isMock()) return MOCK_JOBS;
  const res = await api.get("/jobs/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const listPayments = async () => {
  if (isMock()) return MOCK_PAYMENTS;
  const res = await api.get("/payments/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const listReviews = async () => {
  if (isMock()) return MOCK_REVIEWS;
  const res = await api.get("/reviews/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const listNotifications = async () => {
  if (isMock()) return MOCK_NOTIFICATIONS;
  const res = await api.get("/notifications/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

// --- Verification Requests ---
export const listVerificationRequests = async () => {
  if (isMock()) return MOCK_VERIFICATION_REQUESTS;
  const res = await api.get("/verification/requests/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const reviewVerificationRequest = async (id: string, status: "approved" | "rejected", notes?: string) => {
  if (isMock()) {
    const req = MOCK_VERIFICATION_REQUESTS.find((r) => r.id === id);
    if (req) {
      req.status = status;
      req.notes = notes || req.notes;
    }
    return req;
  }
  const res = await api.patch(`/verification/requests/${id}/`, { status, notes });
  return res.data;
};

// --- Disputes ---
export const listDisputes = async () => {
  if (isMock()) return MOCK_DISPUTES;
  const res = await api.get("/disputes/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const claimDispute = async (id: string, staffName: string) => {
  if (isMock()) {
    const disp = MOCK_DISPUTES.find((d) => d.id === id);
    if (disp) {
      disp.status = "in_review";
      disp.claimed_by_name = staffName;
    }
    return disp;
  }
  // If backend implements claim endpoint, use it. Otherwise fall back to patching.
  try {
    const res = await api.post(`/disputes/${id}/claim/`);
    return res.data;
  } catch {
    const res = await api.patch(`/disputes/${id}/`, { status: "in_review" });
    return res.data;
  }
};

export const resolveDispute = async (id: string, payout_customer: number, payout_professional: number, resolutionNotes: string) => {
  if (isMock()) {
    const disp = MOCK_DISPUTES.find((d) => d.id === id);
    if (disp) {
      disp.status = "resolved";
    }
    return disp;
  }
  
  // Real backend has POST /api/disputes/{id}/resolve/ or POST /api/payments/{id}/resolve-dispute/
  try {
    const res = await api.post(`/disputes/${id}/resolve/`, { 
      resolution: `Refund Customer: $${payout_customer}, Payout Professional: $${payout_professional}. Notes: ${resolutionNotes}`
    });
    return res.data;
  } catch {
    const res = await api.post(`/payments/${id}/resolve-dispute/`, { 
      payout_customer, 
      payout_professional, 
      notes: resolutionNotes 
    });
    return res.data;
  }
};

// --- Conversation Chat Scoped History ---
export const getChatMessages = async (disputeId: string) => {
  if (isMock()) {
    return MOCK_CHAT_MESSAGES[disputeId] || [];
  }
  // Try retrieving messages using the conversations endpoint
  try {
    // In production, the conversation ID is linked to the job
    const res = await api.get(`/conversations/${disputeId}/messages/`);
    return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
  } catch {
    return [];
  }
};

// --- Moderators (Admin-only) ---
export const listModerators = async () => {
  if (isMock()) return MOCK_MODERATORS;
  try {
    const res = await api.get("/admin/moderators/");
    return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
  } catch {
    return MOCK_MODERATORS; // Fallback to mock if endpoint is pending
  }
};

export const createModerator = async (data: Record<string, string>) => {
  if (isMock()) {
    const newMod = {
      id: `mod-${Date.now()}`,
      username: data.username,
      email: data.email,
      active_disputes: 0,
      resolved_disputes: 0,
      is_active: true
    };
    MOCK_MODERATORS.push(newMod);
    return newMod;
  }
  const res = await api.post("/admin/moderators/", data);
  return res.data;
};

export const toggleModeratorStatus = async (id: string, active: boolean) => {
  if (isMock()) {
    const mod = MOCK_MODERATORS.find((m) => m.id === id);
    if (mod) {
      mod.is_active = active;
    }
    return mod;
  }
  const res = await api.patch(`/admin/moderators/${id}/`, { is_active: active });
  return res.data;
};

// ==========================================
// NEW ENHANCEMENTS MOCK DATASETS & APIS
// ==========================================

export const MOCK_MODERATOR_ACTIVITY = [
  { id: "mod-1", username: "sarah_mod", email: "sarah@fixlink.com", verifications_approved: 12, verifications_rejected: 3, disputes_claimed: 8, disputes_resolved: 7, last_active: "2026-05-24T03:45:00Z" },
  { id: "mod-2", username: "john_mod", email: "john_mod@fixlink.com", verifications_approved: 8, verifications_rejected: 1, disputes_claimed: 5, disputes_resolved: 5, last_active: "2026-05-23T18:20:00Z" },
  { id: "mod-3", username: "steve_mod", email: "steve@fixlink.com", verifications_approved: 0, verifications_rejected: 0, disputes_claimed: 0, disputes_resolved: 0, last_active: "2026-05-15T10:00:00Z" }
];

export const MOCK_MODERATOR_DETAILS: Record<string, any> = {
  "mod-1": {
    id: "mod-1",
    username: "sarah_mod",
    email: "sarah@fixlink.com",
    last_active: "2026-05-24T03:45:00Z",
    stats: { verifications_approved: 12, verifications_rejected: 3, disputes_claimed: 8, disputes_resolved: 7 },
    timeline: [
      { id: "t-1", action: "Approved Professional Verification", target: "plumber_pro", date: "2026-05-24T03:30:00Z", details: "Approved after validating business license BL-992384-A." },
      { id: "t-2", action: "Claimed Dispute", target: "Dispute #d-2 (Leaky Faucet)", date: "2026-05-24T01:30:00Z", details: "Claimed for active moderation." },
      { id: "t-3", action: "Resolved Dispute", target: "Dispute #d-1 (Main Sewer Line)", date: "2026-05-23T15:45:00Z", details: "Granted $400 payout to professional and $200 refund to customer." },
      { id: "t-4", action: "Rejected Professional Verification", target: "painter_bad", date: "2026-05-22T11:00:00Z", details: "Rejected due to expired ID card document." }
    ]
  },
  "mod-2": {
    id: "mod-2",
    username: "john_mod",
    email: "john_mod@fixlink.com",
    last_active: "2026-05-23T18:20:00Z",
    stats: { verifications_approved: 8, verifications_rejected: 1, disputes_claimed: 5, disputes_resolved: 5 },
    timeline: [
      { id: "t-5", action: "Resolved Dispute", target: "Dispute #d-3 (Kitchen Painting)", date: "2026-05-23T17:00:00Z", details: "Escrow released to professional by mutual agreement." }
    ]
  },
  "mod-3": {
    id: "mod-3",
    username: "steve_mod",
    email: "steve@fixlink.com",
    last_active: "2026-05-15T10:00:00Z",
    stats: { verifications_approved: 0, verifications_rejected: 0, disputes_claimed: 0, disputes_resolved: 0 },
    timeline: []
  }
};

export const MOCK_PAYMENT_FEES = [
  { id: "pay-1", customer_name: "John Customer", professional_name: "John Plumber (plumber_pro)", fee_amount: "15.00", job_title: "Leaky Faucet in Kitchen", date: "2026-05-22T08:00:00Z" },
  { id: "pay-3", customer_name: "Sarah Spark (electric_spark)", professional_name: "Bob Painter (painter_pro)", fee_amount: "350.00", job_title: "Whole House Rewiring", date: "2026-05-20T10:15:00Z" },
  { id: "pay-4", customer_name: "Mary Doe", professional_name: "Bob Painter (painter_pro)", fee_amount: "45.00", job_title: "Garden Irrigation System Repair", date: "2026-05-18T14:30:00Z" }
];

export const MOCK_USER_REPORT_COUNTS = [
  { id: "u-3", username: "john_customer", email: "john@gmail.com", role: "customer", report_count: 4, status: "active", joined_date: "2026-02-10T12:00:00Z" },
  { id: "u-4", username: "plumber_pro", email: "contact@proplumbing.com", role: "professional", report_count: 2, status: "active", joined_date: "2026-03-15T09:30:00Z" },
  { id: "u-5", username: "electric_spark", email: "spark@electro.com", role: "professional", report_count: 5, status: "banned", reason: "Deactivated due to multiple community reports (Threshold reached: 3 reports).", joined_date: "2026-04-01T14:20:00Z" },
  { id: "u-6", username: "mary_doe", email: "mary@example.com", role: "customer", report_count: 1, status: "active", joined_date: "2026-04-12T16:45:00Z" }
];

export const setTempPassword = async (moderatorId: string, password: string): Promise<void> => {
  if (isMock()) {
    console.log(`[Mock] Set temporary password for moderator ${moderatorId}: ${password}`);
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
  await api.post(`/admin/moderators/${moderatorId}/temp-password/`, { password });
};

export const updatePassword = async (password: string): Promise<void> => {
  if (isMock()) {
    console.log(`[Mock] Password updated to: ${password}`);
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
  await api.post("/users/change-temp-password/", { password });
};

export const fetchModeratorActivity = async (): Promise<any[]> => {
  if (isMock()) return MOCK_MODERATOR_ACTIVITY;
  const res = await api.get("/admin/moderators/activity/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const fetchModeratorDetail = async (id: string): Promise<any> => {
  if (isMock()) {
    return MOCK_MODERATOR_DETAILS[id] || {
      id,
      username: "unknown_mod",
      email: "unknown@fixlink.com",
      last_active: new Date().toISOString(),
      stats: { verifications_approved: 0, verifications_rejected: 0, disputes_claimed: 0, disputes_resolved: 0 },
      timeline: []
    };
  }
  const res = await api.get(`/admin/moderators/${id}/detail/`);
  return res.data;
};

export const fetchPaymentFees = async (): Promise<any[]> => {
  if (isMock()) return MOCK_PAYMENT_FEES;
  const res = await api.get("/admin/payments/fees/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const fetchUserReportCounts = async (threshold?: number): Promise<any[]> => {
  if (isMock()) {
    if (threshold !== undefined) {
      return MOCK_USER_REPORT_COUNTS.filter((u) => u.report_count >= threshold);
    }
    return MOCK_USER_REPORT_COUNTS;
  }
  const res = await api.get("/admin/users/report-counts/", { params: { threshold } });
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const banUser = async (userId: string, reason?: string): Promise<void> => {
  if (isMock()) {
    const user = MOCK_USER_REPORT_COUNTS.find((u) => u.id === userId);
    if (user) {
      user.status = "banned";
      user.reason = reason || "Deactivated due to multiple reports.";
    }
    // Also sync back status to core MOCK_USERS if possible
    const coreUser = MOCK_USERS.find((u) => u.id === userId);
    if (coreUser) {
      // mark custom attribute or mock deactivation
      (coreUser as any).isDeactivated = true;
      (coreUser as any).deactivationReason = reason || "Deactivated due to multiple reports.";
    }
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
  await api.post(`/admin/users/${userId}/ban/`, { reason });
};

// --- Ban Requests (Moderator submits → Admin approves) ---

export const fetchUserReportCount = async (username: string): Promise<number> => {
  if (isMock()) {
    return MOCK_USER_PROFILES[username]?.report_count ?? 0;
  }
  const res = await api.get(`/admin/users/report-count/`, { params: { username } });
  return res.data?.report_count ?? 0;
};

export const submitBanRequest = async (payload: {
  username: string;
  email: string;
  phone: string;
  role: string;
  report_count: number;
  reason: string;
}): Promise<void> => {
  if (isMock()) {
    const existing = MOCK_BAN_REQUESTS.find((r) => r.username === payload.username && r.status === "pending");
    if (!existing) {
      MOCK_BAN_REQUESTS.push({
        id: `br-${Date.now()}`,
        ...payload,
        submitted_by: "moderator",
        submitted_at: new Date().toISOString(),
        status: "pending",
      });
    }
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
  await api.post("/moderator/ban-requests/", payload);
};

export const fetchBanRequests = async (): Promise<typeof MOCK_BAN_REQUESTS> => {
  if (isMock()) return [...MOCK_BAN_REQUESTS];
  const res = await api.get("/admin/ban-requests/");
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const approveBanRequest = async (id: string, reason?: string): Promise<void> => {
  if (isMock()) {
    const req = MOCK_BAN_REQUESTS.find((r) => r.id === id);
    if (req) {
      req.status = "approved";
      // Also mark user banned in the report counts list
      const user = MOCK_USER_REPORT_COUNTS.find((u) => u.username === req.username);
      if (user) {
        user.status = "banned";
        user.reason = reason || req.reason;
      }
    }
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
  await api.post(`/admin/ban-requests/${id}/approve/`, { reason });
};

export const rejectBanRequest = async (id: string, notes?: string): Promise<void> => {
  if (isMock()) {
    const req = MOCK_BAN_REQUESTS.find((r) => r.id === id);
    if (req) req.status = "rejected";
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
  await api.post(`/admin/ban-requests/${id}/reject/`, { notes });
};
