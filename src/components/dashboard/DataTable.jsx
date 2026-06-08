function DataTable({ columns = [], rows = [], rowKey = "id", emptyNode = null }) {
  if (!rows.length && emptyNode) return emptyNode;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-white/8 dark:bg-[#1A1A22] dark:shadow-2xl">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-white/[0.01]">
            {columns.map((col) => (
              <th 
                key={col.key} 
                className="px-6 py-4 text-start text-[10px] font-bold uppercase tracking-widest text-slate-500 first:ps-8 last:pe-8 dark:text-slate-500"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.02]">
          {rows.map((row) => (
            <tr 
              key={row[rowKey]} 
              className="group bg-white transition-colors hover:bg-slate-50 even:bg-white dark:bg-transparent dark:hover:bg-white/3 dark:even:bg-white/[0.01]"
            >
              {columns.map((col) => (
                <td 
                  key={col.key} 
                  className="px-6 py-5 text-slate-700 first:ps-8 last:pe-8 dark:text-slate-300"
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


export default DataTable;
