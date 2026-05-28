import { useEffect, useState } from "react";
import {
  fetchReportsSummary,
  listNotifications,
  listReviews,
} from "../api/admin.api";

export interface DashboardStats {
  users: number;
  professionals: number;
  customers: number;
  jobs: number;
  activeJobs: number;
  payments: number;
  reviews: number;
  notifications: number;
  disputedPayments: number;
}

const empty: DashboardStats = {
  users: 0,
  professionals: 0,
  customers: 0,
  jobs: 0,
  activeJobs: 0,
  payments: 0,
  reviews: 0,
  notifications: 0,
  disputedPayments: 0,
};

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [summary, reviews, notifications] = await Promise.all([
          fetchReportsSummary(),
          listReviews(),
          listNotifications(),
        ]);

        if (cancelled) return;

        const userTotals = summary.user_totals;
        const jobTotals = summary.job_totals;
        const paymentTotals = summary.payment_totals;

        const users = Object.values(userTotals).reduce((a, b) => a + b, 0);
        const professionals = userTotals["professional"] ?? 0;
        const customers = userTotals["customer"] ?? 0;

        const jobs = Object.values(jobTotals).reduce((a, b) => a + b, 0);
        const activeJobs =
          (jobTotals["pending"] ?? 0) +
          (jobTotals["booked"] ?? 0) +
          (jobTotals["in_progress"] ?? 0);

        const payments = Object.values(paymentTotals).reduce((a, b) => a + b, 0);
        const disputedPayments = paymentTotals["disputed"] ?? 0;

        setStats({
          users,
          professionals,
          customers,
          jobs,
          activeJobs,
          payments,
          reviews: reviews.length,
          notifications: notifications.length,
          disputedPayments,
        });
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load dashboard data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
};
