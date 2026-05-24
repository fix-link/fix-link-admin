import { Briefcase, Star, Shield, AlertTriangle, CheckSquare, AlertOctagon, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../../components/StatCard";
import PageLoader from "../../components/PageLoader";
import { useDashboardStats } from "../../hooks/useDashboardStats";

const ModeratorDashboard = () => {
  const { stats, loading, error } = useDashboardStats();

  if (loading) return <PageLoader />;

  const queueSize = stats.activeJobs + stats.disputedPayments;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 text-amber-800 dark:text-amber-300 text-sm font-bold">
          {error}
        </div>
      )}

      <div className="glass-panel rounded-2xl p-5 border-l-4 border-accent-purple flex items-center gap-4">
        <Shield className="text-accent-purple shrink-0" size={24} />
        <p className="text-sm font-bold text-text-light dark:text-text-dark">
          Moderator workspace — verify professionals, manage disputes, and moderate platform content.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Moderation queue"  value={queueSize}               hint="Active + disputes"    icon={Shield}        accent="purple" />
        <StatCard label="Active jobs"        value={stats.activeJobs}         icon={Briefcase}            accent="cyan"   />
        <StatCard label="Open disputes"      value={stats.disputedPayments}   icon={AlertTriangle}        accent="gold"   />
        <StatCard label="Reviews"            value={stats.reviews}            icon={Star}                                />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            to: "/moderator/verifications",
            icon: CheckSquare,
            iconColor: "text-primary",
            label: "Verification Queue",
            desc: "Review professional credentials & approve documents",
          },
          {
            to: "/moderator/disputes",
            icon: AlertOctagon,
            iconColor: "text-red-500",
            label: "Dispute Center",
            desc: "Claim, audit chats, and resolve escrow disputes",
          },
          {
            to: "/moderator/jobs",
            icon: Briefcase,
            iconColor: "text-accent-cyan",
            label: "Jobs Queue",
            desc: "Review pending & in-progress work contracts",
          },
          {
            to: "/moderator/reviews",
            icon: Star,
            iconColor: "text-amber-500",
            label: "Reviews",
            desc: "Moderate ratings, flag fraudulent reviews",
          },
          {
            to: "/moderator/reports",
            icon: BarChart2,
            iconColor: "text-accent-purple",
            label: "My Reports",
            desc: "Track your personal moderation performance",
          },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="glass-panel rounded-2xl p-6 hover:shadow-glass-hover transition-all group border border-border-light/60 dark:border-border-dark/60"
          >
            <item.icon
              className={`mb-3 ${item.iconColor} group-hover:scale-110 transition-transform`}
              size={28}
            />
            <p className="font-display font-black text-text-light dark:text-text-dark">{item.label}</p>
            <p className="text-xs text-subtext-light dark:text-subtext-dark mt-1 font-bold leading-relaxed">
              {item.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ModeratorDashboard;
