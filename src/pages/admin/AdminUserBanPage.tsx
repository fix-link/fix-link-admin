import { useEffect, useState } from "react";
import { ShieldAlert, UserX, AlertOctagon, Settings, CheckCircle2, UserCheck } from "lucide-react";
import { fetchUserReportCounts, banUser } from "../../api/admin.api";
import DataTable from "../../components/DataTable";
import PageLoader from "../../components/PageLoader";

const AdminUserBanPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState<number>(3);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banReason, setBanReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchUserReportCounts()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setMsg(null);
    try {
      const finalReason = banReason || `Deactivated due to accumulated moderator reports (Threshold: ${threshold} reports exceeded).`;
      await banUser(selectedUser.id, finalReason);
      setMsg({ type: "success", text: `Successfully banned @${selectedUser.username}. Account is deactivated.` });
      setBanReason("");
      loadData();
      setTimeout(() => setSelectedUser(null), 2000);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to de-activate account." });
    } finally {
      setSubmitting(false);
    }
  };

  // Automatically trigger auto-ban check based on threshold
  const handleAutoBanTrigger = async (user: any) => {
    if (user.status === "banned") return;
    setLoading(true);
    try {
      const defaultReason = `Automated Deactivation: Account reached ${user.report_count} reports (Threshold set at ${threshold}).`;
      await banUser(user.id, defaultReason);
      loadData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  const activeReports = users.filter((u) => u.status !== "banned" && u.report_count >= threshold);
  const bannedCount = users.filter((u) => u.status === "banned").length;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">
          Track moderator-reported users, automate account suspensions, and manage active restrictions.
        </p>
        
        {/* Global Auto-Ban Settings Panel */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 dark:bg-gray-800/40 border border-border-light dark:border-border-dark backdrop-blur-md">
          <Settings size={18} className="text-primary animate-spin-slow" />
          <span className="text-xs font-black uppercase text-text-light dark:text-text-dark">
            Auto-Ban Threshold:
          </span>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="px-2 py-1 rounded-lg bg-background-light dark:bg-background-dark text-xs font-black border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value={2}>2 Reports</option>
            <option value={3}>3 Reports</option>
            <option value={4}>4 Reports</option>
            <option value={5}>5 Reports</option>
          </select>
        </div>
      </div>

      {/* Aggregate restriction indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl flex items-center gap-4 border border-white/40">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <AlertOctagon size={24} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-text-light dark:text-text-dark">
              {activeReports.length}
            </h4>
            <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-wider">
              Pending Auto-Bans
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center gap-4 border border-white/40">
          <div className="size-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <UserX size={24} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-text-light dark:text-text-dark">
              {bannedCount}
            </h4>
            <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-wider">
              Deactivated Accounts
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center gap-4 border border-white/40">
          <div className="size-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
            <UserCheck size={24} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-text-light dark:text-text-dark">
              {users.filter((u) => u.status === "active" && u.report_count < threshold).length}
            </h4>
            <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-wider">
              Safe / Below Threshold
            </p>
          </div>
        </div>
      </div>

      {activeReports.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
            <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
              There are {activeReports.length} user accounts with report counts equal to or higher than the Auto-Ban threshold ({threshold} reports).
            </p>
          </div>
          <button
            onClick={() => {
              activeReports.forEach((u) => handleAutoBanTrigger(u));
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:shadow-lg transition-all cursor-pointer"
          >
            Apply Auto-Suspensions
          </button>
        </div>
      )}

      {/* Main user report count table */}
      <div className="glass-panel p-6 rounded-3xl border border-white/40 shadow-xl">
        <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-4">
          Community Reports and Account Sanctions
        </h3>
        <DataTable
          rows={users}
          columns={[
            {
              key: "username",
              header: "User Account",
              render: (r) => (
                <div className="flex flex-col">
                  <span className="font-bold text-text-light dark:text-text-dark">@{String(r.username)}</span>
                  <span className="text-[10px] text-subtext-light dark:text-subtext-dark font-bold uppercase tracking-wider">{String(r.role)}</span>
                </div>
              ),
            },
            {
              key: "report_count",
              header: "Moderator Reports",
              render: (r) => (
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                    Number(r.report_count) >= threshold
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {Number(r.report_count)} Reports
                </span>
              ),
            },
            {
              key: "status",
              header: "Account State",
              render: (r) => (
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                    r.status === "banned"
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-green-500/10 text-green-600 dark:text-green-400"
                  }`}
                >
                  {r.status === "banned" ? "Deactivated" : "Active"}
                </span>
              ),
            },
            {
              key: "reason",
              header: "Restriction Reason",
              render: (r) => (
                <span className="text-xs text-subtext-light dark:text-subtext-dark font-medium leading-relaxed block max-w-xs truncate">
                  {String(r.reason || "None — Account in good standing")}
                </span>
              ),
            },
            {
              key: "joined_date",
              header: "Joined Date",
              render: (r) => (
                <span className="text-xs font-bold text-subtext-light dark:text-subtext-dark">
                  {new Date(String(r.joined_date)).toLocaleDateString()}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (r) => (
                <div>
                  {r.status === "banned" ? (
                    <span className="text-xs font-black text-green-500 flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      Suspended
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedUser(r);
                        setMsg(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors text-xs font-black cursor-pointer"
                    >
                      Ban User
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Account Deactivation Suspension Dialog */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/40 shadow-2xl relative">
            <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">
              Deactivate User Account
            </h3>
            <p className="text-xs text-subtext-light dark:text-subtext-dark mb-6">
              Suspending <span className="text-primary font-black">@{selectedUser.username}</span> will prevent them from accessing any client or staff interface on Fix-Link.
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

            <form onSubmit={handleBan} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-light dark:text-text-dark ml-1">
                  Reason for Suspension (Visible to User on login)
                </label>
                <textarea
                  required
                  rows={3}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-xs font-bold leading-relaxed resize-none"
                  placeholder="e.g. Account deactivated due to multiple community reports and failure to complete booked tasks."
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  disabled={submitting}
                  className="flex-1 h-12 bg-white/10 hover:bg-white/20 dark:bg-gray-800/20 dark:hover:bg-gray-800/40 text-text-light dark:text-text-dark border border-border-light dark:border-border-dark rounded-full font-black transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full font-black flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-70 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Confirm Suspension"
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

export default AdminUserBanPage;
