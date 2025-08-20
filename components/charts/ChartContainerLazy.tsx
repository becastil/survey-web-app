'use client';

import dynamic from 'next/dynamic';
import { VisualizationSpec } from 'vega-embed';

// Lazy load the chart component to avoid build issues
const ChartContainer = dynamic(() => import('./ChartContainer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse bg-gray-200 rounded-lg w-full h-full" />
    </div>
  ),
});

interface ChartContainerLazyProps {
  spec: VisualizationSpec;
  data?: Record<string, unknown>[];
  width?: number;
  height?: number;
  className?: string;
}

export default function ChartContainerLazy(props: ChartContainerLazyProps) {
  return <ChartContainer {...props} />;
}