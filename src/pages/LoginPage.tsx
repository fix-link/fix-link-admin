import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginStaff } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { getStaffHomePath } from "../types/auth.types";
import PageLoader from "../components/PageLoader";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <PageLoader fullScreen />;

  if (isAuthenticated && user) {
    if (user.isDeactivated) {
      navigate("/deactivated", { replace: true });
    } else if (user.mustChangePassword) {
      navigate("/moderator/change-password", { replace: true });
    } else {
      navigate(getStaffHomePath(user.role), { replace: true });
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginStaff(email, password);
      login(res.access, res.refresh, res.user);
      if (res.user.isDeactivated) {
        navigate("/deactivated");
      } else if (res.user.mustChangePassword) {
        navigate("/moderator/change-password");
      } else {
        navigate(getStaffHomePath(res.user.role));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-background-light dark:bg-background-dark overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-blob" />
        <div
          className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl animate-blob"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-extrabold text-gradient mb-2 tracking-tight">
            Fix Link
          </h1>
          <p className="text-subtext-light dark:text-subtext-dark font-medium">
            Staff portal — administrators &amp; moderators
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl shadow-xl border border-white/40">
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2">
            Sign in
          </h2>
          <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark mb-6">
            Customer and professional accounts cannot access this app.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-light dark:text-text-dark ml-1">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtext-light" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-full bg-white/50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                  placeholder="admin@fixlink.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-light dark:text-text-dark ml-1">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtext-light" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-12 rounded-full bg-white/50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-subtext-light"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-light text-white rounded-full font-black flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-70 transition-all"
            >
              {loading ? (
                <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Enter portal
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-6 uppercase tracking-widest">
          Separate from customer &amp; professional app
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
