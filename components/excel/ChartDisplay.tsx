'use client';

import { useCallback, useMemo, useRef, type ReactElement } from 'react';
import { toPng } from 'html-to-image';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts';

import type { ChartConfig } from '../../types/excel';

const COLOR_PALETTE = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#ec4899'];

type ChartDisplayProps = {
  dataRows: Record<string, any>[];
  config: ChartConfig;
};

type BuiltChartData = {
  data: Record<string, any>[];
  seriesKeys: string[];
  xDataKey: string;
  warnings: string[];
};

const parseNumeric = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) {
      return null;
    }
    const cleaned = normalized.replace(/[^0-9.-]+/g, '');
    if (!cleaned) {
      return null;
    }
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const buildPieData = (rows: Record<string, any>[], config: ChartConfig): BuiltChartData => {
  const warnings: string[] = [];
  const categoryKey = config.categoryKey;
  if (!categoryKey) {
    warnings.push('Select a category column for the pie chart.');
    return { data: [], seriesKeys: [], xDataKey: 'name', warnings };
  }

  const aggregateMap = new Map<string, number>();
  rows.forEach((row) => {
    const rawCategory = row[categoryKey];
    const category = rawCategory === null || rawCategory === undefined || rawCategory === '' ? 'Unspecified' : String(rawCategory);

    if (config.aggregate === 'count' || !config.valueKey) {
      aggregateMap.set(category, (aggregateMap.get(category) ?? 0) + 1);
    } else {
      const value = parseNumeric(row[config.valueKey]);
      if (value !== null) {
        aggregateMap.set(category, (aggregateMap.get(category) ?? 0) + value);
      }
    }
  });

  if (!aggregateMap.size) {
    warnings.push('No values available for the selected columns.');
  }

  const data = Array.from(aggregateMap.entries()).map(([name, value]) => ({ name, value }));
  return { data, seriesKeys: ['value'], xDataKey: 'name', warnings };
};

const buildCategoricalData = (rows: Record<string, any>[], config: ChartConfig): BuiltChartData => {
  const warnings: string[] = [];
  const xKey = config.xKey;
  if (!xKey) {
    warnings.push('Select a column for the X axis.');
    return { data: [], seriesKeys: [], xDataKey: '', warnings };
  }

  const yKey = config.yKeys[0];
  if (config.aggregate === 'sum' && !yKey) {
    warnings.push('Select a numeric column for the Y axis.');
    return { data: [], seriesKeys: [], xDataKey: xKey, warnings };
  }

  const grouped = new Map<string, Record<string, any>>();
  const seriesSet = new Set<string>();

  rows.forEach((row) => {
    const rawX = row[xKey];
    if (rawX === null || rawX === undefined || rawX === '') {
      return;
    }

    const xLabel = typeof rawX === 'string' ? rawX : rawX instanceof Date ? rawX.toISOString() : String(rawX);
    const bucket = grouped.get(xLabel) ?? { [xKey]: rawX };

    if (config.groupKey) {
      const rawGroup = row[config.groupKey];
      const groupLabel = rawGroup === null || rawGroup === undefined || rawGroup === '' ? 'Unspecified' : String(rawGroup);
      seriesSet.add(groupLabel);

      if (config.aggregate === 'count') {
        bucket[groupLabel] = (bucket[groupLabel] ?? 0) + 1;
      } else if (yKey) {
        const numeric = parseNumeric(row[yKey]);
        if (numeric !== null) {
          bucket[groupLabel] = (bucket[groupLabel] ?? 0) + numeric;
        }
      }
    } else {
      const targetKey = config.aggregate === 'count' ? 'Count' : (yKey ?? 'Value');
      seriesSet.add(targetKey);

      if (config.aggregate === 'count') {
        bucket[targetKey] = (bucket[targetKey] ?? 0) + 1;
      } else if (yKey) {
        const numeric = parseNumeric(row[yKey]);
        if (numeric !== null) {
          bucket[targetKey] = (bucket[targetKey] ?? 0) + numeric;
        }
      }
    }

    grouped.set(xLabel, bucket);
  });

  if (!grouped.size) {
    warnings.push('No values available for the selected columns.');
  }

  return {
    data: Array.from(grouped.values()),
    seriesKeys: Array.from(seriesSet.values()),
    xDataKey: xKey,
    warnings
  };
};

const buildScatterData = (rows: Record<string, any>[], config: ChartConfig): BuiltChartData => {
  const warnings: string[] = [];
  const xKey = config.xKey;
  const yKey = config.yKeys[0];

  if (!xKey || !yKey) {
    warnings.push('Scatter plots require numeric X and Y columns.');
    return { data: [], seriesKeys: [], xDataKey: xKey ?? '', warnings };
  }

  const data: Record<string, any>[] = [];
  rows.forEach((row) => {
    const xValue = parseNumeric(row[xKey]);
    const yValue = parseNumeric(row[yKey]);
    if (xValue !== null && yValue !== null) {
      data.push({ [xKey]: xValue, [yKey]: yValue });
    }
  });

  if (!data.length) {
    warnings.push('No numeric data points available for the selected columns.');
  }

  return { data, seriesKeys: [yKey], xDataKey: xKey, warnings };
};

export function ChartDisplay({ dataRows, config }: ChartDisplayProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const { chartData, seriesKeys, xDataKey, warnings } = useMemo(() => {
    if (!dataRows.length) {
      return {
        chartData: [],
        seriesKeys: [],
        xDataKey: config.xKey ?? 'name',
        warnings: ['Upload a worksheet and select the columns to visualise results.']
      };
    }

    if (config.type === 'pie') {
      const result = buildPieData(dataRows, config);
      return {
        chartData: result.data,
        seriesKeys: result.seriesKeys,
        xDataKey: result.xDataKey,
        warnings: result.warnings
      };
    }

    if (config.type === 'scatter') {
      const result = buildScatterData(dataRows, config);
      return {
        chartData: result.data,
        seriesKeys: result.seriesKeys,
        xDataKey: result.xDataKey,
        warnings: result.warnings
      };
    }

    const result = buildCategoricalData(dataRows, config);
    return {
      chartData: result.data,
      seriesKeys: result.seriesKeys,
      xDataKey: result.xDataKey,
      warnings: result.warnings
    };
  }, [config, dataRows]);

  const chartElement = useMemo<ReactElement | null>(() => {
    if (!chartData.length) {
      return null;
    }

    switch (config.type) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xDataKey} tick={{ fill: '#475569', fontSize: 12 }} interval="preserveStartEnd" height={50} angle={-15} textAnchor="end" />
            <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip />
            {seriesKeys.length > 1 && <Legend />}
            {seriesKeys.map((series, index) => (
              <Bar
                key={series}
                dataKey={series}
                fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xDataKey} tick={{ fill: '#475569', fontSize: 12 }} interval="preserveStartEnd" height={50} angle={-15} textAnchor="end" />
            <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip />
            {seriesKeys.length > 1 && <Legend />}
            {seriesKeys.map((series, index) => (
              <Line
                key={series}
                type="monotone"
                dataKey={series}
                stroke={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xDataKey} tick={{ fill: '#475569', fontSize: 12 }} interval="preserveStartEnd" height={50} angle={-15} textAnchor="end" />
            <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip />
            {seriesKeys.length > 1 && <Legend />}
            {seriesKeys.map((series, index) => (
              <Area
                key={series}
                type="monotone"
                dataKey={series}
                stroke={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                fillOpacity={0.2}
                fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
              />
            ))}
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`slice-${entry.name}-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      case 'scatter': {
        const yKey = seriesKeys[0] ?? 'value';
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xDataKey} tick={{ fill: '#475569', fontSize: 12 }} type="number" />
            <YAxis dataKey={yKey} tick={{ fill: '#475569', fontSize: 12 }} type="number" />
            <Tooltip cursor={{ strokeDasharray: '4 4' }} />
            <Scatter data={chartData} fill={COLOR_PALETTE[0]} />
          </ScatterChart>
        );
      }
      default:
        return null;
    }
  }, [chartData, config.type, seriesKeys, xDataKey]);

  const handleExportChart = useCallback(async () => {
    if (!chartContainerRef.current) {
      return;
    }
    try {
      const dataUrl = await toPng(chartContainerRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `survey-chart-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export chart', error);
    }
  }, []);

  const canRender = chartData.length > 0 && !warnings.length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Visualization</h2>
          <p className="text-xs text-slate-500">Interactive chart updates as you adjust the configuration.</p>
        </div>
        <button
          type="button"
          onClick={handleExportChart}
          disabled={!canRender}
          className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
            canRender
              ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
          }`}
        >
          Download PNG
        </button>
      </div>
      <div className="h-[360px] px-4 py-4" ref={chartContainerRef}>
        {canRender && chartElement ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartElement}
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
            {warnings.length ? warnings[0] : 'Configure chart options to view the visualization.'}
          </div>
        )}
      </div>
      {warnings.length > 0 && canRender && (
        <div className="border-t border-slate-200 px-4 py-3 text-xs text-amber-600">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      )}
    </div>
  );
}
