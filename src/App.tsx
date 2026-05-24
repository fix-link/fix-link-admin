import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import StaffLayout from "./components/StaffLayout";
import PageLoader from "./components/PageLoader";
import LoginPage from "./pages/LoginPage";
import { getStaffHomePath, isStaffRole } from "./types/auth.types";

// ── Admin Pages ──────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminJobsPage = lazy(() => import("./pages/admin/AdminJobsPage"));
const AdminPaymentsPage = lazy(() => import("./pages/admin/AdminPaymentsPage"));
const AdminReviewsPage = lazy(() => import("./pages/admin/AdminReviewsPage"));
const AdminNotificationsPage = lazy(() => import("./pages/admin/AdminNotificationsPage"));
const AdminModeratorsPage = lazy(() => import("./pages/admin/AdminModeratorsPage"));
const AdminReportsPage = lazy(() => import("./pages/admin/AdminReportsPage"));
const AdminModeratorActivityPage = lazy(() => import("./pages/admin/AdminModeratorActivityPage"));
const AdminModeratorDetailPage = lazy(() => import("./pages/admin/AdminModeratorDetailPage"));
const AdminUserBanPage = lazy(() => import("./pages/admin/AdminUserBanPage"));

// ── Moderator Pages ───────────────────────────────────────────────────
const ModeratorDashboard = lazy(() => import("./pages/moderator/ModeratorDashboard"));
const ModeratorVerificationsPage = lazy(() => import("./pages/moderator/ModeratorVerificationsPage"));
const ModeratorDisputesPage = lazy(() => import("./pages/moderator/ModeratorDisputesPage"));
const ModeratorJobsPage = lazy(() => import("./pages/moderator/ModeratorJobsPage"));
const ModeratorReportsPage = lazy(() => import("./pages/moderator/ModeratorReportsPage"));
const ModeratorChangePasswordPage = lazy(() => import("./pages/moderator/ModeratorChangePasswordPage"));

// ── Auth Pages ────────────────────────────────────────────────────────
const DeactivatedNoticePage = lazy(() => import("./pages/auth/DeactivatedNoticePage"));

const Lazy = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader fullScreen />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.isDeactivated) return <Navigate to="/deactivated" replace />;
  if (user.mustChangePassword) return <Navigate to="/moderator/change-password" replace />;
  if (!isStaffRole(user.role)) return <Navigate to="/login" replace />;
  return <Navigate to={getStaffHomePath(user.role)} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/deactivated" element={<Lazy><DeactivatedNoticePage /></Lazy>} />
            <Route path="/moderator/change-password" element={<Lazy><ModeratorChangePasswordPage /></Lazy>} />
            <Route path="/" element={<RootRedirect />} />

            {/* ── Admin Routes ─────────────────────────────────────── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <StaffLayout
                    role="admin"
                    title="Admin dashboard"
                    subtitle="Full platform control for Fix-Link"
                  />
                </ProtectedRoute>
              }
            >
              <Route index element={<Lazy><AdminDashboard /></Lazy>} />
              <Route path="users" element={<Lazy><AdminUsersPage /></Lazy>} />
              <Route path="jobs" element={<Lazy><AdminJobsPage /></Lazy>} />
              <Route path="payments" element={<Lazy><AdminPaymentsPage /></Lazy>} />
              <Route path="reviews" element={<Lazy><AdminReviewsPage /></Lazy>} />
              <Route path="notifications" element={<Lazy><AdminNotificationsPage /></Lazy>} />
              <Route path="moderators" element={<Lazy><AdminModeratorsPage /></Lazy>} />
              <Route path="moderator-activity" element={<Lazy><AdminModeratorActivityPage /></Lazy>} />
              <Route path="moderator-detail/:id" element={<Lazy><AdminModeratorDetailPage /></Lazy>} />
              <Route path="user-ban" element={<Lazy><AdminUserBanPage /></Lazy>} />
              <Route path="reports" element={<Lazy><AdminReportsPage /></Lazy>} />
            </Route>

            {/* ── Moderator Routes ─────────────────────────────────── */}
            <Route
              path="/moderator"
              element={
                <ProtectedRoute role="moderator">
                  <StaffLayout
                    role="moderator"
                    title="Moderator dashboard"
                    subtitle="Content & dispute moderation"
                  />
                </ProtectedRoute>
              }
            >
              <Route index element={<Lazy><ModeratorDashboard /></Lazy>} />
              <Route path="verifications" element={<Lazy><ModeratorVerificationsPage /></Lazy>} />
              <Route path="disputes" element={<Lazy><ModeratorDisputesPage /></Lazy>} />
              <Route path="jobs" element={<Lazy><ModeratorJobsPage /></Lazy>} />
              <Route path="reports" element={<Lazy><ModeratorReportsPage /></Lazy>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
