'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ColumnPicker } from '../../components/excel/ColumnPicker';
import { ChartBuilder } from '../../components/excel/ChartBuilder';
import { ChartDisplay } from '../../components/excel/ChartDisplay';
import { DataTable } from '../../components/excel/DataTable';
import { FileUploader } from '../../components/excel/FileUploader';
import { SheetSelector } from '../../components/excel/SheetSelector';
import type { ChartConfig, ParsedSheet } from '../../types/excel';

// Sample healthcare survey data for demonstration
const sampleHealthcareData: ParsedSheet[] = [
  {
    name: "Medical Plan Enrollment",
    headers: ["Coverage Tier", "Enrolled", "Monthly Rate", "Employee Contribution", "Employer Share"],
    rows: [
      { "Coverage Tier": "Employee Only", "Enrolled": 142, "Monthly Rate": 785, "Employee Contribution": 125, "Employer Share": 660 },
      { "Coverage Tier": "Employee + Spouse", "Enrolled": 89, "Monthly Rate": 1580, "Employee Contribution": 285, "Employer Share": 1295 },
      { "Coverage Tier": "Employee + Child(ren)", "Enrolled": 67, "Monthly Rate": 1420, "Employee Contribution": 245, "Employer Share": 1175 },
      { "Coverage Tier": "Employee + Family", "Enrolled": 156, "Monthly Rate": 2140, "Employee Contribution": 385, "Employer Share": 1755 }
    ]
  },
  {
    name: "Employee Demographics",
    headers: ["Category", "Count", "Percentage", "Avg Salary"],
    rows: [
      { "Category": "Full-Time", "Count": 398, "Percentage": 87.5, "Avg Salary": 68500 },
      { "Category": "Part-Time", "Count": 57, "Percentage": 12.5, "Avg Salary": 42300 },
      { "Category": "Union", "Count": 123, "Percentage": 27.0, "Avg Salary": 71200 },
      { "Category": "Non-Union", "Count": 332, "Percentage": 73.0, "Avg Salary": 66800 },
      { "Category": "Management", "Count": 45, "Percentage": 9.9, "Avg Salary": 95400 },
      { "Category": "Non-Management", "Count": 410, "Percentage": 90.1, "Avg Salary": 64200 }
    ]
  },
  {
    name: "Budget Trends",
    headers: ["Year", "Medical Budget", "Dental Budget", "Vision Budget", "Total Budget", "Increase %"],
    rows: [
      { "Year": "2021", "Medical Budget": 3240000, "Dental Budget": 185000, "Vision Budget": 45000, "Total Budget": 3470000, "Increase %": 0 },
      { "Year": "2022", "Medical Budget": 3564000, "Dental Budget": 198000, "Vision Budget": 48000, "Total Budget": 3810000, "Increase %": 9.8 },
      { "Year": "2023", "Medical Budget": 3920400, "Dental Budget": 207900, "Vision Budget": 50400, "Total Budget": 4178700, "Increase %": 9.7 },
      { "Year": "2024", "Medical Budget": 4312440, "Dental Budget": 218295, "Vision Budget": 52920, "Total Budget": 4583655, "Increase %": 9.7 },
      { "Year": "2025", "Medical Budget": 4743684, "Dental Budget": 229210, "Vision Budget": 55566, "Total Budget": 5028460, "Increase %": 9.7 }
    ]
  },
  {
    name: "Benefit Satisfaction",
    headers: ["Benefit Type", "Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied", "Avg Rating"],
    rows: [
      { "Benefit Type": "Medical Plans", "Very Satisfied": 145, "Satisfied": 198, "Neutral": 78, "Dissatisfied": 25, "Very Dissatisfied": 9, "Avg Rating": 3.9 },
      { "Benefit Type": "Dental Plans", "Very Satisfied": 167, "Satisfied": 213, "Neutral": 56, "Dissatisfied": 15, "Very Dissatisfied": 4, "Avg Rating": 4.2 },
      { "Benefit Type": "Vision Plans", "Very Satisfied": 189, "Satisfied": 201, "Neutral": 45, "Dissatisfied": 18, "Very Dissatisfied": 2, "Avg Rating": 4.2 },
      { "Benefit Type": "Retirement Plan", "Very Satisfied": 134, "Satisfied": 176, "Neutral": 98, "Dissatisfied": 34, "Very Dissatisfied": 13, "Avg Rating": 3.7 },
      { "Benefit Type": "Time Off Policy", "Very Satisfied": 201, "Satisfied": 189, "Neutral": 45, "Dissatisfied": 16, "Very Dissatisfied": 4, "Avg Rating": 4.2 }
    ]
  }
];

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
  const [sheets, setSheets] = useState<ParsedSheet[]>(sampleHealthcareData);
  const [selectedSheetName, setSelectedSheetName] = useState<string | null>(sampleHealthcareData[0]?.name ?? null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>(defaultChartConfig);

  const selectedSheet = useMemo(() => {
    return sheets.find((sheet) => sheet.name === selectedSheetName) ?? null;
  }, [sheets, selectedSheetName]);

  const handleSheetsParsed = useCallback((parsed: ParsedSheet[]) => {
    // If user uploads new data, replace sample data with uploaded data
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
              <span className="font-medium text-blue-700"> Sample healthcare data is pre-loaded for demonstration.</span>
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
