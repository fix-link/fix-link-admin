// AdminBanRequestsPage
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Phone, User, XCircle, Clock } from "lucide-react";
import { fetchBanRequests, approveBanRequest, rejectBanRequest } from "../../api/admin.api";
import PageLoader from "../../components/PageLoader";

type BanRequest = {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  report_count: number;
  reason: string;
  submitted_by: string;
  submitted_at: string;
  status: "pending" | "approved" | "rejected";
};

const statusColor = (s: BanRequest["status"]) => {
  if (s === "approved") return "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400";
  if (s === "rejected") return "bg-slate-100 text-subtext-light border-border-light dark:bg-slate-800";
  return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400";
};

const AdminBanRequestsPage = () => {
  const [requests, setRequests] = useState<BanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<BanRequest | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const load = () => {
    fetchBanRequests()
      .then((r) => setRequests(r as BanRequest[]))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (req: BanRequest) => {
    setActioning(req.id);
    try {
      await approveBanRequest(req.id, req.reason);
      load();
    } catch {
      alert("Failed to approve ban request.");
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActioning(rejectModal.id);
    try {
      await rejectBanRequest(rejectModal.id, rejectNotes);
      setRejectModal(null);
      setRejectNotes("");
      load();
    } catch {
      alert("Failed to reject ban request.");
    } finally {
      setActioning(null);
    }
  };

  if (loading) return <PageLoader />;

  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-text-light dark:text-text-dark">
            Ban Requests
          </h2>
          <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark mt-1">
            Moderators flagged these users for suspension. Review and take action.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-black text-text-light dark:text-text-dark">{pending.length} Pending</span>
          </div>
        </div>
      </div>

      {/* Pending requests */}
      {pending.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center space-y-3">
          <CheckCircle className="mx-auto text-green-500" size={48} />
          <p className="font-display font-black text-text-light dark:text-text-dark">All clear!</p>
          <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark">
            No pending ban requests from moderators.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-subtext-light dark:text-subtext-dark flex items-center gap-2">
            <Clock size={12} /> Awaiting Your Decision
          </h3>
          {pending.map((req) => (
            <div key={req.id} className="glass-panel rounded-3xl p-6 border border-amber-200/60 dark:border-amber-500/20 space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* User Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-black text-sm text-text-light dark:text-text-dark">@{req.username}</p>
                      <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-wider">
                        {req.role} account
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 ml-1">
                    <p className="text-xs text-subtext-light dark:text-subtext-dark">{req.email}</p>
                    <p className="text-xs font-bold text-primary flex items-center gap-1">
                      <Phone size={10} />{req.phone || "—"}
                    </p>
                  </div>
                </div>

                {/* Stats badges */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-black px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">
                    {req.report_count} reports
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400">
                    Pending
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-2xl p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1 flex items-center gap-1">
                  <AlertTriangle size={9} /> Moderator's Reason
                </p>
                <p className="text-xs font-medium text-text-light dark:text-text-dark leading-relaxed">{req.reason}</p>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark">
                  Submitted by <span className="text-text-light dark:text-text-dark">@{req.submitted_by}</span> on {new Date(req.submitted_at).toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setRejectModal(req); setRejectNotes(""); }}
                    disabled={actioning === req.id}
                    className="px-4 py-2 text-xs font-black rounded-full border border-border-light dark:border-border-dark text-subtext-light hover:text-text-light dark:hover:text-text-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    <XCircle size={12} className="inline mr-1" />Reject
                  </button>
                  <button
                    onClick={() => handleApprove(req)}
                    disabled={actioning === req.id}
                    className="px-4 py-2 text-xs font-black rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                  >
                    <CheckCircle size={12} className="inline mr-1" />Ban User
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolved history */}
      {resolved.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-subtext-light dark:text-subtext-dark">
            Resolution History
          </h3>
          <div className="glass-panel rounded-3xl border border-border-light/60 dark:border-border-dark/60 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/30">
                  {["User", "Phone", "Role", "Reports", "Submitted By", "Decision", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-black text-subtext-light dark:text-subtext-dark uppercase tracking-wider text-[9px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {resolved.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-text-light dark:text-text-dark">@{req.username}</td>
                    <td className="px-4 py-3 text-subtext-light dark:text-subtext-dark">{req.phone || "—"}</td>
                    <td className="px-4 py-3 text-subtext-light dark:text-subtext-dark capitalize">{req.role}</td>
                    <td className="px-4 py-3">
                      <span className="font-black text-red-500">{req.report_count}</span>
                    </td>
                    <td className="px-4 py-3 text-subtext-light dark:text-subtext-dark">@{req.submitted_by}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${statusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-subtext-light dark:text-subtext-dark">
                      {new Date(req.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-3xl border border-border-light dark:border-border-dark p-8 w-full max-w-md space-y-5 shadow-2xl">
            <div>
              <h4 className="font-display font-black text-text-light dark:text-text-dark text-lg">
                Reject Ban Request
              </h4>
              <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark mt-1">
                Rejecting ban request for @{rejectModal.username}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-light dark:text-text-dark">
                Rejection Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Explain why this ban request is being rejected..."
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark focus:border-primary outline-none text-xs font-medium resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRejectModal(null)}
                className="px-5 py-2 text-xs font-black rounded-full border border-border-light dark:border-border-dark text-subtext-light hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actioning === rejectModal.id}
                className="px-5 py-2 text-xs font-black rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:opacity-90 transition-all disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanRequestsPage;
