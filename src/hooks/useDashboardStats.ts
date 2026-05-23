import { useEffect, useState } from "react";
import {
  listJobs,
  listNotifications,
  listPayments,
  listReviews,
  listUsers,
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
        const [users, jobs, payments, reviews, notifications] = await Promise.all([
          listUsers(),
          listJobs(),
          listPayments(),
          listReviews(),
          listNotifications(),
        ]);

        if (cancelled) return;

        const professionals = users.filter(
          (u: { role?: string }) => u.role === "professional"
        ).length;
        const customers = users.filter(
          (u: { role?: string }) => u.role === "customer"
        ).length;
        const activeStatuses = ["pending", "accepted", "booked", "in_progress"];
        const activeJobs = jobs.filter((j: { status?: string }) =>
          activeStatuses.includes(j.status || "")
        ).length;
        const disputedPayments = payments.filter(
          (p: { status?: string }) => p.status === "disputed"
        ).length;

        setStats({
          users: users.length,
          professionals,
          customers,
          jobs: jobs.length,
          activeJobs,
          payments: payments.length,
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
