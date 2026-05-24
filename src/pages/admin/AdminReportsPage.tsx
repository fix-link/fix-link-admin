import { useEffect, useState } from "react";
import { Users, Briefcase, DollarSign, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import { listUsers, listJobs, listPayments, listDisputes } from "../../api/admin.api";
import StatCard from "../../components/StatCard";
import { LineChart, BarChart, PieChart } from "../../components/CustomCharts";
import PageLoader from "../../components/PageLoader";

const AdminReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [jobs, setJobs] = useState<Record<string, unknown>[]>([]);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [disputes, setDisputes] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    Promise.all([listUsers(), listJobs(), listPayments(), listDisputes()])
      .then(([u, j, p, d]) => {
        setUsers(u as Record<string, unknown>[]);
        setJobs(j as Record<string, unknown>[]);
        setPayments(p as Record<string, unknown>[]);
        setDisputes(d as Record<string, unknown>[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  // --- Derived Metrics ---
  const professionals = users.filter((u) => u.role === "professional");
  const customers = users.filter((u) => u.role === "customer");
  const totalRevenue = payments
    .filter((p) => p.status === "released" || p.status === "completed" || p.status === "succeeded")
    .reduce((acc, p) => acc + parseFloat(String(p.amount || "0")), 0);
  const totalEscrow = payments
    .filter((p) => p.status === "held")
    .reduce((acc, p) => acc + parseFloat(String(p.amount || "0")), 0);
  const openDisputes = disputes.filter((d) => d.status === "open" || d.status === "in_review");

  // Platform Fee (e.g. 10% of all released payments)
  const platformFee = totalRevenue * 0.1;

  // --- Chart Data ---
  // User growth by month (last 6 months from created_at)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d;
  });

  const userGrowthData = last6Months.map((month) => {
    const label = month.toLocaleDateString("en-US", { month: "short" });
    const value = users.filter((u) => {
      const created = new Date(String(u.created_at || ""));
      return created.getFullYear() === month.getFullYear() && created.getMonth() === month.getMonth();
    }).length;
    return { label, value };
  });

  const paymentStatusData = last6Months.map((month) => {
    const label = month.toLocaleDateString("en-US", { month: "short" });
    const value = payments.filter((p) => {
      const created = new Date(String(p.created_at || ""));
      return (
        created.getFullYear() === month.getFullYear() &&
        created.getMonth() === month.getMonth() &&
        (p.status === "released" || p.status === "succeeded" || p.status === "completed")
      );
    }).reduce((acc, p) => acc + parseFloat(String(p.amount || "0")), 0);
    return { label, value: Math.round(value) };
  });

  const userRolePie = [
    { name: "Professionals", value: professionals.length, color: "#3b82f6" },
    { name: "Customers", value: customers.length, color: "#8b5cf6" },
    { name: "Staff", value: users.filter((u) => u.role === "admin" || u.role === "moderator").length, color: "#06b6d4" },
  ];

  const jobStatusPie = [
    { name: "Pending", value: jobs.filter((j) => j.status === "pending").length, color: "#f59e0b" },
    { name: "In Progress", value: jobs.filter((j) => j.status === "in_progress").length, color: "#3b82f6" },
    { name: "Done", value: jobs.filter((j) => j.status === "done").length, color: "#10b981" },
    { name: "Disputed", value: jobs.filter((j) => j.status === "disputed").length, color: "#ef4444" },
    { name: "Cancelled", value: jobs.filter((j) => j.status === "cancelled").length, color: "#94a3b8" },
  ];

  const paymentStatusPie = [
    { name: "Held (Escrow)", value: payments.filter((p) => p.status === "held").length, color: "#f59e0b" },
    { name: "Released", value: payments.filter((p) => p.status === "released" || p.status === "succeeded").length, color: "#10b981" },
    { name: "Refunded", value: payments.filter((p) => p.status === "refunded").length, color: "#ef4444" },
    { name: "Disputed", value: payments.filter((p) => p.status === "disputed").length, color: "#8b5cf6" },
    { name: "Pending", value: payments.filter((p) => p.status === "pending" || p.status === "initiated").length, color: "#94a3b8" },
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
        <StatCard label="Total Users" value={users.length} hint={`${professionals.length} pros · ${customers.length} customers`} icon={Users} />
        <StatCard label="Total Jobs" value={jobs.length} hint={`${jobs.filter((j) => j.status === "in_progress").length} active`} icon={Briefcase} accent="cyan" />
        <StatCard label="Total Payments" value={payments.length} hint="All transactions" icon={DollarSign} accent="purple" />
        <StatCard label="Revenue Collected" value={`$${platformFee.toFixed(0)}`} hint="Platform fee (10%)" icon={TrendingUp} accent="gold" />
        <StatCard label="Escrow Held" value={`$${totalEscrow.toFixed(0)}`} hint="Pending release" icon={DollarSign} />
        <StatCard label="Open Disputes" value={openDisputes.length} hint="Requiring attention" icon={AlertTriangle} accent="gold" />
      </div>

      {/* Line Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60 space-y-4">
          <div>
            <h4 className="font-display font-black text-text-light dark:text-text-dark">
              User Growth — Last 6 Months
            </h4>
            <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-0.5">
              New accounts registered each month
            </p>
          </div>
          <LineChart data={userGrowthData} color="#3b82f6" gradientId="user-growth" />
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60 space-y-4">
          <div>
            <h4 className="font-display font-black text-text-light dark:text-text-dark">
              Revenue Timeline — Last 6 Months
            </h4>
            <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-0.5">
              Cumulative payment value successfully released to professionals
            </p>
          </div>
          <LineChart data={paymentStatusData} color="#8b5cf6" gradientId="revenue-trend" />
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
            { label: "Gross Transaction Volume", value: `$${totalRevenue.toFixed(2)}`, sub: "All released payments" },
            { label: "Platform Fee Collected", value: `$${platformFee.toFixed(2)}`, sub: "10% of gross volume" },
            { label: "Funds in Escrow", value: `$${totalEscrow.toFixed(2)}`, sub: "Awaiting release" },
            { label: "Avg. Transaction", value: payments.length > 0 ? `$${(totalRevenue / Math.max(payments.length, 1)).toFixed(2)}` : "$0", sub: "Per payment record" },
          ].map((item) => (
            <div key={item.label} className="space-y-1.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark">
                {item.label}
              </p>
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
        <BarChart
          data={last6Months.map((month) => ({
            label: month.toLocaleDateString("en-US", { month: "short" }),
            value: disputes.filter((d) => {
              const created = new Date(String(d.created_at || ""));
              return created.getFullYear() === month.getFullYear() && created.getMonth() === month.getMonth();
            }).length,
          }))}
          color="#ef4444"
        />
      </div>
    </div>
  );
};

export default AdminReportsPage;
