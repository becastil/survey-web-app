'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import Papa from 'papaparse';

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toLocaleString() : '';
  }
  return String(value);
};

type DataTableProps = {
  data: Record<string, any>[];
  columns: string[];
};

export function DataTable({ data, columns }: DataTableProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  const effectiveColumns = useMemo(() => {
    if (columns.length) {
      return columns;
    }
    if (data.length) {
      return Object.keys(data[0]);
    }
    return [];
  }, [columns, data]);

  const filteredData = useMemo(() => {
    if (!globalFilter.trim()) {
      return data;
    }
    const search = globalFilter.trim().toLowerCase();
    return data.filter((row) => {
      return effectiveColumns.some((column) => {
        const value = row[column];
        if (value === null || value === undefined) {
          return false;
        }
        return String(value).toLowerCase().includes(search);
      });
    });
  }, [data, effectiveColumns, globalFilter]);

  const columnDefs = useMemo<ColumnDef<Record<string, any>>[]>(() => {
    if (!effectiveColumns.length) {
      return [];
    }
    return effectiveColumns.map((column) => ({
      header: column,
      accessorKey: column
    }));
  }, [effectiveColumns]);

  const table = useReactTable({
    data: filteredData,
    columns: columnDefs,
    state: {
      pagination
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    autoResetPageIndex: false
  });

  const currentPageSize = pagination.pageSize;

  useEffect(() => {
    setPagination((prev) => {
      const maxPage = Math.max(0, Math.ceil(filteredData.length / prev.pageSize) - 1);
      if (prev.pageIndex > maxPage) {
        return { ...prev, pageIndex: maxPage };
      }
      return prev;
    });
  }, [filteredData, currentPageSize]);

  const handleExportCsv = () => {
    if (!filteredData.length) {
      return;
    }
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `survey-data-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const pageSizes = [10, 25, 50, 100];

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Data table</h2>
          <p className="text-xs text-slate-500">Search, filter and export the underlying responses.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search rows…"
            value={globalFilter}
            onChange={(event) => {
              setGlobalFilter(event.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="w-48 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!filteredData.length}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
              filteredData.length
                ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            }`}
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="odd:bg-white even:bg-slate-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                      {formatCellValue(cell.getValue())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={table.getVisibleLeafColumns().length || 1}>
                  {globalFilter ? 'No rows match the current search.' : 'Upload a sheet to view its rows.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={`rounded-md border px-2 py-1 transition ${
              table.getCanPreviousPage()
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                : 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400'
            }`}
          >
            Previous
          </button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={`rounded-md border px-2 py-1 transition ${
              table.getCanNextPage()
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                : 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
