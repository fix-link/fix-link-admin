import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "primary" | "purple" | "cyan" | "gold";
}

const accentMap = {
  primary: "bg-primary/10 text-primary",
  purple: "bg-accent-purple/10 text-accent-purple",
  cyan: "bg-accent-cyan/10 text-accent-cyan",
  gold: "bg-accent-gold/10 text-amber-600",
};

const StatCard = ({ label, value, hint, icon: Icon, accent = "primary" }: Props) => (
  <div className="glass-panel rounded-2xl p-6 border border-border-light/60 dark:border-border-dark/60 hover:shadow-glass-hover transition-shadow h-full flex flex-col justify-between">
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-subtext-light dark:text-subtext-dark">
          {label}
        </p>
        <p className="text-3xl font-display font-black text-text-light dark:text-text-dark mt-2">
          {value}
        </p>
        {hint ? (
          <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark mt-2">
            {hint}
          </p>
        ) : (
          <p className="text-xs font-bold text-transparent select-none mt-2">
            &nbsp;
          </p>
        )}
      </div>
      <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${accentMap[accent]}`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

export default StatCard;
