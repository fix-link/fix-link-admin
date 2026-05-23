import { useEffect, useState } from "react";
import { listReviews } from "../../api/admin.api";
import DataTable from "../../components/DataTable";
import PageLoader from "../../components/PageLoader";

const AdminReviewsPage = () => {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listReviews()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <DataTable
        rows={rows}
        columns={[
          { key: "job_title", header: "Job" },
          { key: "rating", header: "Rating" },
          {
            key: "comment",
            header: "Comment",
            render: (r) => (
              <span className="line-clamp-2 max-w-xs">{String(r.comment ?? "—")}</span>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AdminReviewsPage;
