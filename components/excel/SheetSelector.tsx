'use client';

import type { ParsedSheet } from '../../types/excel';

type SheetSelectorProps = {
  sheets: ParsedSheet[];
  selectedSheetName: string | null;
  onSelect: (name: string) => void;
};

export function SheetSelector({ sheets, selectedSheetName, onSelect }: SheetSelectorProps) {
  if (!sheets.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-700">Sheets</h2>
        <p className="text-xs text-slate-500">Select a worksheet to explore.</p>
      </div>
      <ul className="divide-y divide-slate-200">
        {sheets.map((sheet) => {
          const isActive = sheet.name === selectedSheetName;
          return (
            <li key={sheet.name}>
              <button
                type="button"
                onClick={() => onSelect(sheet.name)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-blue-50 ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                }`}
              >
                <span className="text-sm font-medium">{sheet.name}</span>
                <span className="text-xs text-slate-500">{sheet.rows.length.toLocaleString()} rows</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
