'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { PlotParams } from 'react-plotly.js';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
      <div className="text-gray-500">Loading chart...</div>
    </div>
  )
});

interface PlotlyChartProps extends Partial<PlotParams> {
  title?: string;
  height?: number;
  width?: number;
}

/**
 * Unified Plotly chart component
 * Supports all Plotly chart types through the data prop
 */
export function PlotlyChart({ 
  data = [], 
  layout = {}, 
  config = {},
  title,
  height = 400,
  width,
  ...props 
}: PlotlyChartProps) {
  const defaultLayout = {
    title: title || '',
    height,
    width: width || undefined,
    autosize: !width,
    margin: { l: 50, r: 50, t: title ? 60 : 30, b: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      family: 'Inter, system-ui, sans-serif',
      color: '#374151'
    },
    xaxis: {
      gridcolor: '#E5E7EB',
      zerolinecolor: '#E5E7EB'
    },
    yaxis: {
      gridcolor: '#E5E7EB',
      zerolinecolor: '#E5E7EB'
    },
    ...layout
  };

  const defaultConfig = {
    responsive: true,
    displayModeBar: false,
    ...config
  };

  return (
    <Plot
      data={data}
      layout={defaultLayout}
      config={defaultConfig}
      {...props}
    />
  );
}

// Helper functions for common chart types
export const createBarChart = (
  x: any[],
  y: any[],
  name?: string,
  color?: string
) => ({
  type: 'bar' as const,
  x,
  y,
  name: name || '',
  marker: {
    color: color || '#6366F1'
  }
});

export const createLineChart = (
  x: any[],
  y: any[],
  name?: string,
  color?: string
) => ({
  type: 'scatter' as const,
  mode: 'lines+markers' as const,
  x,
  y,
  name: name || '',
  line: {
    color: color || '#6366F1',
    width: 2
  },
  marker: {
    size: 6
  }
});

export const createPieChart = (
  labels: string[],
  values: number[],
  colors?: string[]
) => ({
  type: 'pie' as const,
  labels,
  values,
  marker: {
    colors: colors || [
      '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
      '#F59E0B', '#10B981', '#3B82F6', '#6B7280'
    ]
  },
  textposition: 'inside' as const,
  textinfo: 'label+percent' as const
});

export const createScatterChart = (
  x: any[],
  y: any[],
  name?: string,
  size?: number[],
  color?: string | string[]
) => ({
  type: 'scatter' as const,
  mode: 'markers' as const,
  x,
  y,
  name: name || '',
  marker: {
    size: size || 10,
    color: color || '#6366F1',
    opacity: 0.7
  }
});

export const createBoxPlot = (
  y: number[],
  name?: string,
  color?: string
) => ({
  type: 'box' as const,
  y,
  name: name || '',
  marker: {
    color: color || '#6366F1'
  }
});