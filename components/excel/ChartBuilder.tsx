'use client';

import { Fragment, useMemo } from 'react';

import type { ChartConfig, ChartType } from '../../types/excel';

type ChartBuilderProps = {
  availableColumns: string[];
  config: ChartConfig;
  onChange: (config: ChartConfig) => void;
};

const chartTypeOptions: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'pie', label: 'Pie' },
  { value: 'scatter', label: 'Scatter' }
];

const aggregateOptions = [
  { value: 'sum', label: 'Sum values' },
  { value: 'count', label: 'Count rows' }
] as const;

const ensureSingleYKey = (keys: string[], nextKey: string | null) => {
  if (!nextKey) {
    return [];
  }
  return [nextKey];
};

export function ChartBuilder({ availableColumns, config, onChange }: ChartBuilderProps) {
  const usableColumns = useMemo(() => {
    return availableColumns.length ? availableColumns : [];
  }, [availableColumns]);

  const handleTypeChange = (value: ChartType) => {
    if (value === 'pie') {
      onChange({
        ...config,
        type: value,
        aggregate: config.aggregate === 'count' ? 'count' : 'sum',
        categoryKey: config.categoryKey ?? config.xKey ?? usableColumns[0] ?? null,
        valueKey: config.valueKey ?? usableColumns[1] ?? null,
        xKey: null,
        yKeys: [],
        groupKey: null
      });
    } else {
      const nextAggregate = value === 'scatter' ? 'sum' : config.aggregate;
      onChange({
        ...config,
        type: value,
        aggregate: nextAggregate,
        xKey: config.xKey ?? config.categoryKey ?? usableColumns[0] ?? null,
        yKeys: config.yKeys.length ? config.yKeys : ensureSingleYKey([], config.valueKey ?? usableColumns[1] ?? null),
        categoryKey: null,
        valueKey: null,
        groupKey: value === 'scatter' ? null : config.groupKey
      });
    }
  };

  const handleAggregateChange = (value: 'sum' | 'count') => {
    onChange({
      ...config,
      aggregate: value,
      yKeys: value === 'count' ? [] : config.yKeys,
      valueKey: value === 'count' ? null : config.valueKey
    });
  };

  const handleXKeyChange = (value: string | null) => {
    onChange({
      ...config,
      xKey: value
    });
  };

  const handleYKeyChange = (value: string | null) => {
    onChange({
      ...config,
      yKeys: ensureSingleYKey(config.yKeys, value)
    });
  };

  const handleGroupKeyChange = (value: string | null) => {
    onChange({
      ...config,
      groupKey: value
    });
  };

  const handleCategoryKeyChange = (value: string | null) => {
    onChange({
      ...config,
      categoryKey: value
    });
  };

  const handleValueKeyChange = (value: string | null) => {
    onChange({
      ...config,
      valueKey: value
    });
  };

  const renderSelect = (
    id: string,
    label: string,
    value: string | null,
    onValueChange: (value: string | null) => void,
    placeholder = 'Select column'
  ) => {
    return (
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        <span className="font-medium">{label}</span>
        <select
          id={id}
          value={value ?? ''}
          onChange={(event) => {
            const selected = event.target.value;
            onValueChange(selected ? selected : null);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">{placeholder}</option>
          {usableColumns.map((column) => (
            <option key={`${id}-${column}`} value={column}>
              {column}
            </option>
          ))}
        </select>
      </label>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-700">Chart builder</h2>
        <p className="text-xs text-slate-500">
          Configure the chart type and the columns used for axes and values. Aggregations are applied when duplicate categories exist.
        </p>
      </div>
      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          <span className="font-medium">Chart type</span>
          <select
            value={config.type}
            onChange={(event) => handleTypeChange(event.target.value as ChartType)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {chartTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          <span className="font-medium">Aggregation</span>
          <select
            value={config.aggregate}
            onChange={(event) => handleAggregateChange(event.target.value as 'sum' | 'count')}
            disabled={config.type === 'scatter'}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {aggregateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {config.type !== 'pie' ? (
          <Fragment>
            {renderSelect('x-column', 'X-axis column', config.xKey, handleXKeyChange)}
            {config.aggregate === 'sum' && renderSelect('y-column', 'Y-axis values', config.yKeys[0] ?? null, handleYKeyChange)}
            {config.type !== 'scatter' &&
              renderSelect('group-column', 'Group / series (optional)', config.groupKey, handleGroupKeyChange, 'None')}
          </Fragment>
        ) : (
          <Fragment>
            {renderSelect('category-column', 'Category column', config.categoryKey, handleCategoryKeyChange)}
            {config.aggregate === 'sum'
              ? renderSelect('value-column', 'Value column', config.valueKey, handleValueKeyChange)
              : null}
          </Fragment>
        )}
      </div>
      <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
        <p>
          {config.type === 'scatter'
            ? 'Scatter plots expect numeric values on both axes. Aggregation is automatically set to sum.'
            : config.aggregate === 'sum'
              ? 'Sum aggregation adds numeric values for duplicate categories. For pie charts, choose a value column or switch to "Count rows".'
              : 'Count aggregation tallies how many rows fall into each category.'}
        </p>
      </div>
    </div>
  );
}
