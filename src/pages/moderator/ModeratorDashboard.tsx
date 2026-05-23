import { Briefcase, Star, Shield, AlertTriangle } from "lucide-react";
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

      <div className="glass-panel rounded-2xl p-6 border-l-4 border-accent-purple">
        <p className="text-sm font-bold text-text-light dark:text-text-dark">
          Moderator workspace — review jobs, flagged content, and user reports. You do not have full admin settings access.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Moderation queue" value={queueSize} hint="Active + disputes" icon={Shield} accent="purple" />
        <StatCard label="Active jobs" value={stats.activeJobs} icon={Briefcase} accent="cyan" />
        <StatCard label="Open disputes" value={stats.disputedPayments} icon={AlertTriangle} accent="gold" />
        <StatCard label="Reviews" value={stats.reviews} icon={Star} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/moderator/jobs"
          className="glass-panel rounded-2xl p-6 hover:shadow-glass-hover transition-shadow text-center"
        >
          <Briefcase className="mx-auto text-primary mb-3" size={28} />
          <p className="font-black text-text-light dark:text-text-dark">Jobs queue</p>
          <p className="text-xs text-subtext-light dark:text-subtext-dark mt-1 font-bold">
            Review pending & in-progress work
          </p>
        </Link>
        <Link
          to="/moderator/reviews"
          className="glass-panel rounded-2xl p-6 hover:shadow-glass-hover transition-shadow text-center"
        >
          <Star className="mx-auto text-accent-gold mb-3" size={28} />
          <p className="font-black text-text-light dark:text-text-dark">Reviews</p>
          <p className="text-xs text-subtext-light dark:text-subtext-dark mt-1 font-bold">
            Moderate ratings & comments
          </p>
        </Link>
        <Link
          to="/moderator/reports"
          className="glass-panel rounded-2xl p-6 hover:shadow-glass-hover transition-shadow text-center"
        >
          <Shield className="mx-auto text-accent-purple mb-3" size={28} />
          <p className="font-black text-text-light dark:text-text-dark">Reports</p>
          <p className="text-xs text-subtext-light dark:text-subtext-dark mt-1 font-bold">
            User flags & policy issues
          </p>
        </Link>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
