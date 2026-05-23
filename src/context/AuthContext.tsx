import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { logoutStaff } from "../api/auth.api";
import type { StaffUser } from "../types/auth.types";

interface AuthContextValue {
  user: StaffUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (access: string, refresh: string, user: StaffUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_access_token");
    const saved = localStorage.getItem("admin_user");
    if (token && saved) {
      try {
        setUser(JSON.parse(saved));
        setIsAuthenticated(true);
      } catch {
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((access: string, refresh: string, staff: StaffUser) => {
    localStorage.setItem("admin_access_token", access);
    localStorage.setItem("admin_refresh_token", refresh);
    localStorage.setItem("admin_user", JSON.stringify(staff));
    setUser(staff);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem("admin_refresh_token");
    if (refresh) await logoutStaff(refresh);
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_user");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
