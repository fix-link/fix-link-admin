import { useEffect, useState } from "react";
import { listNotifications } from "../../api/admin.api";
import DataTable from "../../components/DataTable";
import PageLoader from "../../components/PageLoader";

const AdminNotificationsPage = () => {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listNotifications()
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
          { key: "title", header: "Title" },
          {
            key: "body",
            header: "Body",
            render: (r) => (
              <span className="line-clamp-2 max-w-md">{String(r.body ?? "")}</span>
            ),
          },
          { key: "channel", header: "Channel" },
          { key: "status", header: "Status" },
        ]}
      />
    </div>
  );
};

export default AdminNotificationsPage;
