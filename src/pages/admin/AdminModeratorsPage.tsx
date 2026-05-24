import { useEffect, useState } from "react";
import { UserPlus, Shield, Power, Users } from "lucide-react";
import { listModerators, createModerator, toggleModeratorStatus } from "../../api/admin.api";
import StatCard from "../../components/StatCard";
import PageLoader from "../../components/PageLoader";

interface Moderator {
  id: string;
  username: string;
  email: string;
  active_disputes: number;
  resolved_disputes: number;
  is_active: boolean;
}

const AdminModeratorsPage = () => {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", first_name: "", last_name: "" });
  const [createError, setCreateError] = useState<string | null>(null);

  const loadModerators = () => {
    listModerators()
      .then((data) => setModerators(data as Moderator[]))
      .catch(() => setModerators([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadModerators();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setCreateError("Username, email, and password are required.");
      return;
    }
    setSubmitting("create");
    setCreateError(null);
    try {
      await createModerator({ ...form, role: "moderator" });
      setShowCreate(false);
      setForm({ username: "", email: "", password: "", first_name: "", last_name: "" });
      loadModerators();
    } catch (err) {
      setCreateError("Failed to create moderator. Username or email may already be taken.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    const action = currentActive ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this moderator account?`)) return;
    setSubmitting(id);
    try {
      await toggleModeratorStatus(id, !currentActive);
      loadModerators();
    } catch {
      alert("Failed to update moderator status.");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <PageLoader />;

  const activeMods = moderators.filter((m) => m.is_active);
  const totalResolved = moderators.reduce((acc, m) => acc + m.resolved_disputes, 0);
  const totalActive = moderators.reduce((acc, m) => acc + m.active_disputes, 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-display font-black text-text-light dark:text-text-dark">
            Moderator Staff Management
          </h3>
          <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark mt-1">
            Manage your moderation team — create accounts, monitor workloads, and activate/deactivate staff.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white text-xs font-black rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
        >
          <UserPlus size={14} />
          Add Moderator
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Staff" value={moderators.length} hint="All moderators" icon={Users} />
        <StatCard label="Active" value={activeMods.length} hint="Logged-in eligible" icon={Shield} accent="purple" />
        <StatCard label="Active Disputes" value={totalActive} hint="Across all staff" icon={Shield} accent="gold" />
        <StatCard label="Resolved Total" value={totalResolved} hint="Lifetime closures" icon={Shield} accent="cyan" />
      </div>

      {/* Moderators table */}
      <div className="glass-panel rounded-3xl border border-border-light/60 dark:border-border-dark/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/50">
          <h4 className="font-display font-black text-text-light dark:text-text-dark">
            Staff Roster
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border-light dark:border-border-dark">
              <tr>
                {["Moderator", "Email", "Active Cases", "Resolved", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-4 font-black uppercase tracking-widest text-[9px] text-subtext-light dark:text-subtext-dark"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {moderators.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-subtext-light text-sm font-bold">
                    No moderators yet. Add your first staff member above.
                  </td>
                </tr>
              ) : (
                moderators.map((mod) => (
                  <tr
                    key={mod.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-white font-black text-xs shrink-0">
                          {mod.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-black text-text-light dark:text-text-dark">
                          @{mod.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-subtext-light dark:text-subtext-dark">
                      {mod.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-black ${
                          mod.active_disputes > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-subtext-light dark:text-subtext-dark"
                        }`}
                      >
                        {mod.active_disputes}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-text-light dark:text-text-dark">
                      {mod.resolved_disputes}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                          mod.is_active
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                            : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                        }`}
                      >
                        {mod.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        disabled={submitting === mod.id}
                        onClick={() => handleToggle(mod.id, mod.is_active)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black transition-all disabled:opacity-50 ${
                          mod.is_active
                            ? "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400"
                            : "bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-500/10 dark:hover:bg-green-500/20 dark:text-green-400"
                        }`}
                      >
                        <Power size={11} />
                        {mod.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Moderator Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark p-6 rounded-3xl shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <UserPlus size={18} />
              </div>
              <div>
                <h4 className="font-display font-black text-text-light dark:text-text-dark">
                  Create Moderator Account
                </h4>
                <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark">
                  Share credentials securely with the new staff member.
                </p>
              </div>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-text-light dark:text-text-dark">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark focus:border-primary outline-none text-xs font-medium"
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-text-light dark:text-text-dark">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark focus:border-primary outline-none text-xs font-medium"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-text-light dark:text-text-dark">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark focus:border-primary outline-none text-xs font-medium"
                  placeholder="jane_mod"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-text-light dark:text-text-dark">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark focus:border-primary outline-none text-xs font-medium"
                  placeholder="jane@fixlink.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-text-light dark:text-text-dark">
                  Temporary Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark focus:border-primary outline-none text-xs font-medium"
                  placeholder="••••••••"
                />
                <p className="text-[9px] text-subtext-light font-bold mt-1">
                  Share this password securely with the new moderator. They should change it on first login.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setCreateError(null); }}
                  className="px-4 py-2.5 rounded-full text-xs font-black text-subtext-light hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting === "create"}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-light text-white text-xs font-black shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModeratorsPage;
