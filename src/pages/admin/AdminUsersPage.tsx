import { useEffect, useState } from "react";
import { listUsers } from "../../api/admin.api";
import DataTable from "../../components/DataTable";
import PageLoader from "../../components/PageLoader";

const AdminUsersPage = () => {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listUsers()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">
        {rows.length} users on the platform
      </p>
      <DataTable
        rows={rows}
        columns={[
          { key: "username", header: "Username" },
          { key: "email", header: "Email" },
          {
            key: "role",
            header: "Role",
            render: (r) => (
              <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black uppercase">
                {String(r.role)}
              </span>
            ),
          },
          {
            key: "is_verified",
            header: "Verified",
            render: (r) => (r.is_verified ? "Yes" : "No"),
          },
        ]}
      />
    </div>
  );
};

export default AdminUsersPage;
