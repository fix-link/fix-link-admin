// AdminModeratorDetailPage
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Activity, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { fetchModeratorDetail } from "../../api/admin.api";
import PageLoader from "../../components/PageLoader";

const AdminModeratorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchModeratorDetail(id)
        .then(setDetail)
        .catch(() => setDetail(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <PageLoader />;

  if (!detail) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-text-light dark:text-text-dark">
          Moderator profile not found
        </h3>
        <Link to="/admin/moderator-activity" className="text-primary hover:underline mt-2 inline-block">
          Go back to Moderator Activity
        </Link>
      </div>
    );
  }

  const { stats } = detail;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/moderator-activity"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-subtext-light dark:text-subtext-dark transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-text-light dark:text-text-dark">
            @{detail.username}
          </h2>
          <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-wider">
            {detail.email} • Last Active: {new Date(detail.last_active).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Aggregate Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl text-center">
          <div className="size-10 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={20} />
          </div>
          <h4 className="text-2xl font-black text-text-light dark:text-text-dark">{stats?.verifications_approved ?? 0}</h4>
          <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-wider">
            Approved Verif.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl text-center">
          <div className="size-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-3">
            <XCircle size={20} />
          </div>
          <h4 className="text-2xl font-black text-text-light dark:text-text-dark">{stats?.verifications_rejected ?? 0}</h4>
          <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-wider">
            Rejected Verif.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl text-center">
          <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={20} />
          </div>
          <h4 className="text-2xl font-black text-text-light dark:text-text-dark">{stats?.disputes_claimed ?? 0}</h4>
          <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-wider">
            Claims Taken
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl text-center">
          <div className="size-10 rounded-2xl bg-accent-purple/10 text-accent-purple flex items-center justify-center mx-auto mb-3">
            <Activity size={20} />
          </div>
          <h4 className="text-2xl font-black text-text-light dark:text-text-dark">{stats?.disputes_resolved ?? 0}</h4>
          <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-wider">
            Disputes Resolved
          </p>
        </div>
      </div>

      {/* Profile & Performance Review */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-white/40 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-text-light dark:text-text-dark flex items-center gap-2">
            <User size={18} />
            Moderator Profile
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase text-subtext-light dark:text-subtext-dark tracking-wider">
                Staff Identity
              </p>
              <p className="text-sm font-bold text-text-light dark:text-text-dark">
                ID: {detail.id}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-subtext-light dark:text-subtext-dark tracking-wider">
                Account Status
              </p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-green-500/10 text-green-600 dark:text-green-400 mt-1">
                Active Staff
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-subtext-light dark:text-subtext-dark tracking-wider">
                Authority Role
              </p>
              <p className="text-sm font-bold text-primary">Moderator Level 1</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/40 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-text-light dark:text-text-dark flex items-center gap-2">
            <Activity size={18} />
            Action Log & Dispute Decisions
          </h3>

          {detail.timeline && detail.timeline.length > 0 ? (
            <div className="relative border-l border-border-light dark:border-border-dark ml-3 pl-6 space-y-6">
              {detail.timeline.map((t: any) => (
                <div key={t.id} className="relative group">
                  {/* Bullet */}
                  <span className="absolute -left-[31px] top-1.5 size-4 rounded-full border-2 border-primary bg-background-light dark:bg-background-dark group-hover:bg-primary transition-colors flex items-center justify-center">
                    <span className="size-1.5 rounded-full bg-primary group-hover:bg-white" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-wider block">
                      {new Date(t.date).toLocaleString()}
                    </span>
                    <h4 className="text-sm font-black text-text-light dark:text-text-dark mt-0.5">
                      {t.action}
                    </h4>
                    <p className="text-xs font-bold text-primary mt-0.5">
                      Target: {t.target}
                    </p>
                    <p className="text-xs font-medium text-subtext-light dark:text-subtext-dark mt-2 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-border-light/30 dark:border-border-dark/30">
                      {t.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark text-center py-12">
              No actions logged for this moderator yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModeratorDetailPage;
