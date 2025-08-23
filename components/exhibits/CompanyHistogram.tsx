'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface CompanyHistogramProps {
  data: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  mean?: number;
  median?: number;
  yourPosition?: string;
  title?: string;
  description?: string;
}

export function CompanyHistogram({
  data,
  mean,
  median,
  yourPosition,
  title = "Company Size Distribution",
  description = "Distribution of organizations by employee count"
}: CompanyHistogramProps) {

  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      isYourPosition: item.range === yourPosition,
      fill: item.range === yourPosition ? '#8b5cf6' : '#e2e8f0'
    }));
  }, [data, yourPosition]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold">{data.range}</p>
          <p className="text-sm text-muted-foreground">
            Organizations: {data.count}
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: {data.percentage}%
          </p>
          {data.isYourPosition && (
            <p className="text-sm font-semibold text-purple-600 mt-1">
              Your Position
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props: any) => {
    const { fill, x, y, width, height, payload } = props;
    const isHighlighted = payload.isYourPosition;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={isHighlighted ? '#8b5cf6' : '#cbd5e1'}
          className={isHighlighted ? 'animate-pulse' : ''}
          rx={4}
        />
        {isHighlighted && (
          <text
            x={x + width / 2}
            y={y - 5}
            fill="#8b5cf6"
            textAnchor="middle"
            className="text-xs font-semibold"
          >
            You
          </text>
        )}
      </g>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="range" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ 
                  value: 'Number of Organizations', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 12 }
                }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Statistical reference lines */}
              {mean && (
                <ReferenceLine 
                  y={mean} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: `Mean: ${mean}`, position: "right", fontSize: 10 }}
                />
              )}
              {median && (
                <ReferenceLine 
                  y={median} 
                  stroke="#3b82f6" 
                  strokeDasharray="5 5"
                  label={{ value: `Median: ${median}`, position: "right", fontSize: 10 }}
                />
              )}
              
              <Bar 
                dataKey="count" 
                shape={CustomBar}
                animationDuration={800}
                animationBegin={0}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">
              {data.reduce((sum, item) => sum + item.count, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Orgs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{data.length}</p>
            <p className="text-sm text-muted-foreground">Size Ranges</p>
          </div>
          {mean && (
            <div className="text-center">
              <p className="text-2xl font-bold">{mean.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Mean Size</p>
            </div>
          )}
          {median && (
            <div className="text-center">
              <p className="text-2xl font-bold">{median.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Median Size</p>
            </div>
          )}
        </div>

        {/* Distribution Insights */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-semibold mb-1">Distribution Insights</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Most common size range: {data.reduce((max, item) => item.count > max.count ? item : max).range}</li>
            <li>• Largest concentration: {Math.max(...data.map(d => d.percentage))}% in a single range</li>
            {yourPosition && <li className="text-purple-600 font-semibold">• Your organization: {yourPosition} employees</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}