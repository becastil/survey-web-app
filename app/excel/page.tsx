'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ColumnPicker } from '../../components/excel/ColumnPicker';
import { ChartBuilder } from '../../components/excel/ChartBuilder';
import { ChartDisplay } from '../../components/excel/ChartDisplay';
import { DataTable } from '../../components/excel/DataTable';
import { FileUploader } from '../../components/excel/FileUploader';
import { SheetSelector } from '../../components/excel/SheetSelector';
import type { ChartConfig, ParsedSheet } from '../../types/excel';

const defaultChartConfig: ChartConfig = {
  type: 'bar',
  xKey: null,
  yKeys: [],
  categoryKey: null,
  valueKey: null,
  groupKey: null,
  aggregate: 'sum'
};

export default function ExcelVisualizerPage() {
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [selectedSheetName, setSelectedSheetName] = useState<string | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>(defaultChartConfig);

  const selectedSheet = useMemo(() => {
    return sheets.find((sheet) => sheet.name === selectedSheetName) ?? null;
  }, [sheets, selectedSheetName]);

  const handleSheetsParsed = useCallback((parsed: ParsedSheet[]) => {
    setSheets(parsed);
    if (parsed.length) {
      setSelectedSheetName(parsed[0].name);
    } else {
      setSelectedSheetName(null);
    }
  }, []);

  useEffect(() => {
    if (!selectedSheet) {
      setSelectedColumns([]);
      setChartConfig(defaultChartConfig);
      return;
    }

    setSelectedColumns((prev) => {
      if (prev.length) {
        const validColumns = prev.filter((column) => selectedSheet.headers.includes(column));
        if (validColumns.length) {
          return validColumns;
        }
      }
      return selectedSheet.headers.slice(0, Math.min(selectedSheet.headers.length, 6));
    });

    setChartConfig((prev) => {
      const nextConfig: ChartConfig = {
        ...prev,
        type: prev.type,
        aggregate: prev.aggregate,
        xKey: selectedSheet.headers[0] ?? null,
        yKeys: selectedSheet.headers[1] ? [selectedSheet.headers[1]] : [],
        categoryKey: selectedSheet.headers[0] ?? null,
        valueKey: selectedSheet.headers[1] ?? null,
        groupKey: null
      };

      if (prev.type === 'pie') {
        nextConfig.xKey = null;
      }

      return nextConfig;
    });
  }, [selectedSheet]);

  const handleColumnChange = useCallback((columns: string[]) => {
    setSelectedColumns(columns);
    setChartConfig((prev) => {
      const next = { ...prev };
      if (prev.type === 'pie') {
        if (columns.includes(prev.categoryKey ?? '')) {
          next.categoryKey = prev.categoryKey;
        } else {
          next.categoryKey = columns[0] ?? null;
        }
        if (columns.includes(prev.valueKey ?? '')) {
          next.valueKey = prev.valueKey;
        } else {
          next.valueKey = columns[1] ?? null;
        }
      } else {
        if (!columns.includes(prev.xKey ?? '')) {
          next.xKey = columns[0] ?? null;
        }
        if (!columns.includes(prev.yKeys[0] ?? '')) {
          next.yKeys = columns[1] ? [columns[1]] : [];
        }
        if (!columns.includes(prev.groupKey ?? '')) {
          next.groupKey = null;
        }
      }
      return next;
    });
  }, []);

  const handleChartConfigChange = useCallback((config: ChartConfig) => {
    setChartConfig(config);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-900">Excel Survey Visualizer</h1>
            <p className="max-w-3xl text-sm text-slate-600">
              Upload an Excel workbook to explore survey responses. Select a sheet, choose the columns to analyse, and generate interactive charts and tables — all without leaving your browser.
            </p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
            <p className="font-semibold">Tips</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Use the chart builder to switch between bar, line, area, pie, or scatter visuals.</li>
              <li>Toggle "Count rows" to measure response volume for categories.</li>
              <li>Download the chart as a PNG or export the filtered table as CSV.</li>
            </ul>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <FileUploader onSheetsParsed={handleSheetsParsed} />
            {sheets.length > 0 && (
              <SheetSelector
                sheets={sheets}
                selectedSheetName={selectedSheetName}
                onSelect={setSelectedSheetName}
              />
            )}
            {selectedSheet && (
              <ColumnPicker
                sheet={selectedSheet}
                selectedColumns={selectedColumns}
                onChange={handleColumnChange}
              />
            )}
          </div>

          <div className="space-y-6 lg:col-span-2">
            <ChartBuilder
              availableColumns={selectedColumns.length ? selectedColumns : selectedSheet?.headers ?? []}
              config={chartConfig}
              onChange={handleChartConfigChange}
            />
            <ChartDisplay dataRows={selectedSheet?.rows ?? []} config={chartConfig} />
            <DataTable
              data={selectedSheet?.rows ?? []}
              columns={selectedColumns.length ? selectedColumns : selectedSheet?.headers ?? []}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
