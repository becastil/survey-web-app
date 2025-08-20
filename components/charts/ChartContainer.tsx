'use client';

import { VegaLite } from 'react-vega';
import { VisualizationSpec } from 'vega-embed';

interface ChartContainerProps {
  spec: VisualizationSpec;
  data?: Record<string, unknown>[];
  width?: number;
  height?: number;
  className?: string;
}

export default function ChartContainer({
  spec,
  data,
  width = 400,
  height = 300,
  className = '',
}: ChartContainerProps) {
  const finalSpec = {
    ...spec,
    width,
    height,
    data: data ? { name: 'table', values: data } : spec.data,
    config: {
      view: {
        stroke: 'transparent',
      },
      axis: {
        domainColor: '#e5e7eb',
        gridColor: '#f3f4f6',
        tickColor: '#e5e7eb',
        labelColor: '#6b7280',
        titleColor: '#374151',
      },
      legend: {
        labelColor: '#6b7280',
        titleColor: '#374151',
      },
      ...spec.config,
    },
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <VegaLite spec={finalSpec} />
    </div>
  );
}