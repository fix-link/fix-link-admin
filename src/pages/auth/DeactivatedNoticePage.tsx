import { ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DeactivatedNoticePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-background-light dark:bg-background-dark overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-blob" />
        <div
          className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-blob"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-red-500/10 text-red-500 mb-4 animate-pulse">
            <ShieldAlert size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-display font-extrabold text-red-600 dark:text-red-500 mb-2 tracking-tight">
            Account Banned
          </h1>
          <p className="text-subtext-light dark:text-subtext-dark font-medium">
            Staff & User Deactivation Portal
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl shadow-xl border border-white/40 text-center">
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
            Access Revoked
          </h2>
          
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-left mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
              Reason for Deactivation
            </p>
            <p className="text-sm font-medium text-text-light dark:text-text-dark leading-relaxed">
              {user?.deactivationReason ||
                "Your account has been deactivated due to multiple community reports or severe policy violations."}
            </p>
          </div>

          <p className="text-xs text-subtext-light dark:text-subtext-dark font-bold mb-8">
            If you believe this is a mistake, please contact administration or support.
          </p>

          <button
            onClick={handleLogout}
            className="w-full h-12 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-full font-black flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/30 transition-all cursor-pointer"
          >
            <LogOut size={18} />
            Log Out & Return
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivatedNoticePage;
