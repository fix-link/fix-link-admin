import { useEffect, useState } from "react";
import { listReviews } from "../../api/admin.api";
import DataTable from "../../components/DataTable";
import PageLoader from "../../components/PageLoader";

const ModeratorReviewsPage = () => {
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
    <DataTable
      rows={rows}
      columns={[
        { key: "job_title", header: "Job" },
        { key: "rating", header: "Rating" },
        { key: "comment", header: "Comment", render: (r) => String(r.comment ?? "—").slice(0, 80) },
      ]}
    />
  );
};

export default ModeratorReviewsPage;
