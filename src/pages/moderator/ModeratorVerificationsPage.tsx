import { useEffect, useState } from "react";
import { Check, X, FileText, ExternalLink, Shield } from "lucide-react";
import { listVerificationRequests, reviewVerificationRequest } from "../../api/admin.api";
import DataTable from "../../components/DataTable";
import PageLoader from "../../components/PageLoader";

interface VerificationRequest {
  id: string;
  user_detail?: {
    username: string;
    first_name?: string;
    last_name?: string;
    email: string;
    profession_name?: string;
  };
  document_type: string;
  document_number: string;
  cv_resume_url?: string;
  status: string;
  notes?: string;
  submitted_at: string;
}

const ModeratorVerificationsPage = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Rejection modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadRequests = () => {
    setLoading(true);
    listVerificationRequests()
      .then((data) => setRequests(data as VerificationRequest[]))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm("Are you sure you want to approve this verification request? This will mark the professional as verified.")) {
      return;
    }
    setSubmitting(id);
    try {
      await reviewVerificationRequest(id, "approved");
      loadRequests();
    } catch (err) {
      alert("Failed to approve verification request.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setSubmitting(rejectingId);
    try {
      await reviewVerificationRequest(rejectingId, "rejected", rejectReason);
      setRejectingId(null);
      setRejectReason("");
      loadRequests();
    } catch (err) {
      alert("Failed to reject verification request.");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-display font-black text-text-light dark:text-text-dark">
            Professional Verification Queue
          </h3>
          <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark mt-1">
            Review uploaded certificates and licenses to mark professionals as trusted service providers.
          </p>
        </div>
        <span className="px-4 py-2 bg-primary/10 text-primary text-xs font-black rounded-full uppercase tracking-wider">
          {requests.filter((r) => r.status === "pending").length} Pending Requests
        </span>
      </div>

      <div className="glass-panel rounded-2xl border border-border-light/60 dark:border-border-dark/60 overflow-hidden">
        <DataTable
          rows={requests as any[]}
          columns={[
            {
              key: "user",
              header: "Professional",
              render: (r) => {
                const user = r.user_detail;
                const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Professional";
                return (
                  <div className="flex flex-col">
                    <span className="font-bold text-text-light dark:text-text-dark">{name}</span>
                    <span className="text-[10px] font-black text-subtext-light dark:text-subtext-dark">
                      @{user?.username || "unknown"} · {user?.profession_name || "General"}
                    </span>
                  </div>
                );
              },
            },
            {
              key: "document_type",
              header: "Document Details",
              render: (r) => (
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase tracking-wider text-text-light dark:text-text-dark">
                    {String(r.document_type || "").replace("_", " ")}
                  </span>
                  <span className="text-xs font-medium text-subtext-light dark:text-subtext-dark">
                    Doc #: {r.document_number}
                  </span>
                </div>
              ),
            },
            {
              key: "cv_resume_url",
              header: "Verification Assets",
              render: (r) =>
                r.cv_resume_url ? (
                  <a
                    href={r.cv_resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-text-light dark:text-text-dark text-xs font-bold rounded-xl transition-all border border-border-light dark:border-border-dark"
                  >
                    <FileText size={14} />
                    View File
                    <ExternalLink size={12} className="opacity-60" />
                  </a>
                ) : (
                  <span className="text-xs text-subtext-light">—</span>
                ),
            },
            {
              key: "submitted_at",
              header: "Submitted",
              render: (r) => (
                <span className="text-xs font-medium text-subtext-light dark:text-subtext-dark">
                  {new Date(r.submitted_at as string).toLocaleDateString()}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (r) => {
                const s = r.status.toLowerCase();
                let cls = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
                if (s === "approved") {
                  cls = "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
                } else if (s === "rejected") {
                  cls = "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
                }
                return (
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${cls}`}>
                    {r.status}
                  </span>
                );
              },
            },
            {
              key: "actions",
              header: "Actions",
              render: (r) => {
                if (r.status.toLowerCase() !== "pending") {
                  return (
                    <span className="text-[10px] font-black text-subtext-light dark:text-subtext-dark uppercase tracking-widest">
                      Archived
                    </span>
                  );
                }
                const isSubmitting = submitting === r.id;
                return (
                  <div className="flex gap-2">
                    <button
                      disabled={!!submitting}
                      onClick={() => handleApprove(r.id)}
                      className="size-8 rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white flex items-center justify-center transition-colors shadow-sm"
                      title="Approve"
                    >
                      <Check size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      disabled={!!submitting}
                      onClick={() => setRejectingId(r.id)}
                      className="size-8 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white flex items-center justify-center transition-colors shadow-sm"
                      title="Reject"
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                );
              },
            },
          ]}
        />
      </div>

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="size-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="font-display font-black text-text-light dark:text-text-dark">
                  Reject Verification Request
                </h4>
                <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark">
                  Specify details on why the request was rejected.
                </p>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-text-light dark:text-text-dark">
                  Rejection Reason
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark focus:border-red-500 outline-none text-sm transition-all"
                  placeholder="e.g. The uploaded license is expired, or the PDF file was corrupted and unreadable."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectReason("");
                  }}
                  className="px-4 py-2.5 rounded-full text-xs font-black text-subtext-light hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting === rejectingId}
                  className="px-5 py-2.5 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-black transition-colors shadow-md"
                >
                  Reject Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorVerificationsPage;
