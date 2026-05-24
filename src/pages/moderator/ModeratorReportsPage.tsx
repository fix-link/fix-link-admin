import { useEffect, useState } from "react";
import { listDisputes, listVerificationRequests } from "../../api/admin.api";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";
import { LineChart, BarChart, PieChart } from "../../components/CustomCharts";
import PageLoader from "../../components/PageLoader";
import { CheckCircle, Clock, Shield, TrendingUp } from "lucide-react";

interface Dispute {
  id: string;
  status: string;
  claimed_by_name: string | null;
  created_at: string;
  resolved_at?: string;
}
interface VerificationRequest {
  id: string;
  status: string;
  submitted_at: string;
}

const ModeratorReportsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);

  useEffect(() => {
    Promise.all([listDisputes(), listVerificationRequests()])
      .then(([d, v]) => {
        setDisputes(d as Dispute[]);
        setVerifications(v as VerificationRequest[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const myDisputes = disputes.filter((d) => d.claimed_by_name === user?.username);
  const resolvedDisputes = myDisputes.filter((d) => d.status === "resolved");
  const pendingDisputes = disputes.filter((d) => d.status === "open" || d.status === "in_review");
  const approvedVerifications = verifications.filter((v) => v.status === "approved");
  const pendingVerifications = verifications.filter((v) => v.status === "pending");

  // Build weekly bar chart data for the past 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const resolvedPerDay = last7Days.map((day) => {
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const value = resolvedDisputes.filter((d) => {
      const rd = new Date(d.resolved_at || d.created_at);
      return rd.toDateString() === day.toDateString();
    }).length;
    return { label, value };
  });

  const verifiedPerDay = last7Days.map((day) => {
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const value = approvedVerifications.filter((v) => {
      const vd = new Date(v.submitted_at);
      return vd.toDateString() === day.toDateString();
    }).length;
    return { label, value };
  });

  const disputeStatusPie = [
    { name: "Open", value: disputes.filter((d) => d.status === "open").length, color: "#f59e0b" },
    { name: "In Review", value: disputes.filter((d) => d.status === "in_review").length, color: "#8b5cf6" },
    { name: "Resolved", value: disputes.filter((d) => d.status === "resolved").length, color: "#10b981" },
  ];

  const verificationStatusPie = [
    { name: "Pending", value: pendingVerifications.length, color: "#f59e0b" },
    { name: "Approved", value: approvedVerifications.length, color: "#10b981" },
    { name: "Rejected", value: verifications.filter((v) => v.status === "rejected").length, color: "#ef4444" },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h3 className="text-xl font-display font-black text-text-light dark:text-text-dark">
          Your Performance Report
        </h3>
        <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark mt-1">
          Personal audit of your moderation activity — disputes handled, verification processed.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Cases Claimed"
          value={myDisputes.length}
          hint="By you personally"
          icon={Shield}
          accent="purple"
        />
        <StatCard
          label="Resolved"
          value={resolvedDisputes.length}
          hint="Successfully closed"
          icon={CheckCircle}
          accent="primary"
        />
        <StatCard
          label="Pending Queue"
          value={pendingDisputes.length}
          hint="Open + In Review platform-wide"
          icon={Clock}
          accent="gold"
        />
        <StatCard
          label="Verified Pros"
          value={approvedVerifications.length}
          hint="Approved verifications"
          icon={TrendingUp}
          accent="cyan"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60 space-y-4">
          <div>
            <h4 className="font-display font-black text-text-light dark:text-text-dark">
              Disputes Resolved — Last 7 Days
            </h4>
            <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-0.5">
              Daily count of cases you closed
            </p>
          </div>
          <BarChart data={resolvedPerDay} color="#3b82f6" />
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60 space-y-4">
          <div>
            <h4 className="font-display font-black text-text-light dark:text-text-dark">
              Verifications Processed — Last 7 Days
            </h4>
            <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-0.5">
              Approved professional credentials per day
            </p>
          </div>
          <BarChart data={verifiedPerDay} color="#8b5cf6" />
        </div>
      </div>

      {/* Pie charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60 space-y-4">
          <div>
            <h4 className="font-display font-black text-text-light dark:text-text-dark">
              Platform Dispute Status Breakdown
            </h4>
            <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-0.5">
              All disputes across the platform
            </p>
          </div>
          <PieChart data={disputeStatusPie} />
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60 space-y-4">
          <div>
            <h4 className="font-display font-black text-text-light dark:text-text-dark">
              Verification Requests Breakdown
            </h4>
            <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-0.5">
              Status distribution of all professional applications
            </p>
          </div>
          <PieChart data={verificationStatusPie} />
        </div>
      </div>

      {/* Recent activity table */}
      <div className="glass-panel rounded-3xl p-6 border border-border-light/60 dark:border-border-dark/60 space-y-4">
        <h4 className="font-display font-black text-text-light dark:text-text-dark">
          Recent Disputes Activity
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark">
                {["Case ID", "Claimed By", "Status", "Date"].map((h) => (
                  <th
                    key={h}
                    className="text-left pb-3 font-black text-subtext-light dark:text-subtext-dark uppercase tracking-wider text-[9px]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {disputes.slice(0, 10).map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-bold text-text-light dark:text-text-dark">
                    #{d.id.slice(0, 8)}
                  </td>
                  <td className="py-3 text-subtext-light dark:text-subtext-dark">
                    {d.claimed_by_name || <span className="italic opacity-50">Unassigned</span>}
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                        d.status === "resolved"
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400"
                          : d.status === "in_review"
                          ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 text-subtext-light dark:text-subtext-dark">
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {disputes.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-subtext-light">
                    No dispute activity yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModeratorReportsPage;
