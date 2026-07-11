"use client";

import { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginatedTableProps {
  title: string;
  description?: string;
  action?: ReactNode;
  headers: string[];
  rows: ReactNode[][];
  pageSize?: number;
}

export default function PaginatedTable({ title, description, action, headers, rows, pageSize = 10 }: PaginatedTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  // Ensure current page is within bounds if data changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = rows.slice(startIndex, startIndex + pageSize);

  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

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
              <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs w-16">No</th>
              {headers.map((header, i) => (
                <th key={i} className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="px-6 py-8 text-center text-slate-500">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              paginatedRows.map((rowCells, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                    {startIndex + i + 1}
                  </td>
                  {rowCells.map((cellContent, j) => (
                    <td key={j} className="px-6 py-4 text-slate-700 whitespace-nowrap">
                      {cellContent}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Menampilkan {startIndex + 1} - {Math.min(startIndex + pageSize, rows.length)} dari {rows.length} data
          </span>
          <div className="flex gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
