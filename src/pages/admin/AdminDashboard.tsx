import { Users, Briefcase, CreditCard, AlertTriangle, Star, Bell, UserCog, BarChart2 } from "lucide-react";
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

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total users"       value={stats.users}             hint={`${stats.professionals} pros · ${stats.customers} customers`} icon={Users}         />
        <StatCard label="Jobs"              value={stats.jobs}              hint={`${stats.activeJobs} active`}    icon={Briefcase}     accent="cyan"   />
        <StatCard label="Payments"          value={stats.payments}          hint={`${stats.disputedPayments} disputed`} icon={CreditCard}  accent="purple" />
        <StatCard label="Reviews"           value={stats.reviews}           icon={Star}                             accent="gold"   />
        <StatCard label="Notifications"     value={stats.notifications}     icon={Bell}                                            />
        <StatCard label="Needs attention"   value={stats.disputedPayments}  hint="Open disputes"                   icon={AlertTriangle} accent="gold"   />
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: "/admin/users",       label: "Manage users",    icon: Users,     iconColor: "text-primary",        desc: "View, edit, and manage all registered users" },
          { to: "/admin/jobs",        label: "All jobs",        icon: Briefcase, iconColor: "text-accent-cyan",    desc: "Browse every job posted on the platform" },
          { to: "/admin/payments",    label: "Payments",        icon: CreditCard, iconColor: "text-accent-purple", desc: "Monitor escrow transactions and refunds" },
          { to: "/admin/reviews",     label: "Reviews",         icon: Star,       iconColor: "text-amber-500",     desc: "View and moderate customer reviews" },
          { to: "/admin/notifications", label: "Notifications", icon: Bell,       iconColor: "text-primary",       desc: "Broadcast system-wide notifications" },
          { to: "/admin/moderators",  label: "Moderators",      icon: UserCog,    iconColor: "text-accent-purple", desc: "Create and manage your moderation team" },
          { to: "/admin/reports",     label: "Analytics",       icon: BarChart2,  iconColor: "text-green-500",     desc: "Revenue, user growth, and dispute reports" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="glass-panel rounded-2xl p-5 hover:shadow-glass-hover transition-all group border border-border-light/60 dark:border-border-dark/60"
          >
            <item.icon
              className={`mb-3 ${item.iconColor} group-hover:scale-110 transition-transform`}
              size={24}
            />
            <p className="font-display font-black text-sm text-text-light dark:text-text-dark">{item.label}</p>
            <p className="text-[11px] text-subtext-light dark:text-subtext-dark mt-1 font-bold leading-relaxed">
              {item.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* Platform notes */}
      <div className="glass-panel rounded-2xl p-6 border border-border-light/60 dark:border-border-dark/60">
        <h3 className="text-lg font-display font-black text-text-light dark:text-text-dark mb-3">
          Admin capabilities
        </h3>
        <ul className="space-y-2 text-sm font-medium text-subtext-light dark:text-subtext-dark grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary shrink-0" />
            Full platform visibility (users, jobs, payments)
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary shrink-0" />
            Moderator team management & account creation
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary shrink-0" />
            Dispute escalation and escrow override
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary shrink-0" />
            Executive analytics and revenue reporting
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary shrink-0" />
            System notifications broadcast
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary shrink-0" />
            Audit log access (read-only)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
