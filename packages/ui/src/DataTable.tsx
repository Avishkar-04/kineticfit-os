import React from 'react';
import { clsx } from 'clsx';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No records found',
  className
}: DataTableProps<T>) {
  return (
    <div
      className={clsx(
        'w-full overflow-x-auto border border-kf-border rounded-lg bg-kf-surface-1',
        className
      )}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-kf-border bg-kf-surface-lowest">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={clsx(
                  'h-10 px-4 font-mono text-[11px] font-semibold tracking-widest uppercase text-kf-text-steel select-none',
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-kf-border/40 font-body text-xs">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="h-32 text-center text-kf-text-steel font-mono">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-kf-lime border-t-transparent rounded-full animate-spin" />
                  <span>Loading telemetry stream...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="h-32 text-center text-kf-text-steel font-mono">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'h-11 transition-colors duration-100 group',
                  onRowClick
                    ? 'cursor-pointer hover:bg-kf-surface-2 active:bg-kf-surface-3'
                    : 'hover:bg-kf-surface-2/60'
                )}
              >
                {columns.map((col) => {
                  const val = (row as any)[col.key];
                  return (
                    <td
                      key={col.key}
                      className={clsx(
                        'px-4 text-kf-text',
                        col.align === 'right'
                          ? 'text-right font-mono'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      )}
                    >
                      {col.render ? col.render(row) : val}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
