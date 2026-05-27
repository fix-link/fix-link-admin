import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  Star,
  Bell,
  Shield,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  CheckSquare,
  BarChart2,
  UserCog,
  AlertOctagon,
  Flag,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import type { StaffRole } from "../types/auth.types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  dividerBefore?: boolean;
}

const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/moderators", label: "Moderators", icon: UserCog, dividerBefore: true },
  { to: "/admin/moderator-activity", label: "Mod Activity", icon: CheckSquare },
  { to: "/admin/user-ban", label: "Banned Users", icon: AlertOctagon },
  { to: "/admin/ban-requests", label: "Ban Requests", icon: Flag },
  { to: "/admin/reports", label: "Analytics", icon: BarChart2 },
];

const moderatorNav: NavItem[] = [
  { to: "/moderator", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/moderator/verifications", label: "Verifications", icon: CheckSquare },
  { to: "/moderator/disputes", label: "Disputes", icon: AlertOctagon },
  { to: "/moderator/jobs", label: "Jobs queue", icon: Briefcase, dividerBefore: true },
  { to: "/moderator/reports", label: "My Reports", icon: BarChart2 },
];

interface Props {
  role: StaffRole;
  title: string;
  subtitle: string;
}

const StaffLayout = ({ role, title, subtitle }: Props) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = role === "admin" ? adminNav : moderatorNav;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "Staff";

  const SidebarContent = () => (
    <>
      <div className="px-6 py-8 border-b border-border-light/50 dark:border-border-dark/50">
        <h1 className="text-2xl font-display font-black text-gradient">Fix-Link</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mt-1">
          {role} portal
        </p>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-0.5 overflow-y-auto">
        {nav.map((item) => (
          <div key={item.to}>
            {item.dividerBefore && (
              <div className="h-px bg-border-light/60 dark:bg-border-dark/60 my-3 mx-2" />
            )}
            <NavLink
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-subtext-light dark:text-subtext-dark hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-text-light dark:hover:text-text-dark"
                }`
              }
            >
              <item.icon size={18} className="shrink-0" />
              {item.label}
            </NavLink>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-border-light/50 dark:border-border-dark/50 space-y-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-subtext-light dark:text-subtext-dark hover:bg-slate-100 dark:hover:bg-slate-800/80"
        >
          {theme === "dark" ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <LogOut size={18} className="shrink-0" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans flex">
      <aside className="hidden lg:flex w-64 flex-col border-r border-border-light/60 dark:border-border-dark/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shrink-0">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] h-full flex flex-col bg-white dark:bg-slate-900 shadow-2xl">
            <button
              type="button"
              className="absolute top-4 right-4 p-2"
              onClick={() => setMobileOpen(false)}
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 border-b border-border-light/60 dark:border-border-dark/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl border border-border-light dark:border-border-dark"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-display font-black text-text-light dark:text-text-dark truncate">
                {title}
              </h2>
              <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark truncate">
                {subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs font-black uppercase tracking-widest text-primary px-3 py-1.5 rounded-full bg-primary/10">
              {role}
            </span>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-text-light dark:text-text-dark">{displayName}</p>
              <p className="text-[10px] text-subtext-light dark:text-subtext-dark">{user?.email}</p>
            </div>
            <div className="size-10 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-white font-black text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
