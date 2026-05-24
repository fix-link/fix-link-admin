import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserCheck, MessageSquare, AlertCircle, RefreshCw, Key, ArrowRight } from "lucide-react";
import { fetchModeratorActivity, setTempPassword } from "../../api/admin.api";
import DataTable from "../../components/DataTable";
import PageLoader from "../../components/PageLoader";

const AdminModeratorActivityPage = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMod, setSelectedMod] = useState<any>(null);
  const [tempPass, setTempPass] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchModeratorActivity()
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSetTempPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMod || !tempPass) return;
    setSubmitting(true);
    setMsg(null);
    try {
      await setTempPassword(selectedMod.id, tempPass);
      setMsg({ type: "success", text: `Temporary password successfully updated for @${selectedMod.username}!` });
      setTempPass("");
      setTimeout(() => setSelectedMod(null), 2000);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to update temporary password." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">
          Review moderator actions, disputes resolved, and verification metrics.
        </p>
        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-subtext-light dark:text-subtext-dark transition-colors cursor-pointer"
          title="Reload data"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <UserCheck size={24} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-text-light dark:text-text-dark">
              {activities.reduce((acc, curr) => acc + (curr.verifications_approved || 0), 0)}
            </h4>
            <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-wider">
              Total Verifications
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-accent-purple/10 text-accent-purple flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-text-light dark:text-text-dark">
              {activities.reduce((acc, curr) => acc + (curr.disputes_resolved || 0), 0)}
            </h4>
            <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-wider">
              Disputes Resolved
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-text-light dark:text-text-dark">
              {activities.reduce((acc, curr) => acc + (curr.verifications_rejected || 0), 0)}
            </h4>
            <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-wider">
              Rejected Requests
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-white/40 shadow-xl">
        <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-4">
          Moderator Activity Ledger
        </h3>
        <DataTable
          rows={activities}
          columns={[
            {
              key: "username",
              header: "Moderator",
              render: (r) => (
                <div className="flex flex-col">
                  <span className="font-bold text-text-light dark:text-text-dark">@{String(r.username)}</span>
                  <span className="text-xs text-subtext-light dark:text-subtext-dark">{String(r.email)}</span>
                </div>
              ),
            },
            {
              key: "verifications_approved",
              header: "Approved Verif.",
              render: (r) => (
                <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-extrabold">
                  {Number(r.verifications_approved)}
                </span>
              ),
            },
            {
              key: "verifications_rejected",
              header: "Rejected Verif.",
              render: (r) => (
                <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-extrabold">
                  {Number(r.verifications_rejected)}
                </span>
              ),
            },
            {
              key: "disputes_resolved",
              header: "Disputes Resolved",
              render: (r) => (
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-extrabold">
                  {Number(r.disputes_resolved)}
                </span>
              ),
            },
            {
              key: "last_active",
              header: "Last Active",
              render: (r) => (
                <span className="text-xs font-bold text-subtext-light dark:text-subtext-dark">
                  {new Date(String(r.last_active)).toLocaleString()}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (r) => (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedMod(r);
                      setMsg(null);
                    }}
                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors flex items-center gap-1 text-xs font-black cursor-pointer"
                    title="Set Temporary Password"
                  >
                    <Key size={14} />
                    Reset Pass
                  </button>
                  <Link
                    to={`/admin/moderator-detail/${r.id}`}
                    className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center gap-1 text-xs font-black"
                  >
                    Details
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Temporary Password Reset Modal */}
      {selectedMod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/40 shadow-2xl relative">
            <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">
              Set Temporary Password
            </h3>
            <p className="text-xs text-subtext-light dark:text-subtext-dark mb-6">
              Setting a temporary password will force <span className="text-primary font-black">@{selectedMod.username}</span> to change their password upon their next login.
            </p>

            {msg && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm font-bold border ${
                  msg.type === "success"
                    ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                }`}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSetTempPass} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-light dark:text-text-dark ml-1">
                  Temporary Password
                </label>
                <input
                  type="text"
                  required
                  value={tempPass}
                  onChange={(e) => setTempPass(e.target.value)}
                  className="w-full h-12 px-4 rounded-full bg-white/50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold"
                  placeholder="e.g. TempPass123!"
                  minLength={8}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMod(null)}
                  disabled={submitting}
                  className="flex-1 h-12 bg-white/10 hover:bg-white/20 dark:bg-gray-800/20 dark:hover:bg-gray-800/40 text-text-light dark:text-text-dark border border-border-light dark:border-border-dark rounded-full font-black transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !tempPass}
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-black flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-70 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Save Temporary"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModeratorActivityPage;
