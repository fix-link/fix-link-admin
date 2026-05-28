import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Check, Key } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";

const ModeratorChangePasswordPage = () => {
  const { user, updateUser, logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/users/change-temp-password/", { password });

      setSuccess(true);
      updateUser({ mustChangePassword: false });
      
      setTimeout(() => {
        navigate("/moderator");
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-background-light dark:bg-background-dark overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-blob" />
        <div
          className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4 animate-pulse">
            <Key size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-display font-extrabold text-gradient mb-2 tracking-tight">
            Reset Password
          </h1>
          <p className="text-subtext-light dark:text-subtext-dark font-medium">
            First login password change requirement
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl shadow-xl border border-white/40">
          {success ? (
            <div className="text-center py-6">
              <div className="size-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Check size={32} strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-black text-text-light dark:text-text-dark mb-2">
                Password Updated!
              </h2>
              <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">
                Create new password
              </h2>
              <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark mb-6">
                Welcome, <span className="text-primary">@{user?.username}</span>. You were assigned a temporary password. For security, please choose a permanent one.
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-light dark:text-text-dark ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-subtext-light"
                    />
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

                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-light dark:text-text-dark ml-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-subtext-light"
                    />
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 pl-11 pr-12 rounded-full bg-white/50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-subtext-light"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 h-12 bg-white/10 hover:bg-white/20 dark:bg-gray-800/20 dark:hover:bg-gray-800/40 text-text-light dark:text-text-dark border border-border-light dark:border-border-dark rounded-full font-black transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 bg-gradient-to-r from-primary to-primary-light text-white rounded-full font-black flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-70 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Save Password"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeratorChangePasswordPage;
