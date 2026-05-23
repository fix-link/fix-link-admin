import { AlertTriangle, Flag, MessageSquare } from "lucide-react";

/** Placeholder until backend report/flag endpoints exist. */
const ModeratorReportsPage = () => {
  const placeholders = [
    {
      icon: Flag,
      title: "User reports",
      desc: "Flagged profiles and abusive behavior — connect to /reports/ API when ready.",
    },
    {
      icon: MessageSquare,
      title: "Message flags",
      desc: "Conversation moderation queue from WebSocket events.",
    },
    {
      icon: AlertTriangle,
      title: "Payment disputes",
      desc: "Escalations from disputed payments — link to payments resolve-dispute.",
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">
        Report center — wire to backend moderation endpoints as they ship.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {placeholders.map((item) => (
          <div
            key={item.title}
            className="glass-panel rounded-2xl p-6 border border-dashed border-border-light dark:border-border-dark"
          >
            <item.icon className="text-accent-purple mb-4" size={28} />
            <h3 className="font-display font-black text-text-light dark:text-text-dark">
              {item.title}
            </h3>
            <p className="text-sm font-medium text-subtext-light dark:text-subtext-dark mt-2">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModeratorReportsPage;
