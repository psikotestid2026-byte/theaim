import { ReactNode } from "react";
import PaginatedTable from "./PaginatedTable";

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
  pageSize?: number;
}

export default function DataTable<T>({ data, columns, title, description, action, pageSize = 10 }: Props<T>) {
  // Extract headers
  const headers = columns.map(col => col.header);

  // Evaluate cell content for each row here on the server
  // ReactNode can be serialized and sent to the Client Component
  const rows = data.map((row) => 
    columns.map((col) => {
      if (col.cell) {
        return col.cell(row);
      }
      if (col.accessorKey) {
        return String(row[col.accessorKey] ?? "");
      }
      return null;
    })
  );

  return (
    <PaginatedTable
      title={title}
      description={description}
      action={action}
      headers={headers}
      rows={rows}
      pageSize={pageSize}
    />
  );
}
