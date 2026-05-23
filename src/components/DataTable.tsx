interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  emptyMessage = "No records found.",
}: Props<T>) {
  if (rows.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center">
        <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-border-light/60 dark:border-border-dark/60">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark bg-slate-50/80 dark:bg-slate-800/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={String(row.id ?? i)}
                className="border-b border-border-light/50 dark:border-border-dark/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-5 py-4 font-medium text-text-light dark:text-text-dark"
                  >
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
