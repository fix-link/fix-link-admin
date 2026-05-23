import { useEffect, useState } from "react";
import { listJobs } from "../../api/admin.api";
import DataTable from "../../components/DataTable";
import PageLoader from "../../components/PageLoader";

const AdminJobsPage = () => {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listJobs()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">
        {rows.length} jobs
      </p>
      <DataTable
        rows={rows}
        columns={[
          { key: "title", header: "Title" },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <span className="text-xs font-black uppercase tracking-wider">
                {String(r.status ?? "—")}
              </span>
            ),
          },
          { key: "address", header: "Location" },
          { key: "budget", header: "Budget" },
        ]}
      />
    </div>
  );
};

export default AdminJobsPage;
