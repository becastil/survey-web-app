'use client';

import ChartContainer from './ChartContainer';

interface LineChartProps {
  data: Record<string, unknown>[];
  xField: string;
  yField: string;
  title?: string;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  temporal?: boolean;
}

export default function LineChart({
  data,
  xField,
  yField,
  title,
  color = '#4f46e5',
  width = 400,
  height = 300,
  className = '',
  temporal = false,
}: LineChartProps) {
  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    title: title || '',
    mark: {
      type: 'line',
      color,
      strokeWidth: 2,
      point: {
        filled: true,
        fill: color,
      },
    },
    encoding: {
      x: {
        field: xField,
        type: temporal ? ('temporal' as const) : ('ordinal' as const),
        axis: {
          title: xField,
          ...(temporal && { format: '%b %d' }),
        },
      },
      y: {
        field: yField,
        type: 'quantitative' as const,
        axis: {
          title: yField,
        },
      },
      tooltip: [
        { field: xField, type: temporal ? ('temporal' as const) : ('ordinal' as const) },
        { field: yField, type: 'quantitative' as const },
      ],
    },
  };

  return (
    <ChartContainer
      spec={spec}
      data={data}
      width={width}
      height={height}
      className={className}
    />
  );
}