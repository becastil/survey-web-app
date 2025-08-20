'use client';

import ChartContainer from './ChartContainer';

interface PieChartProps {
  data: Record<string, unknown>[];
  categoryField: string;
  valueField: string;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function PieChart({
  data,
  categoryField,
  valueField,
  title,
  width = 400,
  height = 300,
  className = '',
}: PieChartProps) {
  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    title: title || '',
    mark: {
      type: 'arc',
      innerRadius: 50,
      stroke: '#fff',
      strokeWidth: 2,
    },
    encoding: {
      theta: {
        field: valueField,
        type: 'quantitative' as const,
        stack: true,
      },
      color: {
        field: categoryField,
        type: 'nominal' as const,
        legend: {
          title: categoryField,
        },
      },
      tooltip: [
        { field: categoryField, type: 'nominal' as const },
        { field: valueField, type: 'quantitative' as const },
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