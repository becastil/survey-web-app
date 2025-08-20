'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { VisualizationSpec } from 'vega-embed';

// Loading component
const ChartLoading = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="animate-pulse bg-gray-200 rounded-lg w-full h-full min-h-[300px]" />
  </div>
);

// Error fallback component
const ChartError = ({ error }: { error?: string }) => (
  <div className="flex items-center justify-center h-full w-full p-4">
    <div className="text-center">
      <p className="text-gray-500">Unable to load chart</p>
      {error && <p className="text-xs text-gray-400 mt-1">{error}</p>}
    </div>
  </div>
);

interface ChartContainerProps {
  spec: VisualizationSpec;
  data?: Record<string, unknown>[];
  width?: number;
  height?: number;
  className?: string;
}

// Dynamically import VegaLite only when needed
const VegaLiteChart = dynamic(
  () => import('react-vega').then(mod => {
    const VegaLiteComponent = ({ spec, className }: any) => {
      const { VegaLite } = mod;
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <VegaLite spec={spec} />
        </div>
      );
    };
    return VegaLiteComponent;
  }),
  {
    loading: () => <ChartLoading />,
    ssr: false, // Disable SSR for Vega charts
  }
);

export default function ChartContainerDynamic({
  spec,
  data,
  width = 400,
  height = 300,
  className = '',
}: ChartContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ChartLoading />;
  }

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
    <Suspense fallback={<ChartLoading />}>
      <VegaLiteChart spec={finalSpec} className={className} />
    </Suspense>
  );
}