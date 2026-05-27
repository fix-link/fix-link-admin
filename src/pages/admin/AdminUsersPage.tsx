import { useEffect, useState } from "react";
import { Filter, Search, ArrowUpDown, UserX, AlertCircle, CheckCircle } from "lucide-react";
import { listUsers, banUser } from "../../api/admin.api";
import DataTable from "../../components/DataTable";
import PageLoader from "../../components/PageLoader";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  
  // Suspension State
  const [suspendingUser, setSuspendingUser] = useState<any>(null);
  const [banReason, setBanReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = () => {
    setLoading(true);
    listUsers()
      .then((data) => {
        setUsers(data);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendingUser) return;
    setSubmitting(true);
    setMsg(null);
    try {
      const finalReason = banReason || "Deactivated by administrator.";
      await banUser(suspendingUser.id, finalReason);
      setMsg({ type: "success", text: `Successfully banned @${suspendingUser.username} and deactivated their account.` });
      setBanReason("");
      loadData();
      setTimeout(() => setSuspendingUser(null), 2000);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to de-activate account." });
    } finally {
      setSubmitting(false);
    }
  };

  // Perform client-side filtering and sorting on the fetched mock/real users
  const getProcessedUsers = () => {
    let result = [...users];

    // Category Filter
    if (category) {
      result = result.filter((u) => u.role === category);
    }

    // Name / Email Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          (u.username || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q)
      );
    }

    // Alphabetical Sorting by Username
    result.sort((a, b) => {
      const nameA = (a.username || "").toLowerCase();
      const nameB = (b.username || "").toLowerCase();
      if (sortAsc) {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

    return result;
  };

  if (loading) return <PageLoader />;

  const processedUsers = getProcessedUsers();

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">
          {processedUsers.length} accounts matching active criteria
        </p>

        {/* Dynamic Filtering Panel */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 dark:bg-gray-800/40 border border-border-light dark:border-border-dark backdrop-blur-md">
            <Filter size={14} className="text-primary" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-xs font-black border-none focus:outline-none text-text-light dark:text-text-dark"
            >
              <option value="">All Categories</option>
              <option value="customer">Customers</option>
              <option value="professional">Professionals</option>
              <option value="moderator">Moderators</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtext-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name/email..."
              className="h-9 pl-9 pr-4 w-48 sm:w-56 rounded-full bg-white/40 dark:bg-gray-800/40 border border-border-light dark:border-border-dark text-xs font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-light dark:text-text-dark"
            />
          </div>

          {/* A-Z Toggle */}
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="h-9 px-4 rounded-full bg-white/40 dark:bg-gray-800/40 border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-black transition-colors flex items-center gap-2 text-text-light dark:text-text-dark cursor-pointer"
          >
            <ArrowUpDown size={14} />
            {sortAsc ? "A-Z" : "Z-A"}
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-white/40 shadow-xl">
        <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-4">
          Fix Link Users Catalog
        </h3>
        <DataTable
          rows={processedUsers}
          columns={[
            {
              key: "username",
              header: "Username",
              render: (r) => (
                <span className="font-bold text-text-light dark:text-text-dark">
                  @{String(r.username)}
                </span>
              ),
            },
            { key: "email", header: "Email Address" },
            {
              key: "role",
              header: "Category",
              render: (r) => {
                const isPro = r.role === "professional";
                const isMod = r.role === "moderator";
                const isAdmin = r.role === "admin";
                return (
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      isPro
                        ? "bg-accent-purple/10 text-accent-purple"
                        : isMod
                        ? "bg-blue-500/10 text-blue-500"
                        : isAdmin
                        ? "bg-red-500/10 text-red-500"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {String(r.role)}
                  </span>
                );
              },
            },
            {
              key: "is_verified",
              header: "Verified",
              render: (r) => (
                <span className="text-xs font-bold text-subtext-light dark:text-subtext-dark">
                  {r.is_verified ? "Yes" : "No"}
                </span>
              ),
            },
            {
              key: "created_at",
              header: "Joined Date",
              render: (r) => (
                <span className="text-xs font-bold text-subtext-light dark:text-subtext-dark">
                  {r.created_at ? new Date(String(r.created_at)).toLocaleDateString() : "N/A"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Security Suspensions",
              render: (r) => {
                // If it is an admin or moderator, don't allow banning from this quick menu
                if (r.role === "admin" || r.role === "moderator") return null;

                const banned = (r as any).isDeactivated;
                return (
                  <div>
                    {banned ? (
                      <span className="text-xs font-black text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        Banned
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSuspendingUser(r);
                          setMsg(null);
                        }}
                        className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UserX size={13} />
                        Ban Account
                      </button>
                    )}
                  </div>
                );
              },
            },
          ]}
        />
      </div>

      {/* Account quick ban suspension dialog */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/40 shadow-2xl relative">
            <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">
              Confirm Suspension
            </h3>
            <p className="text-xs text-subtext-light dark:text-subtext-dark mb-6">
              Banning <span className="text-primary font-black">@{suspendingUser.username}</span> will prevent them from logging into their professional or customer account.
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
                  Reason for Suspension
                </label>
                <textarea
                  required
                  rows={3}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-xs font-bold leading-relaxed resize-none"
                  placeholder="e.g. Account deactivated due to multiple complaints or misconduct."
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendingUser(null)}
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

export default AdminUsersPage;
