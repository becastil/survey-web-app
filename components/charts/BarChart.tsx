'use client';

import ChartContainer from './ChartContainer';

interface BarChartProps {
  data: Record<string, unknown>[];
  xField: string;
  yField: string;
  title?: string;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function BarChart({
  data,
  xField,
  yField,
  title,
  color = '#4f46e5',
  width = 400,
  height = 300,
  className = '',
}: BarChartProps) {
  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    title: title || '',
    mark: {
      type: 'bar',
      color,
      cornerRadiusEnd: 4,
    },
    encoding: {
      x: {
        field: xField,
        type: 'ordinal' as const,
        axis: {
          labelAngle: -45,
          title: xField,
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
        { field: xField, type: 'ordinal' as const },
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