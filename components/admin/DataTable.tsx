import { ReactNode } from "react";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function DataTable<T>({ data, columns, title, description, action }: Props<T>) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className="px-6 py-4 text-slate-700 whitespace-nowrap">
                      {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey]) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
