import clsx from 'clsx';
import type { ReactNode } from 'react';

const alignment = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;

export interface Column<Row> {
  header: string;
  align?: keyof typeof alignment;
  cell: (row: Row, index: number) => ReactNode;
}

interface DataTableProps<Row> {
  caption: string;
  columns: Column<Row>[];
  rows: Row[];
  getRowKey: (row: Row) => string;
  emptyMessage?: string;
}

export function DataTable<Row>({
  caption,
  columns,
  rows,
  getRowKey,
  emptyMessage = 'Nothing matches these filters.',
}: DataTableProps<Row>) {
  return (
    <div className="relative overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-table-head">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={clsx(
                  'px-4 py-3 font-semibold whitespace-nowrap text-ink',
                  alignment[column.align ?? 'left'],
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, index) => (
            <tr key={getRowKey(row)} className="hover:bg-canvas">
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={clsx(
                    'px-4 py-2.5 whitespace-nowrap',
                    alignment[column.align ?? 'left'],
                  )}
                >
                  {column.cell(row, index)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
