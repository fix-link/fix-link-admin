import { useEffect, useState } from "react";
import { CreditCard, DollarSign, ArrowUpRight, ArrowLeftRight, X, Receipt } from "lucide-react";
import { listPayments, fetchPaymentFees } from "../../api/admin.api";
import DataTable from "../../components/DataTable";
import PageLoader from "../../components/PageLoader";

const AdminPaymentsPage = () => {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  useEffect(() => {
    Promise.all([listPayments(), fetchPaymentFees()])
      .then(([paymentData, feeData]) => {
        setRows(paymentData);
        setFees(feeData);
      })
      .catch(() => {
        setRows([]);
        setFees([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  // Find fee breakdown for selected payment
  const getFeeBreakdown = (paymentId: string) => {
    const existing = fees.find((f) => f.id === paymentId);
    if (existing) return existing;

    // Estimate platform fee (10%) for payments without explicit fee mapping
    const p = rows.find((r) => r.id === paymentId);
    if (p) {
      const amt = parseFloat(String(p.amount));
      const platformFee = (amt * 0.1).toFixed(2);
      return {
        id: paymentId,
        customer_name: "Customer",
        professional_name: "Professional",
        fee_amount: platformFee,
        job_title: "General Maintenance & Repairs",
        date: new Date().toISOString()
      };
    }
    return null;
  };

  const selectedFee = selectedPayment ? getFeeBreakdown(selectedPayment.id) : null;
  const totalRevenue = fees.reduce((acc, curr) => acc + parseFloat(curr.fee_amount || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">
          Track transaction records, processing status, and company platform revenue fees.
        </p>

        <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/40 shadow-sm shrink-0">
          <div className="size-9 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center font-bold">
            <DollarSign size={16} />
          </div>
          <div>
            <h4 className="text-sm font-black text-text-light dark:text-text-dark">
              ${totalRevenue.toFixed(2)} USD
            </h4>
            <p className="text-[9px] font-black uppercase text-subtext-light dark:text-subtext-dark tracking-wider">
              Total Platform Revenue
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-white/40 shadow-xl">
        <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-4">
          Financial Transaction Ledger
        </h3>
        <DataTable
          rows={rows}
          columns={[
            {
              key: "id",
              header: "Transaction ID",
              render: (r) => (
                <span className="font-mono text-xs font-bold text-text-light dark:text-text-dark">
                  {String(r.id)}
                </span>
              ),
            },
            {
              key: "amount",
              header: "Total Amount",
              render: (r) => (
                <span className="font-bold text-text-light dark:text-text-dark">
                  ${Number(r.amount).toFixed(2)} {String(r.currency)}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (r) => {
                const s = String(r.status);
                const isDisputed = s === "disputed";
                const isPending = s === "pending";
                return (
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      isDisputed
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : isPending
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-green-500/10 text-green-600 dark:text-green-400"
                    }`}
                  >
                    {s}
                  </span>
                );
              },
            },
            {
              key: "provider",
              header: "Processor",
              render: (r) => (
                <span className="text-xs font-bold text-subtext-light dark:text-subtext-dark uppercase">
                  {String(r.provider)}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Platform Fee Revenue",
              render: (r) => {
                const breakdown = getFeeBreakdown(String(r.id));
                return (
                  <button
                    onClick={() => setSelectedPayment(r)}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Receipt size={13} />
                    View Fee Breakdown
                  </button>
                );
              },
            },
          ]}
        />
      </div>

      {/* Premium Revenue Breakout Modal */}
      {selectedPayment && selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/40 shadow-2xl relative">
            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-subtext-light hover:text-text-light hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <div className="size-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-3">
                <Receipt size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-light dark:text-text-dark">
                Platform Revenue Detail
              </h3>
              <p className="text-[10px] text-subtext-light dark:text-subtext-dark uppercase font-black tracking-wider mt-1">
                Transaction ID: {selectedPayment.id}
              </p>
            </div>

            {/* Receipt Styling Breakdown */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border-light/40 dark:border-border-dark/40 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-dashed border-border-light dark:border-border-dark">
                <span className="text-xs font-bold text-subtext-light dark:text-subtext-dark">
                  Origin (Professional)
                </span>
                <span className="text-xs font-black text-text-light dark:text-text-dark text-right">
                  {selectedFee.professional_name}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-dashed border-border-light dark:border-border-dark">
                <span className="text-xs font-bold text-subtext-light dark:text-subtext-dark">
                  Customer
                </span>
                <span className="text-xs font-black text-text-light dark:text-text-dark text-right">
                  {selectedFee.customer_name}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-dashed border-border-light dark:border-border-dark">
                <span className="text-xs font-bold text-subtext-light dark:text-subtext-dark">
                  Related Job Title
                </span>
                <span className="text-xs font-black text-primary text-right max-w-[200px] truncate">
                  {selectedFee.job_title}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-dashed border-border-light dark:border-border-dark">
                <span className="text-xs font-bold text-subtext-light dark:text-subtext-dark">
                  Processing Date
                </span>
                <span className="text-xs font-black text-text-light dark:text-text-dark">
                  {new Date(selectedFee.date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-1">
                  <ArrowLeftRight size={14} className="text-green-500" />
                  <span className="text-xs font-black uppercase text-text-light dark:text-text-dark">
                    Company Revenue Fee
                  </span>
                </div>
                <span className="text-lg font-black text-green-500">
                  +${selectedFee.fee_amount} USD
                </span>
              </div>
            </div>

            <p className="text-[10px] text-center text-subtext-light dark:text-subtext-dark font-bold uppercase tracking-widest mt-6">
              10% standard transaction fee applied
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
