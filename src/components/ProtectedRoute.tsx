import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { StaffRole } from "../types/auth.types";
import PageLoader from "./PageLoader";

interface Props {
  children: React.ReactNode;
  role: StaffRole;
}

const ProtectedRoute = ({ children, role }: Props) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader fullScreen />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    const redirect = user.role === "admin" ? "/admin" : "/moderator";
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
