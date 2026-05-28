import { useEffect, useState } from "react";
import { Shield, MessageSquare, User, DollarSign, Award, CheckCircle, Phone, AlertTriangle } from "lucide-react";
import { listDisputes, claimDispute, resolveDispute, getChatMessages, submitBanRequest, fetchUserReportCount } from "../../api/admin.api";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../../components/PageLoader";

const BAN_THRESHOLD = 3; // report count at which moderator can request a ban

interface Dispute {
  id: string;
  job_detail?: {
    id: string;
    title: string;
    address: string;
    description: string;
  };
  raised_by_detail?: {
    username: string;
    role: string;
    email: string;
    phone?: string;
  };
  against_detail?: {
    username: string;
    role: string;
    email: string;
    phone?: string;
  };
  payment_detail?: {
    id: string;
    amount: string;
    currency: string;
  };
  reason: string;
  description: string;
  status: string;
  claimed_by_name: string | null;
  created_at: string;
}

interface ChatMessage {
  sender: string;
  text: string;
  time: string;
}

const ModeratorDisputesPage = () => {
  const { user: currentUser } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [banRequested, setBanRequested] = useState<Record<string, boolean>>({});
  const [banSubmitting, setBanSubmitting] = useState<string | null>(null);
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({});

  // Resolution inputs
  const [refundCustomer, setRefundCustomer] = useState<number>(0);
  const [payoutProfessional, setPayoutProfessional] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const getReportCount = (username?: string) =>
    username ? (reportCounts[username] ?? 0) : 0;

  const loadReportCounts = async (dispute: typeof selectedDispute) => {
    if (!dispute) return;
    const usernames = [
      dispute.raised_by_detail?.username,
      dispute.against_detail?.username,
    ].filter(Boolean) as string[];
    const entries = await Promise.all(
      usernames.map(async (u) => [u, await fetchUserReportCount(u)] as [string, number])
    );
    setReportCounts((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
  };

  const handleBanRequest = async (username: string, email: string, phone: string, role: string) => {
    const count = getReportCount(username);
    setBanSubmitting(username);
    try {
      await submitBanRequest({ username, email, phone, role, report_count: count, reason: `User @${username} has been reported ${count} times. Moderator flagged for admin review.` });
      setBanRequested((prev) => ({ ...prev, [username]: true }));
    } catch {
      alert("Failed to submit ban request. Please try again.");
    } finally {
      setBanSubmitting(null);
    }
  };

  const loadDisputes = (selectId?: string) => {
    listDisputes()
      .then((data) => {
        const list = data as Dispute[];
        setDisputes(list);
        if (selectId) {
          const updated = list.find((d) => d.id === selectId);
          if (updated) setSelectedDispute(updated);
        } else if (selectedDispute) {
          const updated = list.find((d) => d.id === selectedDispute.id);
          if (updated) setSelectedDispute(updated);
        }
      })
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  useEffect(() => {
    if (selectedDispute) {
      setChatLoading(true);
      getChatMessages(selectedDispute.id)
        .then((messages) => setChatMessages(messages as ChatMessage[]))
        .catch(() => setChatMessages([]))
        .finally(() => setChatLoading(false));

      loadReportCounts(selectedDispute);

      const amt = parseFloat(selectedDispute.payment_detail?.amount || "0");
      setRefundCustomer(amt / 2);
      setPayoutProfessional(amt / 2);
      setNotes("");
    } else {
      setChatMessages([]);
    }
  }, [selectedDispute]);

  const handleClaim = async () => {
    if (!selectedDispute || !currentUser) return;
    setSubmitting(true);
    try {
      await claimDispute(selectedDispute.id, currentUser.username);
      loadDisputes(selectedDispute.id);
    } catch (err) {
      alert("Failed to claim dispute.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    const totalEscrow = parseFloat(selectedDispute.payment_detail?.amount || "0");
    if (refundCustomer + payoutProfessional > totalEscrow) {
      alert(`The total split ($${refundCustomer + payoutProfessional}) cannot exceed the escrow amount ($${totalEscrow}).`);
      return;
    }
    if (!notes.trim()) {
      alert("Please provide resolution notes detailing the decision.");
      return;
    }

    setSubmitting(true);
    try {
      await resolveDispute(selectedDispute.id, refundCustomer, payoutProfessional, notes);
      alert("Dispute successfully resolved. Escrow funds will be released.");
      setSelectedDispute(null);
      loadDisputes();
    } catch (err) {
      alert("Failed to resolve dispute.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-fade-in-up">
      {/* LEFT: DISPUTES LIST */}
      <div className="w-full lg:w-96 flex flex-col glass-panel rounded-3xl border border-border-light/60 dark:border-border-dark/60 overflow-hidden shrink-0">
        <div className="p-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-display font-black text-text-light dark:text-text-dark">Escrow Disputes</h3>
          <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-0.5">
            Select a disputed contract to audit and resolve.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border-light dark:divide-border-dark">
          {disputes.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-subtext-light dark:text-subtext-dark">
              No disputes active on the platform.
            </div>
          ) : (
            disputes.map((d) => {
              const isSelected = selectedDispute?.id === d.id;
              const hasClaimed = d.claimed_by_name;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDispute(d)}
                  className={`w-full text-left p-4 flex flex-col gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                    isSelected ? "bg-primary/5 dark:bg-primary/10 border-l-4 border-primary" : ""
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-black text-xs text-text-light dark:text-text-dark truncate">
                      {d.job_detail?.title || "Contract"}
                    </span>
                    <span className="text-[10px] font-black text-primary px-2 py-0.5 rounded-full bg-primary/10 shrink-0">
                      ${d.payment_detail?.amount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold text-subtext-light dark:text-subtext-dark">
                    <span>Reason: {d.reason}</span>
                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                        d.status === "open"
                          ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400"
                          : d.status === "in_review"
                          ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400"
                          : "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400"
                      }`}
                    >
                      {d.status}
                    </span>

                    {hasClaimed ? (
                      <span className="text-[8px] font-black text-accent-purple uppercase tracking-wider">
                        Claimed by: {d.claimed_by_name}
                      </span>
                    ) : (
                      <span className="text-[8px] font-black text-subtext-light uppercase tracking-wider">
                        Unassigned
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: DETAILS, CHAT & RESOLUTION TOOL */}
      <div className="hidden lg:flex flex-1 flex-col glass-panel rounded-3xl border border-border-light/60 dark:border-border-dark/60 overflow-hidden">
        {selectedDispute ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header info */}
            <div className="p-6 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Case ID: #{selectedDispute.id.slice(0, 8)}
                </span>
                <h4 className="text-lg font-display font-black text-text-light dark:text-text-dark">
                  {selectedDispute.job_detail?.title}
                </h4>
              </div>

              {selectedDispute.claimed_by_name ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-light dark:text-text-dark">
                    Audited by **{selectedDispute.claimed_by_name}**
                  </span>
                  {selectedDispute.status !== "resolved" && (
                    <span className="size-2.5 rounded-full bg-purple-500 animate-pulse" />
                  )}
                </div>
              ) : (
                <button
                  onClick={handleClaim}
                  disabled={submitting}
                  className="px-4 py-2 bg-primary hover:bg-primary-light disabled:opacity-50 text-white text-xs font-black rounded-full shadow-lg shadow-primary/20 transition-all"
                >
                  Claim Dispute
                </button>
              )}
            </div>

            {/* Split Content Pane */}
            <div className="flex-1 flex overflow-hidden">
              {/* Audit Details & Chat logs */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 border-r border-border-light dark:border-border-dark">
                {/* Contract overview card */}
                <div className="space-y-3">
                  {/* Raised By */}
                  {(() => {
                    const u = selectedDispute.raised_by_detail;
                    const count = getReportCount(u?.username);
                    return (
                      <div className="flex items-start justify-between bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-border-light dark:border-border-dark gap-3">
                        <div className="space-y-1 min-w-0">
                          <span className="text-[8px] font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark flex items-center gap-1">
                            <User size={10} /> Reporter
                          </span>
                          <p className="text-xs font-bold text-text-light dark:text-text-dark">@{u?.username} <span className="text-subtext-light font-medium">({u?.role})</span></p>
                          <p className="text-[10px] text-subtext-light dark:text-subtext-dark">{u?.email}</p>
                          <p className="text-[10px] font-bold text-primary flex items-center gap-1"><Phone size={9} />{u?.phone || "—"}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                            count >= BAN_THRESHOLD ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400" : "bg-slate-100 text-subtext-light border-border-light dark:bg-slate-800"
                          }`}>{count} report{count !== 1 ? "s" : ""}</span>
                          {count >= BAN_THRESHOLD && (
                            <button
                              onClick={() => handleBanRequest(u?.username!, u?.email!, u?.phone || "", u?.role!)}
                              disabled={!!banRequested[u?.username!] || banSubmitting === u?.username}
                              className="text-[9px] font-black px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white flex items-center gap-1 transition-colors"
                            >
                              <AlertTriangle size={9} />
                              {banRequested[u?.username!] ? "Requested" : "Request Ban"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Against */}
                  {(() => {
                    const u = selectedDispute.against_detail;
                    const count = getReportCount(u?.username);
                    return (
                      <div className="flex items-start justify-between bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-border-light dark:border-border-dark gap-3">
                        <div className="space-y-1 min-w-0">
                          <span className="text-[8px] font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark flex items-center gap-1">
                            <User size={10} /> Disputed Party
                          </span>
                          <p className="text-xs font-bold text-text-light dark:text-text-dark">@{u?.username} <span className="text-subtext-light font-medium">({u?.role})</span></p>
                          <p className="text-[10px] text-subtext-light dark:text-subtext-dark">{u?.email}</p>
                          <p className="text-[10px] font-bold text-primary flex items-center gap-1"><Phone size={9} />{u?.phone || "—"}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                            count >= BAN_THRESHOLD ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400" : "bg-slate-100 text-subtext-light border-border-light dark:bg-slate-800"
                          }`}>{count} report{count !== 1 ? "s" : ""}</span>
                          {count >= BAN_THRESHOLD && (
                            <button
                              onClick={() => handleBanRequest(u?.username!, u?.email!, u?.phone || "", u?.role!)}
                              disabled={!!banRequested[u?.username!] || banSubmitting === u?.username}
                              className="text-[9px] font-black px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white flex items-center gap-1 transition-colors"
                            >
                              <AlertTriangle size={9} />
                              {banRequested[u?.username!] ? "Requested" : "Request Ban"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Escrow */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-border-light dark:border-border-dark">
                    <span className="text-[8px] font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark flex items-center gap-1 mb-1">
                      <DollarSign size={10} /> Total Escrow
                    </span>
                    <p className="text-sm font-black text-gradient">
                      ${selectedDispute.payment_detail?.amount} {selectedDispute.payment_detail?.currency}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-text-light dark:text-text-dark flex items-center gap-1.5">
                    <Shield size={14} className="text-primary" /> Dispute Explanation
                  </h5>
                  <p className="text-xs font-medium text-text-light dark:text-subtext-dark bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-border-light dark:border-border-dark leading-relaxed">
                    {selectedDispute.description}
                  </p>
                </div>

                {/* Audit Chat History */}
                <div className="space-y-4">
                  <h5 className="text-xs font-black uppercase tracking-wider text-text-light dark:text-text-dark flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-accent-purple" /> Booking Message Transcript
                  </h5>

                  <div className="border border-border-light dark:border-border-dark rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="bg-slate-100/80 dark:bg-slate-800/80 px-4 py-2 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                      <span className="text-[9px] font-black text-subtext-light dark:text-subtext-dark uppercase tracking-widest">
                        Audit Log Protection Enabled
                      </span>
                      <span className="text-[8px] font-black text-green-500 uppercase">
                        Scoped access
                      </span>
                    </div>

                    <div className="p-4 space-y-4 max-h-72 overflow-y-auto">
                      {chatLoading ? (
                        <div className="text-center py-8 text-xs text-subtext-light">Loading messages...</div>
                      ) : chatMessages.length === 0 ? (
                        <div className="text-center py-8 text-xs text-subtext-light">No chat messages found for this booking.</div>
                      ) : (
                        chatMessages.map((msg, i) => {
                          const isCustomer = msg.sender === "customer";
                          return (
                            <div
                              key={i}
                              className={`flex flex-col max-w-[80%] ${
                                isCustomer ? "ml-auto items-end" : "mr-auto items-start"
                              }`}
                            >
                              <div
                                className={`px-4 py-2.5 rounded-2xl text-xs font-medium shadow-sm leading-relaxed ${
                                  isCustomer
                                    ? "bg-primary text-white rounded-tr-none"
                                    : "bg-slate-100 dark:bg-slate-800 text-text-light dark:text-text-dark rounded-tl-none border border-border-light dark:border-border-dark"
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[8px] font-bold text-subtext-light dark:text-subtext-dark mt-1 px-1">
                                {isCustomer ? "Customer" : "Professional"} · {msg.time}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dispute Resolution Tool panel */}
              <div className="w-80 p-6 bg-slate-50/50 dark:bg-slate-900/10 overflow-y-auto">
                {selectedDispute.status === "resolved" ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                    <CheckCircle className="text-green-500" size={48} />
                    <h5 className="font-display font-black text-text-light dark:text-text-dark">Case Resolved</h5>
                    <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark">
                      Escrow funds have been split and released.
                    </p>
                  </div>
                ) : !selectedDispute.claimed_by_name ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <Shield className="text-subtext-light mb-3" size={36} />
                    <p className="text-xs font-black text-text-light dark:text-text-dark uppercase tracking-wider">
                      Audit Locked
                    </p>
                    <p className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark mt-2 leading-relaxed">
                      You must claim this dispute before executing resolutions.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleResolve} className="space-y-6">
                    <h5 className="text-xs font-black uppercase tracking-wider text-text-light dark:text-text-dark flex items-center gap-1.5">
                      <Award size={14} className="text-primary" /> Escrow Settlement
                    </h5>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-text-light dark:text-text-dark flex justify-between">
                          <span>Refund Customer</span>
                          <span>Max: ${selectedDispute.payment_detail?.amount}</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-subtext-light">$</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={refundCustomer}
                            onChange={(e) => setRefundCustomer(parseFloat(e.target.value) || 0)}
                            className="w-full h-11 pl-8 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-text-light dark:text-text-dark flex justify-between">
                          <span>Pay Professional</span>
                          <span>Max: ${selectedDispute.payment_detail?.amount}</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-subtext-light">$</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={payoutProfessional}
                            onChange={(e) => setPayoutProfessional(parseFloat(e.target.value) || 0)}
                            className="w-full h-11 pl-8 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-dashed border-border-light dark:border-border-dark flex justify-between text-xs font-black text-text-light dark:text-text-dark">
                        <span>Total Allocated:</span>
                        <span>${refundCustomer + payoutProfessional}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-text-light dark:text-text-dark">
                        Decision Verdict Notes
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Detail the case details and explain the reasoning behind this refund allocation..."
                        className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark focus:border-primary outline-none text-xs font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-12 bg-gradient-to-r from-primary to-primary-light text-white rounded-full font-black text-xs flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
                    >
                      Release Escrow
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Shield size={32} />
            </div>
            <h4 className="text-xl font-display font-black text-text-light dark:text-text-dark">
              Select a Dispute
            </h4>
            <p className="text-xs font-bold text-subtext-light dark:text-subtext-dark max-w-sm mt-2">
              Choose a dispute case from the list on the left to begin checking transaction details, message history, and splitting escrow payouts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeratorDisputesPage;
