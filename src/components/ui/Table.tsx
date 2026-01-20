'use client';

import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  isLoading = false,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-background-hover border-b border-border" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-border last:border-0">
              <div className="flex items-center px-4 py-4 gap-4">
                <div className="h-4 bg-background-hover rounded w-1/4" />
                <div className="h-4 bg-background-hover rounded w-1/3" />
                <div className="h-4 bg-background-hover rounded w-1/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-background-alt">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="flex flex-col items-center justify-center py-12 text-text-muted">
          <svg
            className="w-12 h-12 mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-background-alt">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`
                  border-t border-border transition-colors
                  ${onRowClick ? 'cursor-pointer hover:bg-background-hover' : ''}
                `}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-5 text-sm text-text-secondary"
                  >
                    {column.render
                      ? column.render(item)
                      : ((item as Record<string, unknown>)[column.key] as ReactNode)}
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
