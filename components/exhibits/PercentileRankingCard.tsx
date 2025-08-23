'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Trophy, Target, AlertTriangle } from 'lucide-react';

interface PercentileRankingCardProps {
  metric: string;
  value: number;
  percentile: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  benchmark?: number;
  category?: string;
}

export function PercentileRankingCard({
  metric,
  value,
  percentile,
  trend,
  trendValue,
  benchmark,
  category = "Overall"
}: PercentileRankingCardProps) {
  
  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-emerald-600 bg-emerald-50';
    if (percentile >= 75) return 'text-blue-600 bg-blue-50';
    if (percentile >= 50) return 'text-amber-600 bg-amber-50';
    if (percentile >= 25) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getPercentileLabel = (percentile: number) => {
    if (percentile >= 90) return 'Top Performer';
    if (percentile >= 75) return 'Above Average';
    if (percentile >= 50) return 'Average';
    if (percentile >= 25) return 'Below Average';
    return 'Needs Improvement';
  };

  const getPercentileIcon = (percentile: number) => {
    if (percentile >= 90) return <Trophy className="w-4 h-4" />;
    if (percentile >= 50) return <Target className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    if (val < 1 && val > 0) return val.toFixed(2);
    return val.toLocaleString();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{metric}</CardTitle>
            <CardDescription className="text-xs mt-1">{category}</CardDescription>
          </div>
          <Badge variant="outline" className={`${getPercentileColor(percentile)} border-0`}>
            {getPercentileIcon(percentile)}
            <span className="ml-1">{getPercentileLabel(percentile)}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Main Value */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{formatValue(value)}</span>
          {trend && trendValue !== undefined && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={`text-sm ${
                trend === 'up' ? 'text-emerald-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {trendValue > 0 ? '+' : ''}{trendValue}%
              </span>
            </div>
          )}
        </div>

        {/* Percentile Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Percentile Rank</span>
            <span className="font-semibold">{percentile}th</span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`absolute left-0 top-0 h-full transition-all duration-700 ease-out rounded-full ${
                percentile >= 90 ? 'bg-emerald-500' :
                percentile >= 75 ? 'bg-blue-500' :
                percentile >= 50 ? 'bg-amber-500' :
                percentile >= 25 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${percentile}%` }}
            />
            {/* Benchmark marker */}
            {benchmark && (
              <div 
                className="absolute top-0 w-0.5 h-2 bg-gray-600"
                style={{ left: `${benchmark}%` }}
                title={`Industry Benchmark: ${benchmark}th percentile`}
              />
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Comparison Text */}
        <div className="mt-3 text-sm text-muted-foreground">
          You rank higher than <span className="font-semibold text-foreground">{percentile}%</span> of organizations
        </div>

        {/* Benchmark Comparison */}
        {benchmark && (
          <div className="mt-2 pt-2 border-t text-xs">
            <span className="text-muted-foreground">Industry Benchmark: </span>
            <span className="font-semibold">
              {percentile >= benchmark ? (
                <span className="text-emerald-600">+{percentile - benchmark} points above</span>
              ) : (
                <span className="text-red-600">{benchmark - percentile} points below</span>
              )}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}