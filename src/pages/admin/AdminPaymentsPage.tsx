import { useEffect, useState } from "react";
import { listPayments } from "../../api/admin.api";
import DataTable from "../../components/DataTable";
import PageLoader from "../../components/PageLoader";

const AdminPaymentsPage = () => {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPayments()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">
        {rows.length} payment records
      </p>
      <DataTable
        rows={rows}
        columns={[
          { key: "id", header: "ID", render: (r) => String(r.id).slice(0, 8) + "…" },
          { key: "amount", header: "Amount" },
          { key: "currency", header: "Currency" },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <span
                className={`text-xs font-black uppercase ${
                  r.status === "disputed" ? "text-red-500" : ""
                }`}
              >
                {String(r.status)}
              </span>
            ),
          },
          { key: "provider", header: "Provider" },
        ]}
      />
    </div>
  );
};

export default AdminPaymentsPage;
