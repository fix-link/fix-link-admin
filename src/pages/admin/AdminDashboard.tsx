import { Users, Briefcase, CreditCard, AlertTriangle, Star, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../../components/StatCard";
import PageLoader from "../../components/PageLoader";
import { useDashboardStats } from "../../hooks/useDashboardStats";

const AdminDashboard = () => {
  const { stats, loading, error } = useDashboardStats();

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-sm font-bold">
          {error} — showing zeros until API access is configured for admin users.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard label="Total users" value={stats.users} hint={`${stats.professionals} pros · ${stats.customers} customers`} icon={Users} />
        <StatCard label="Jobs" value={stats.jobs} hint={`${stats.activeJobs} active`} icon={Briefcase} accent="cyan" />
        <StatCard label="Payments" value={stats.payments} hint={`${stats.disputedPayments} disputed`} icon={CreditCard} accent="purple" />
        <StatCard label="Reviews" value={stats.reviews} icon={Star} accent="gold" />
        <StatCard label="Notifications" value={stats.notifications} icon={Bell} />
        <StatCard label="Needs attention" value={stats.disputedPayments} hint="Open disputes" icon={AlertTriangle} accent="gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-border-light/60 dark:border-border-dark/60">
          <h3 className="text-lg font-display font-black text-text-light dark:text-text-dark mb-4">
            Quick actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: "/admin/users", label: "Manage users" },
              { to: "/admin/jobs", label: "All jobs" },
              { to: "/admin/payments", label: "Payments" },
              { to: "/admin/reviews", label: "Reviews" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-3 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary font-bold text-sm transition-colors text-center"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-border-light/60 dark:border-border-dark/60">
          <h3 className="text-lg font-display font-black text-text-light dark:text-text-dark mb-2">
            Admin capabilities
          </h3>
          <ul className="space-y-2 text-sm font-medium text-subtext-light dark:text-subtext-dark">
            <li>Full platform visibility (users, jobs, payments)</li>
            <li>User and payout oversight</li>
            <li>Dispute resolution (when backend endpoints are wired)</li>
            <li>System notifications broadcast</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
