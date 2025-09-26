'use client';

import { useMemo } from 'react';

import type { ParsedSheet } from '../../types/excel';

type ColumnPickerProps = {
  sheet: ParsedSheet | null;
  selectedColumns: string[];
  onChange: (columns: string[]) => void;
};

const toggleColumn = (current: string[], column: string) => {
  if (current.includes(column)) {
    return current.filter((item) => item !== column);
  }
  return [...current, column];
};

export function ColumnPicker({ sheet, selectedColumns, onChange }: ColumnPickerProps) {
  const previewData = useMemo(() => {
    if (!sheet) {
      return [];
    }
    return sheet.rows.slice(0, 5);
  }, [sheet]);

  if (!sheet) {
    return null;
  }

  const handleSelectAll = () => {
    onChange(sheet.headers);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const renderCell = (row: Record<string, any>, header: string) => {
    const value = row?.[header];
    if (value === null || value === undefined || value === '') {
      return <span className="text-slate-400">—</span>;
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Columns</h2>
          <p className="text-xs text-slate-500">Choose the fields to include in charts and tables.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="max-h-56 overflow-y-auto px-4 py-3">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sheet.headers.map((header) => (
            <li key={header} className="flex items-center gap-2">
              <input
                id={`column-${header}`}
                type="checkbox"
                checked={selectedColumns.includes(header)}
                onChange={() => onChange(toggleColumn(selectedColumns, header))}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`column-${header}`} className="text-sm text-slate-700">
                {header}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-slate-200 px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {sheet.headers.slice(0, 6).map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewData.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-sm text-slate-500" colSpan={Math.max(1, Math.min(6, sheet.headers.length))}>
                    No data rows detected in this sheet.
                  </td>
                </tr>
              ) : (
                previewData.map((row, index) => (
                  <tr key={`preview-${index}`} className="odd:bg-white even:bg-slate-50">
                    {sheet.headers.slice(0, 6).map((header) => (
                      <td key={`${index}-${header}`} className="whitespace-nowrap px-3 py-2 text-xs text-slate-700">
                        {renderCell(row, header)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
