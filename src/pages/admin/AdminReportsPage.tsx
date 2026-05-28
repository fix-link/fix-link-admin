import { useEffect, useState } from "react";
import { Users, Briefcase, DollarSign, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import { fetchReportsSummary, type ReportsSummary } from "../../api/admin.api";
import StatCard from "../../components/StatCard";
import { LineChart, BarChart, PieChart } from "../../components/CustomCharts";
import PageLoader from "../../components/PageLoader";

const AdminReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReportsSummary | null>(null);

  useEffect(() => {
    fetchReportsSummary()
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!summary) return null;

  // --- Derived Metrics from backend summary ---
  const totalUsers = Object.values(summary.user_totals).reduce((a, b) => a + b, 0);
  const professionals = summary.user_totals["professional"] ?? 0;
  const customers = summary.user_totals["customer"] ?? 0;
  const totalJobs = Object.values(summary.job_totals).reduce((a, b) => a + b, 0);
  const activeJobs =
    (summary.job_totals["pending"] ?? 0) +
    (summary.job_totals["in_progress"] ?? 0) +
    (summary.job_totals["booked"] ?? 0);
  const totalPayments = Object.values(summary.payment_totals).reduce((a, b) => a + b, 0);
  const openDisputes =
    (summary.dispute_totals["open"] ?? 0) +
    (summary.dispute_totals["in_review"] ?? 0);
  const escrowHeld = parseFloat(summary.escrow_held);
  const platformFee = parseFloat(summary.platform_fee_collected);
  const grossReleased = platformFee / 0.1;

  // --- Chart Data from timeline ---
  const timeline = summary.timeline;
  const monthLabel = (key: string) => {
    const [year, month] = key.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, 1)
      .toLocaleDateString("en-US", { month: "short" });
  };

  const userGrowthData = timeline.map((t) => ({ label: monthLabel(t.month), value: t.users }));
  const revenueTimelineData = timeline.map((t) => ({ label: monthLabel(t.month), value: Math.round(parseFloat(String(t.revenue))) }));
  const disputeTimelineData = timeline.map((t) => ({ label: monthLabel(t.month), value: t.disputes }));

  // --- Pie chart data from status dictionaries ---
  const userRolePie = [
    { name: "Professionals", value: professionals, color: "#3b82f6" },
    { name: "Customers", value: customers, color: "#8b5cf6" },
    { name: "Staff", value: (summary.user_totals["admin"] ?? 0) + (summary.user_totals["moderator"] ?? 0), color: "#06b6d4" },
  ];

  const jobStatusPie = [
    { name: "Pending", value: summary.job_totals["pending"] ?? 0, color: "#f59e0b" },
    { name: "In Progress", value: summary.job_totals["in_progress"] ?? 0, color: "#3b82f6" },
    { name: "Done", value: summary.job_totals["done"] ?? 0, color: "#10b981" },
    { name: "Disputed", value: summary.job_totals["disputed"] ?? 0, color: "#ef4444" },
    { name: "Cancelled", value: summary.job_totals["cancelled"] ?? 0, color: "#94a3b8" },
  ];

  const paymentStatusPie = [
    { name: "Held (Escrow)", value: summary.payment_totals["held"] ?? 0, color: "#f59e0b" },
    { name: "Released", value: (summary.payment_totals["released"] ?? 0) + (summary.payment_totals["succeeded"] ?? 0), color: "#10b981" },
    { name: "Refunded", value: summary.payment_totals["refunded"] ?? 0, color: "#ef4444" },
    { name: "Disputed", value: summary.payment_totals["disputed"] ?? 0, color: "#8b5cf6" },
    { name: "Pending", value: (summary.payment_totals["pending"] ?? 0) + (summary.payment_totals["initiated"] ?? 0), color: "#94a3b8" },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h3 className="text-xl font-display font-black text-text-light dark:text-text-dark">
          Executive Analytics
        </h3>
        <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark mt-1">
          Full platform health — revenue, users, jobs, and dispute metrics at a glance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Users" value={totalUsers} hint={`${professionals} pros · ${customers} customers`} icon={Users} />
        <StatCard label="Total Jobs" value={totalJobs} hint={`${activeJobs} active`} icon={Briefcase} accent="cyan" />
        <StatCard label="Total Payments" value={totalPayments} hint="All transactions" icon={DollarSign} accent="purple" />
        <StatCard label="Revenue Collected" value={`$${platformFee.toFixed(0)}`} hint="Platform fee (10%)" icon={TrendingUp} accent="gold" />
        <StatCard label="Escrow Held" value={`$${escrowHeld.toFixed(0)}`} hint="Pending release" icon={Shield} />
        <StatCard label="Open Disputes" value={openDisputes} hint="Requiring attention" icon={AlertTriangle} accent="gold" />
      </div>

      {/* Line Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60 space-y-4">
          <div>
            <h4 className="font-display font-black text-text-light dark:text-text-dark">User Growth — Last 6 Months</h4>
            <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-0.5">New accounts registered each month</p>
          </div>
          <LineChart data={userGrowthData} color="#3b82f6" gradientId="user-growth" />
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60 space-y-4">
          <div>
            <h4 className="font-display font-black text-text-light dark:text-text-dark">Revenue Timeline — Last 6 Months</h4>
            <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-0.5">Platform fee collected from released payments</p>
          </div>
          <LineChart data={revenueTimelineData} color="#8b5cf6" gradientId="revenue-trend" />
        </div>
      </div>

      {/* Pie / Donut Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60 space-y-4">
          <div>
            <h4 className="font-display font-black text-text-light dark:text-text-dark">User Role Split</h4>
            <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-0.5">Customers vs. Professionals vs. Staff</p>
          </div>
          <PieChart data={userRolePie} />
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60 space-y-4">
          <div>
            <h4 className="font-display font-black text-text-light dark:text-text-dark">Job Status Split</h4>
            <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-0.5">Platform jobs by lifecycle stage</p>
          </div>
          <PieChart data={jobStatusPie} />
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60 space-y-4">
          <div>
            <h4 className="font-display font-black text-text-light dark:text-text-dark">Escrow Breakdown</h4>
            <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-0.5">Payment fund status distribution</p>
          </div>
          <PieChart data={paymentStatusPie} />
        </div>
      </div>

      {/* Revenue summary card */}
      <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60">
        <h4 className="font-display font-black text-text-light dark:text-text-dark mb-6">
          Transaction Revenue Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Gross Transaction Volume", value: `$${grossReleased.toFixed(2)}`, sub: "All released payments" },
            { label: "Platform Fee Collected", value: `$${platformFee.toFixed(2)}`, sub: "10% of gross volume" },
            { label: "Funds in Escrow", value: `$${escrowHeld.toFixed(2)}`, sub: "Awaiting release" },
            { label: "Avg. Transaction", value: totalPayments > 0 ? `$${(grossReleased / Math.max(totalPayments, 1)).toFixed(2)}` : "$0", sub: "Per payment record" },
          ].map((item) => (
            <div key={item.label} className="space-y-1.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark">{item.label}</p>
              <p className="text-2xl font-display font-black text-gradient">{item.value}</p>
              <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disputes breakdown bar chart */}
      <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60 space-y-4">
        <div>
          <h4 className="font-display font-black text-text-light dark:text-text-dark">Dispute Volume — Last 6 Months</h4>
          <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-0.5">
            Number of disputes created per month across the platform
          </p>
        </div>
        <BarChart data={disputeTimelineData} color="#ef4444" />
      </div>
    </div>
  );
};

export default AdminReportsPage;
