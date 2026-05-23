import { useEffect, useState } from "react";
import { listJobs } from "../../api/admin.api";
import DataTable from "../../components/DataTable";
import PageLoader from "../../components/PageLoader";

const ModeratorJobsPage = () => {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listJobs()
      .then((jobs) =>
        jobs.filter((j: { status?: string }) =>
          ["pending", "in_progress", "done", "disputed"].includes(j.status || "")
        )
      )
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">
        Jobs requiring moderator attention
      </p>
      <DataTable rows={rows} columns={[
        { key: "title", header: "Title" },
        { key: "status", header: "Status" },
        { key: "address", header: "Location" },
      ]} />
    </div>
  );
};

export default ModeratorJobsPage;
