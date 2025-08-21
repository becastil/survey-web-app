/**
 * @module DataProcessor
 * @description Core data processing engine for healthcare survey analytics
 */

import * as ss from 'simple-statistics';
import { 
  mean, 
  median, 
  quantile, 
  deviation, 
  min, 
  max,
  group,
  rollup,
  sum
} from 'd3-array';
import Papa from 'papaparse';
import { z } from 'zod';
import { DataValidator } from './data-validator';

// Healthcare survey data types
export interface SurveyDataPoint {
  respondentId: string;
  organizationId: string;
  organizationName: string;
  region: string;
  subRegion?: string;
  responseDate: Date;
  completionTime: number; // in minutes
  responses: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ProcessedData {
  summary: DataSummary;
  regional: RegionalAnalysis[];
  temporal: TemporalAnalysis;
  benchmarks: BenchmarkComparison;
  insights: Insight[];
  quality: QualityMetrics;
}

export interface DataSummary {
  totalResponses: number;
  uniqueOrganizations: number;
  regions: string[];
  dateRange: { start: Date; end: Date };
  completionRate: number;
  avgCompletionTime: number;
  responseRate: number;
}

export interface RegionalAnalysis {
  region: string;
  responseCount: number;
  organizations: string[];
  metrics: {
    satisfaction: number;
    coverage: number;
    costEfficiency: number;
    accessibility: number;
  };
  demographics: {
    avgAge: number;
    genderDistribution: Record<string, number>;
    employmentTypes: Record<string, number>;
  };
  trends: {
    direction: 'up' | 'down' | 'stable';
    changePercent: number;
    significance: number; // p-value
  };
}

export interface TemporalAnalysis {
  daily: TimeSeriesData[];
  weekly: TimeSeriesData[];
  monthly: TimeSeriesData[];
  quarterly: TimeSeriesData[];
  seasonality: {
    pattern: string;
    strength: number;
  };
  forecast?: {
    nextPeriod: number;
    confidence: [number, number];
  };
}

export interface TimeSeriesData {
  date: Date;
  value: number;
  movingAverage?: number;
  trend?: number;
  seasonal?: number;
}

export interface BenchmarkComparison {
  industryAverage: Record<string, number>;
  percentileRank: Record<string, number>;
  topPerformers: Array<{
    metric: string;
    value: number;
    organization: string;
  }>;
  improvementAreas: Array<{
    metric: string;
    currentValue: number;
    targetValue: number;
    gap: number;
  }>;
}

export interface Insight {
  type: 'positive' | 'negative' | 'neutral' | 'action';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  dataPoints: any[];
  confidence: number;
}

export interface QualityMetrics {
  completeness: number;
  consistency: number;
  accuracy: number;
  timeliness: number;
  overallScore: number;
}

export interface ProcessingOptions {
  includeBenchmarks?: boolean;
  generateInsights?: boolean;
  temporalAnalysis?: boolean;
  outlierRemoval?: boolean;
  confidenceLevel?: number;
  minSampleSize?: number;
}

export class DataProcessor {
  private static readonly DEFAULT_OPTIONS: ProcessingOptions = {
    includeBenchmarks: true,
    generateInsights: true,
    temporalAnalysis: true,
    outlierRemoval: true,
    confidenceLevel: 0.95,
    minSampleSize: 30,
  };

  /**
   * Process raw survey data into structured analytics
   */
  static async processData(
    rawData: any[],
    options: ProcessingOptions = {}
  ): Promise<ProcessedData> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    // Parse and validate data
    const validatedData = await this.parseAndValidate(rawData);
    
    // Remove outliers if requested
    const cleanedData = opts.outlierRemoval 
      ? this.removeOutliers(validatedData)
      : validatedData;

    // Generate analyses
    const [summary, regional, temporal, benchmarks, quality] = await Promise.all([
      this.generateSummary(cleanedData),
      this.analyzeRegions(cleanedData),
      opts.temporalAnalysis ? this.analyzeTemporalPatterns(cleanedData) : null,
      opts.includeBenchmarks ? this.generateBenchmarks(cleanedData) : null,
      this.assessDataQuality(cleanedData),
    ]);

    // Generate insights based on all analyses
    const insights = opts.generateInsights 
      ? await this.generateInsights(cleanedData, { summary, regional, temporal, benchmarks })
      : [];

    return {
      summary,
      regional,
      temporal: temporal || this.emptyTemporalAnalysis(),
      benchmarks: benchmarks || this.emptyBenchmarks(),
      insights,
      quality,
    };
  }

  /**
   * Parse and validate raw data
   */
  private static async parseAndValidate(rawData: any[]): Promise<SurveyDataPoint[]> {
    const validated: SurveyDataPoint[] = [];
    
    for (const row of rawData) {
      try {
        const point: SurveyDataPoint = {
          respondentId: row.respondentId || row.id || `resp-${Date.now()}`,
          organizationId: row.organizationId || row.org_id || 'unknown',
          organizationName: row.organizationName || row.organization || 'Unknown',
          region: row.region || row.Region || 'Unspecified',
          subRegion: row.subRegion || row.sub_region,
          responseDate: new Date(row.responseDate || row.date || Date.now()),
          completionTime: parseFloat(row.completionTime || row.time || '15'),
          responses: row.responses || row,
          metadata: row.metadata,
        };
        validated.push(point);
      } catch (error) {
        console.warn('Skipping invalid data point:', error);
      }
    }
    
    return validated;
  }

  /**
   * Remove statistical outliers using IQR method
   */
  private static removeOutliers(data: SurveyDataPoint[]): SurveyDataPoint[] {
    // For numeric response fields, remove outliers
    const numericFields = this.identifyNumericFields(data);
    
    return data.filter(point => {
      for (const field of numericFields) {
        const value = point.responses[field];
        if (typeof value === 'number') {
          const values = data.map(d => d.responses[field]).filter(v => typeof v === 'number');
          const q1 = quantile(values, 0.25) || 0;
          const q3 = quantile(values, 0.75) || 0;
          const iqr = q3 - q1;
          const lowerBound = q1 - 1.5 * iqr;
          const upperBound = q3 + 1.5 * iqr;
          
          if (value < lowerBound || value > upperBound) {
            return false; // Remove this outlier
          }
        }
      }
      return true;
    });
  }

  /**
   * Generate summary statistics
   */
  private static async generateSummary(data: SurveyDataPoint[]): Promise<DataSummary> {
    const organizations = new Set(data.map(d => d.organizationId));
    const regions = new Set(data.map(d => d.region));
    const dates = data.map(d => d.responseDate);
    
    return {
      totalResponses: data.length,
      uniqueOrganizations: organizations.size,
      regions: Array.from(regions),
      dateRange: {
        start: new Date(Math.min(...dates.map(d => d.getTime()))),
        end: new Date(Math.max(...dates.map(d => d.getTime()))),
      },
      completionRate: this.calculateCompletionRate(data),
      avgCompletionTime: mean(data, d => d.completionTime) || 0,
      responseRate: this.calculateResponseRate(data),
    };
  }

  /**
   * Analyze data by region
   */
  private static async analyzeRegions(data: SurveyDataPoint[]): Promise<RegionalAnalysis[]> {
    const regions = group(data, d => d.region);
    const analyses: RegionalAnalysis[] = [];
    
    for (const [region, regionData] of regions) {
      const organizations = new Set(regionData.map(d => d.organizationName));
      
      // Calculate regional metrics
      const metrics = this.calculateRegionalMetrics(regionData);
      const demographics = this.calculateDemographics(regionData);
      const trends = this.calculateTrends(regionData);
      
      analyses.push({
        region,
        responseCount: regionData.length,
        organizations: Array.from(organizations),
        metrics,
        demographics,
        trends,
      });
    }
    
    return analyses.sort((a, b) => b.responseCount - a.responseCount);
  }

  /**
   * Analyze temporal patterns
   */
  private static async analyzeTemporalPatterns(data: SurveyDataPoint[]): Promise<TemporalAnalysis> {
    // Group by time periods
    const daily = this.aggregateByPeriod(data, 'day');
    const weekly = this.aggregateByPeriod(data, 'week');
    const monthly = this.aggregateByPeriod(data, 'month');
    const quarterly = this.aggregateByPeriod(data, 'quarter');
    
    // Detect seasonality
    const seasonality = this.detectSeasonality(monthly);
    
    // Generate forecast (simple moving average for now)
    const forecast = this.generateForecast(monthly);
    
    return {
      daily,
      weekly,
      monthly,
      quarterly,
      seasonality,
      forecast,
    };
  }

  /**
   * Generate benchmark comparisons
   */
  private static async generateBenchmarks(data: SurveyDataPoint[]): Promise<BenchmarkComparison> {
    // Healthcare industry benchmarks (would be loaded from database in production)
    const industryBenchmarks = {
      satisfaction: 4.2,
      coverage: 85,
      costEfficiency: 78,
      accessibility: 90,
      responseRate: 65,
    };
    
    // Calculate current metrics
    const currentMetrics = this.calculateOverallMetrics(data);
    
    // Calculate percentile ranks
    const percentileRanks: Record<string, number> = {};
    for (const [metric, value] of Object.entries(currentMetrics)) {
      percentileRanks[metric] = this.calculatePercentileRank(value, industryBenchmarks[metric as keyof typeof industryBenchmarks] || 0);
    }
    
    // Identify top performers
    const topPerformers = this.identifyTopPerformers(data);
    
    // Identify improvement areas
    const improvementAreas = this.identifyImprovementAreas(currentMetrics, industryBenchmarks);
    
    return {
      industryAverage: industryBenchmarks,
      percentileRank: percentileRanks,
      topPerformers,
      improvementAreas,
    };
  }

  /**
   * Generate insights from processed data
   */
  private static async generateInsights(
    data: SurveyDataPoint[],
    analyses: any
  ): Promise<Insight[]> {
    const insights: Insight[] = [];
    
    // Regional insights
    if (analyses.regional) {
      const topRegion = analyses.regional[0];
      if (topRegion.metrics.satisfaction > 4.0) {
        insights.push({
          type: 'positive',
          category: 'Regional Performance',
          title: `${topRegion.region} Leading in Satisfaction`,
          description: `${topRegion.region} shows exceptional performance with ${topRegion.metrics.satisfaction.toFixed(1)}/5.0 satisfaction score, ${((topRegion.metrics.satisfaction - 4.0) / 4.0 * 100).toFixed(0)}% above target.`,
          impact: 'high',
          dataPoints: [topRegion],
          confidence: 0.95,
        });
      }
      
      // Find underperforming regions
      const underperforming = analyses.regional.filter((r: RegionalAnalysis) => r.metrics.satisfaction < 3.5);
      if (underperforming.length > 0) {
        insights.push({
          type: 'action',
          category: 'Regional Performance',
          title: 'Action Required: Underperforming Regions',
          description: `${underperforming.length} region(s) show satisfaction below 3.5. Immediate intervention recommended for: ${underperforming.map((r: RegionalAnalysis) => r.region).join(', ')}.`,
          impact: 'high',
          dataPoints: underperforming,
          confidence: 0.90,
        });
      }
    }
    
    // Temporal insights
    if (analyses.temporal?.seasonality) {
      if (analyses.temporal.seasonality.strength > 0.7) {
        insights.push({
          type: 'neutral',
          category: 'Temporal Patterns',
          title: 'Strong Seasonal Pattern Detected',
          description: `Survey responses show ${(analyses.temporal.seasonality.strength * 100).toFixed(0)}% seasonal variation. Consider adjusting outreach timing.`,
          impact: 'medium',
          dataPoints: [analyses.temporal.seasonality],
          confidence: 0.85,
        });
      }
    }
    
    // Benchmark insights
    if (analyses.benchmarks) {
      const belowBenchmark = Object.entries(analyses.benchmarks.percentileRank)
        .filter(([_, rank]) => rank < 50);
      
      if (belowBenchmark.length > 0) {
        insights.push({
          type: 'negative',
          category: 'Benchmarks',
          title: 'Below Industry Average Metrics',
          description: `${belowBenchmark.length} metrics performing below industry median. Focus areas: ${belowBenchmark.map(([m, _]) => m).join(', ')}.`,
          impact: 'high',
          dataPoints: belowBenchmark,
          confidence: 0.88,
        });
      }
    }
    
    // Completion rate insight
    if (analyses.summary?.completionRate < 0.7) {
      insights.push({
        type: 'action',
        category: 'Survey Performance',
        title: 'Low Completion Rate Alert',
        description: `Completion rate at ${(analyses.summary.completionRate * 100).toFixed(0)}% is below target. Consider survey length optimization.`,
        impact: 'medium',
        dataPoints: [analyses.summary],
        confidence: 0.92,
      });
    }
    
    return insights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  /**
   * Assess data quality
   */
  private static assessDataQuality(data: SurveyDataPoint[]): QualityMetrics {
    const completeness = this.calculateCompleteness(data);
    const consistency = this.calculateConsistency(data);
    const accuracy = this.calculateAccuracy(data);
    const timeliness = this.calculateTimeliness(data);
    
    const overallScore = (completeness + consistency + accuracy + timeliness) / 4;
    
    return {
      completeness,
      consistency,
      accuracy,
      timeliness,
      overallScore,
    };
  }

  // Helper methods
  private static identifyNumericFields(data: SurveyDataPoint[]): string[] {
    if (data.length === 0) return [];
    const fields: string[] = [];
    const sample = data[0].responses;
    
    for (const [key, value] of Object.entries(sample)) {
      if (typeof value === 'number') {
        fields.push(key);
      }
    }
    
    return fields;
  }

  private static calculateCompletionRate(data: SurveyDataPoint[]): number {
    const completed = data.filter(d => {
      const responseCount = Object.keys(d.responses).length;
      return responseCount > 10; // Assume >10 responses means completed
    }).length;
    return completed / data.length;
  }

  private static calculateResponseRate(data: SurveyDataPoint[]): number {
    // In production, this would compare against total invited
    // For now, return a simulated rate
    return 0.65 + Math.random() * 0.2;
  }

  private static calculateRegionalMetrics(data: SurveyDataPoint[]): RegionalAnalysis['metrics'] {
    return {
      satisfaction: this.extractMetric(data, 'satisfaction', 4.0),
      coverage: this.extractMetric(data, 'coverage', 85),
      costEfficiency: this.extractMetric(data, 'costEfficiency', 75),
      accessibility: this.extractMetric(data, 'accessibility', 88),
    };
  }

  private static extractMetric(data: SurveyDataPoint[], field: string, defaultValue: number): number {
    const values = data
      .map(d => d.responses[field])
      .filter(v => v !== undefined && v !== null)
      .map(v => typeof v === 'number' ? v : parseFloat(v));
    
    return values.length > 0 ? mean(values) || defaultValue : defaultValue;
  }

  private static calculateDemographics(data: SurveyDataPoint[]): RegionalAnalysis['demographics'] {
    // Extract demographic data (would be more sophisticated in production)
    const ages = data.map(d => d.responses.age || 45).filter(a => typeof a === 'number');
    
    return {
      avgAge: mean(ages) || 45,
      genderDistribution: {
        male: 0.48,
        female: 0.52,
        other: 0.01,
      },
      employmentTypes: {
        fullTime: 0.75,
        partTime: 0.15,
        contract: 0.10,
      },
    };
  }

  private static calculateTrends(data: SurveyDataPoint[]): RegionalAnalysis['trends'] {
    // Simple trend calculation (would use time series analysis in production)
    const recentData = data.filter(d => {
      const daysAgo = (Date.now() - d.responseDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });
    
    const olderData = data.filter(d => {
      const daysAgo = (Date.now() - d.responseDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo > 30 && daysAgo <= 60;
    });
    
    const recentAvg = this.extractMetric(recentData, 'satisfaction', 4.0);
    const olderAvg = this.extractMetric(olderData, 'satisfaction', 4.0);
    
    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      direction: changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable',
      changePercent,
      significance: 0.05, // Would calculate actual p-value in production
    };
  }

  private static aggregateByPeriod(
    data: SurveyDataPoint[],
    period: 'day' | 'week' | 'month' | 'quarter'
  ): TimeSeriesData[] {
    const grouped = rollup(
      data,
      v => v.length,
      d => this.getPeriodKey(d.responseDate, period)
    );
    
    return Array.from(grouped, ([date, value]) => ({
      date: new Date(date),
      value,
      movingAverage: value, // Would calculate actual MA in production
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private static getPeriodKey(date: Date, period: string): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    switch (period) {
      case 'day':
        return `${year}-${month + 1}-${day}`;
      case 'week':
        const week = Math.floor(day / 7);
        return `${year}-${month + 1}-W${week}`;
      case 'month':
        return `${year}-${month + 1}`;
      case 'quarter':
        const quarter = Math.floor(month / 3) + 1;
        return `${year}-Q${quarter}`;
      default:
        return `${year}-${month + 1}-${day}`;
    }
  }

  private static detectSeasonality(data: TimeSeriesData[]): TemporalAnalysis['seasonality'] {
    // Simple seasonality detection (would use FFT in production)
    if (data.length < 12) {
      return { pattern: 'insufficient data', strength: 0 };
    }
    
    const values = data.map(d => d.value);
    const stdDev = deviation(values) || 0;
    const meanVal = mean(values) || 1;
    const cv = stdDev / meanVal; // Coefficient of variation
    
    return {
      pattern: cv > 0.3 ? 'strong' : cv > 0.15 ? 'moderate' : 'weak',
      strength: Math.min(cv, 1),
    };
  }

  private static generateForecast(data: TimeSeriesData[]): TemporalAnalysis['forecast'] {
    if (data.length < 3) return undefined;
    
    // Simple moving average forecast
    const recentValues = data.slice(-3).map(d => d.value);
    const forecast = mean(recentValues) || 0;
    const stdDev = deviation(recentValues) || 0;
    
    return {
      nextPeriod: forecast,
      confidence: [forecast - 1.96 * stdDev, forecast + 1.96 * stdDev],
    };
  }

  private static calculateOverallMetrics(data: SurveyDataPoint[]): Record<string, number> {
    return {
      satisfaction: this.extractMetric(data, 'satisfaction', 4.0),
      coverage: this.extractMetric(data, 'coverage', 85),
      costEfficiency: this.extractMetric(data, 'costEfficiency', 75),
      accessibility: this.extractMetric(data, 'accessibility', 88),
      responseRate: this.calculateResponseRate(data) * 100,
    };
  }

  private static calculatePercentileRank(value: number, benchmark: number): number {
    // Simple percentile calculation
    const ratio = value / benchmark;
    return Math.min(100, Math.max(0, ratio * 50));
  }

  private static identifyTopPerformers(data: SurveyDataPoint[]): BenchmarkComparison['topPerformers'] {
    const byOrg = group(data, d => d.organizationName);
    const performers: BenchmarkComparison['topPerformers'] = [];
    
    for (const [org, orgData] of byOrg) {
      const satisfaction = this.extractMetric(orgData, 'satisfaction', 0);
      if (satisfaction > 4.5) {
        performers.push({
          metric: 'satisfaction',
          value: satisfaction,
          organization: org,
        });
      }
    }
    
    return performers.sort((a, b) => b.value - a.value).slice(0, 5);
  }

  private static identifyImprovementAreas(
    current: Record<string, number>,
    benchmarks: Record<string, number>
  ): BenchmarkComparison['improvementAreas'] {
    const areas: BenchmarkComparison['improvementAreas'] = [];
    
    for (const [metric, currentValue] of Object.entries(current)) {
      const targetValue = benchmarks[metric] || currentValue;
      const gap = targetValue - currentValue;
      
      if (gap > 0) {
        areas.push({
          metric,
          currentValue,
          targetValue,
          gap,
        });
      }
    }
    
    return areas.sort((a, b) => b.gap - a.gap);
  }

  private static calculateCompleteness(data: SurveyDataPoint[]): number {
    const scores = data.map(d => {
      const total = 20; // Expected number of responses
      const filled = Object.keys(d.responses).length;
      return filled / total;
    });
    return mean(scores) || 0;
  }

  private static calculateConsistency(data: SurveyDataPoint[]): number {
    // Check for logical consistency in responses
    // For now, return a simulated score
    return 0.92;
  }

  private static calculateAccuracy(data: SurveyDataPoint[]): number {
    // Check for data accuracy (would validate against known values in production)
    return 0.95;
  }

  private static calculateTimeliness(data: SurveyDataPoint[]): number {
    // Check how recent the data is
    const now = Date.now();
    const scores = data.map(d => {
      const age = (now - d.responseDate.getTime()) / (1000 * 60 * 60 * 24); // Days
      return Math.max(0, 1 - age / 365); // Decay over a year
    });
    return mean(scores) || 0;
  }

  private static emptyTemporalAnalysis(): TemporalAnalysis {
    return {
      daily: [],
      weekly: [],
      monthly: [],
      quarterly: [],
      seasonality: { pattern: 'none', strength: 0 },
    };
  }

  private static emptyBenchmarks(): BenchmarkComparison {
    return {
      industryAverage: {},
      percentileRank: {},
      topPerformers: [],
      improvementAreas: [],
    };
  }
}

export default DataProcessor;