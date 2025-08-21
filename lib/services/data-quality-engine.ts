/**
 * @module DataQualityEngine
 * @description Advanced data quality assessment and improvement engine
 */

import * as ss from 'simple-statistics';
import { mean, deviation, quantile } from 'd3-array';

export interface QualityAssessment {
  overallScore: number;
  dimensions: QualityDimensions;
  issues: QualityIssue[];
  recommendations: QualityRecommendation[];
  confidenceInterval: [number, number];
}

export interface QualityDimensions {
  completeness: DimensionScore;
  accuracy: DimensionScore;
  consistency: DimensionScore;
  validity: DimensionScore;
  timeliness: DimensionScore;
  uniqueness: DimensionScore;
}

export interface DimensionScore {
  score: number; // 0-100
  status: 'excellent' | 'good' | 'fair' | 'poor';
  details: string;
  affectedRecords: number;
  improvementPotential: number;
}

export interface QualityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  dimension: keyof QualityDimensions;
  description: string;
  affectedFields: string[];
  affectedRecords: number[];
  impact: string;
  autoFixable: boolean;
}

export interface QualityRecommendation {
  priority: 'immediate' | 'high' | 'medium' | 'low';
  action: string;
  expectedImprovement: number;
  effort: 'low' | 'medium' | 'high';
  automationAvailable: boolean;
}

export interface DataPattern {
  field: string;
  pattern: string;
  frequency: number;
  confidence: number;
  anomalies: any[];
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'range' | 'format' | 'unique' | 'reference' | 'custom';
  condition: any;
  errorMessage: string;
}

export class DataQualityEngine {
  private validationRules: ValidationRule[] = [];
  private benchmarks: Record<string, any> = {};

  constructor(rules?: ValidationRule[], benchmarks?: Record<string, any>) {
    this.validationRules = rules || this.getDefaultRules();
    this.benchmarks = benchmarks || this.getDefaultBenchmarks();
  }

  /**
   * Perform comprehensive quality assessment
   */
  async assessQuality(data: any[]): Promise<QualityAssessment> {
    if (!data || data.length === 0) {
      return this.emptyAssessment();
    }

    // Assess each dimension
    const completeness = await this.assessCompleteness(data);
    const accuracy = await this.assessAccuracy(data);
    const consistency = await this.assessConsistency(data);
    const validity = await this.assessValidity(data);
    const timeliness = await this.assessTimeliness(data);
    const uniqueness = await this.assessUniqueness(data);

    // Identify issues
    const issues = this.identifyIssues(data, {
      completeness,
      accuracy,
      consistency,
      validity,
      timeliness,
      uniqueness,
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues);

    // Calculate overall score
    const scores = [
      completeness.score,
      accuracy.score,
      consistency.score,
      validity.score,
      timeliness.score,
      uniqueness.score,
    ];
    
    const overallScore = mean(scores) || 0;
    const stdDev = deviation(scores) || 0;
    const confidenceInterval: [number, number] = [
      Math.max(0, overallScore - 1.96 * stdDev / Math.sqrt(scores.length)),
      Math.min(100, overallScore + 1.96 * stdDev / Math.sqrt(scores.length)),
    ];

    return {
      overallScore,
      dimensions: {
        completeness,
        accuracy,
        consistency,
        validity,
        timeliness,
        uniqueness,
      },
      issues,
      recommendations,
      confidenceInterval,
    };
  }

  /**
   * Assess data completeness
   */
  private async assessCompleteness(data: any[]): Promise<DimensionScore> {
    let totalFields = 0;
    let filledFields = 0;
    let affectedRecords = 0;

    for (const record of data) {
      const fields = Object.keys(record);
      totalFields += fields.length;
      
      for (const field of fields) {
        const value = record[field];
        if (value !== null && value !== undefined && value !== '') {
          filledFields++;
        }
      }

      // Check for critical missing fields
      const criticalFields = ['respondentId', 'region', 'responseDate'];
      const hasMissing = criticalFields.some(f => !record[f]);
      if (hasMissing) affectedRecords++;
    }

    const score = (filledFields / totalFields) * 100;
    const status = this.getStatus(score);
    const improvementPotential = 100 - score;

    return {
      score,
      status,
      details: `${filledFields} of ${totalFields} fields have values (${score.toFixed(1)}% complete)`,
      affectedRecords,
      improvementPotential,
    };
  }

  /**
   * Assess data accuracy
   */
  private async assessAccuracy(data: any[]): Promise<DimensionScore> {
    let accurateRecords = 0;
    let totalRecords = data.length;
    const inaccuracies: string[] = [];

    for (const record of data) {
      let isAccurate = true;

      // Check email format
      if (record.email && !this.isValidEmail(record.email)) {
        isAccurate = false;
        inaccuracies.push('Invalid email format');
      }

      // Check date ranges
      if (record.responseDate) {
        const date = new Date(record.responseDate);
        const now = new Date();
        if (date > now) {
          isAccurate = false;
          inaccuracies.push('Future date detected');
        }
      }

      // Check numeric ranges
      if (record.age && (record.age < 18 || record.age > 120)) {
        isAccurate = false;
        inaccuracies.push('Age out of valid range');
      }

      if (record.satisfaction && (record.satisfaction < 1 || record.satisfaction > 5)) {
        isAccurate = false;
        inaccuracies.push('Satisfaction score out of range');
      }

      if (isAccurate) accurateRecords++;
    }

    const score = (accurateRecords / totalRecords) * 100;
    const status = this.getStatus(score);

    return {
      score,
      status,
      details: `${accurateRecords} of ${totalRecords} records pass accuracy checks`,
      affectedRecords: totalRecords - accurateRecords,
      improvementPotential: 100 - score,
    };
  }

  /**
   * Assess data consistency
   */
  private async assessConsistency(data: any[]): Promise<DimensionScore> {
    const inconsistencies: string[] = [];
    let consistentRecords = 0;

    // Check for format consistency
    const dateFormats = new Set<string>();
    const regionFormats = new Set<string>();

    for (const record of data) {
      let isConsistent = true;

      // Check date format consistency
      if (record.responseDate) {
        const format = this.detectDateFormat(record.responseDate);
        dateFormats.add(format);
      }

      // Check region naming consistency
      if (record.region) {
        const normalized = record.region.toLowerCase().trim();
        regionFormats.add(normalized);
      }

      // Check for logical consistency
      if (record.employmentStatus === 'unemployed' && record.salary > 0) {
        isConsistent = false;
        inconsistencies.push('Unemployed with salary');
      }

      if (record.hasInsurance === false && record.insuranceProvider) {
        isConsistent = false;
        inconsistencies.push('No insurance but has provider');
      }

      if (isConsistent) consistentRecords++;
    }

    const score = (consistentRecords / data.length) * 100;
    const status = this.getStatus(score);

    return {
      score,
      status,
      details: `${dateFormats.size} date formats, ${regionFormats.size} region variations detected`,
      affectedRecords: data.length - consistentRecords,
      improvementPotential: 100 - score,
    };
  }

  /**
   * Assess data validity
   */
  private async assessValidity(data: any[]): Promise<DimensionScore> {
    let validRecords = 0;
    const validationErrors: string[] = [];

    for (const record of data) {
      const errors = this.validateRecord(record);
      if (errors.length === 0) {
        validRecords++;
      } else {
        validationErrors.push(...errors);
      }
    }

    const score = (validRecords / data.length) * 100;
    const status = this.getStatus(score);

    return {
      score,
      status,
      details: `${validRecords} of ${data.length} records pass validation rules`,
      affectedRecords: data.length - validRecords,
      improvementPotential: 100 - score,
    };
  }

  /**
   * Assess data timeliness
   */
  private async assessTimeliness(data: any[]): Promise<DimensionScore> {
    const now = Date.now();
    let timelyRecords = 0;
    const ageThreshold = 90; // Days

    for (const record of data) {
      if (record.responseDate) {
        const date = new Date(record.responseDate);
        const ageInDays = (now - date.getTime()) / (1000 * 60 * 60 * 24);
        
        if (ageInDays <= ageThreshold) {
          timelyRecords++;
        }
      }
    }

    const score = (timelyRecords / data.length) * 100;
    const status = this.getStatus(score);

    return {
      score,
      status,
      details: `${timelyRecords} records are within ${ageThreshold} days old`,
      affectedRecords: data.length - timelyRecords,
      improvementPotential: 100 - score,
    };
  }

  /**
   * Assess data uniqueness
   */
  private async assessUniqueness(data: any[]): Promise<DimensionScore> {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    let uniqueRecords = 0;

    for (const record of data) {
      const key = this.generateRecordKey(record);
      
      if (seen.has(key)) {
        duplicates.add(key);
      } else {
        seen.add(key);
        uniqueRecords++;
      }
    }

    const score = (uniqueRecords / data.length) * 100;
    const status = this.getStatus(score);

    return {
      score,
      status,
      details: `${duplicates.size} duplicate records detected`,
      affectedRecords: duplicates.size,
      improvementPotential: 100 - score,
    };
  }

  /**
   * Identify quality issues
   */
  private identifyIssues(
    data: any[],
    dimensions: QualityDimensions
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Check completeness issues
    if (dimensions.completeness.score < 80) {
      issues.push({
        severity: dimensions.completeness.score < 50 ? 'critical' : 'high',
        dimension: 'completeness',
        description: 'Significant missing data detected',
        affectedFields: this.findIncompleteFields(data),
        affectedRecords: this.findIncompleteRecords(data),
        impact: 'May affect statistical analysis accuracy',
        autoFixable: false,
      });
    }

    // Check accuracy issues
    if (dimensions.accuracy.score < 90) {
      issues.push({
        severity: dimensions.accuracy.score < 70 ? 'high' : 'medium',
        dimension: 'accuracy',
        description: 'Data accuracy below acceptable threshold',
        affectedFields: ['email', 'age', 'responseDate'],
        affectedRecords: [],
        impact: 'Could lead to incorrect insights',
        autoFixable: true,
      });
    }

    // Check consistency issues
    if (dimensions.consistency.score < 85) {
      issues.push({
        severity: 'medium',
        dimension: 'consistency',
        description: 'Inconsistent data formats detected',
        affectedFields: ['responseDate', 'region'],
        affectedRecords: [],
        impact: 'May complicate data aggregation',
        autoFixable: true,
      });
    }

    // Check uniqueness issues
    if (dimensions.uniqueness.score < 95) {
      issues.push({
        severity: 'high',
        dimension: 'uniqueness',
        description: 'Duplicate records present',
        affectedFields: ['respondentId'],
        affectedRecords: [],
        impact: 'Will skew statistical calculations',
        autoFixable: true,
      });
    }

    return issues.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Generate quality improvement recommendations
   */
  private generateRecommendations(issues: QualityIssue[]): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];

    for (const issue of issues) {
      if (issue.dimension === 'completeness') {
        recommendations.push({
          priority: issue.severity === 'critical' ? 'immediate' : 'high',
          action: 'Implement data completion workflow for missing fields',
          expectedImprovement: 20,
          effort: 'medium',
          automationAvailable: false,
        });
      }

      if (issue.dimension === 'accuracy' && issue.autoFixable) {
        recommendations.push({
          priority: 'high',
          action: 'Run automated data correction script for format validation',
          expectedImprovement: 15,
          effort: 'low',
          automationAvailable: true,
        });
      }

      if (issue.dimension === 'consistency') {
        recommendations.push({
          priority: 'medium',
          action: 'Standardize date formats and region names',
          expectedImprovement: 10,
          effort: 'low',
          automationAvailable: true,
        });
      }

      if (issue.dimension === 'uniqueness') {
        recommendations.push({
          priority: 'immediate',
          action: 'Remove duplicate records using deduplication algorithm',
          expectedImprovement: 5,
          effort: 'low',
          automationAvailable: true,
        });
      }
    }

    // Add general recommendations
    if (issues.length > 3) {
      recommendations.push({
        priority: 'high',
        action: 'Implement comprehensive data quality monitoring dashboard',
        expectedImprovement: 25,
        effort: 'high',
        automationAvailable: false,
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { immediate: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Detect patterns in data
   */
  async detectPatterns(data: any[], field: string): Promise<DataPattern[]> {
    const patterns: Map<string, DataPattern> = new Map();
    const values = data.map(d => d[field]).filter(v => v !== null && v !== undefined);

    // Detect common patterns
    const frequency: Record<string, number> = {};
    for (const value of values) {
      const pattern = this.extractPattern(value);
      frequency[pattern] = (frequency[pattern] || 0) + 1;
    }

    // Calculate confidence
    const total = values.length;
    for (const [pattern, count] of Object.entries(frequency)) {
      if (count > 1) {
        patterns.set(pattern, {
          field,
          pattern,
          frequency: count,
          confidence: count / total,
          anomalies: this.findAnomalies(values, pattern),
        });
      }
    }

    return Array.from(patterns.values())
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Auto-correct common data issues
   */
  async autoCorrect(data: any[]): Promise<any[]> {
    const corrected = [...data];

    for (let i = 0; i < corrected.length; i++) {
      const record = corrected[i];

      // Trim whitespace
      for (const key of Object.keys(record)) {
        if (typeof record[key] === 'string') {
          record[key] = record[key].trim();
        }
      }

      // Standardize dates
      if (record.responseDate) {
        record.responseDate = this.standardizeDate(record.responseDate);
      }

      // Fix email formats
      if (record.email) {
        record.email = record.email.toLowerCase();
      }

      // Standardize regions
      if (record.region) {
        record.region = this.standardizeRegion(record.region);
      }

      // Remove obvious duplicates
      if (record.respondentId) {
        record.respondentId = record.respondentId.toString().trim();
      }
    }

    return corrected;
  }

  // Helper methods
  private getStatus(score: number): DimensionScore['status'] {
    if (score >= 95) return 'excellent';
    if (score >= 85) return 'good';
    if (score >= 70) return 'fair';
    return 'poor';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private detectDateFormat(date: any): string {
    const dateStr = date.toString();
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) return 'ISO';
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}/)) return 'MM/DD/YYYY';
    if (dateStr.match(/^\d{2}-\d{2}-\d{4}/)) return 'DD-MM-YYYY';
    return 'unknown';
  }

  private validateRecord(record: any): string[] {
    const errors: string[] = [];

    for (const rule of this.validationRules) {
      const value = record[rule.field];

      switch (rule.type) {
        case 'required':
          if (!value) errors.push(rule.errorMessage);
          break;
        case 'range':
          if (value < rule.condition.min || value > rule.condition.max) {
            errors.push(rule.errorMessage);
          }
          break;
        case 'format':
          if (!rule.condition.test(value)) {
            errors.push(rule.errorMessage);
          }
          break;
      }
    }

    return errors;
  }

  private generateRecordKey(record: any): string {
    // Generate a unique key for duplicate detection
    const keys = ['respondentId', 'email', 'organizationId', 'responseDate'];
    const values = keys.map(k => record[k] || '').filter(v => v);
    return values.join('|');
  }

  private findIncompleteFields(data: any[]): string[] {
    const fieldCompleteness: Record<string, number> = {};
    
    for (const record of data) {
      for (const key of Object.keys(record)) {
        if (!fieldCompleteness[key]) fieldCompleteness[key] = 0;
        if (record[key]) fieldCompleteness[key]++;
      }
    }

    return Object.entries(fieldCompleteness)
      .filter(([_, count]) => count < data.length * 0.8)
      .map(([field, _]) => field);
  }

  private findIncompleteRecords(data: any[]): number[] {
    const incomplete: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      const filledFields = Object.values(record).filter(v => v).length;
      const totalFields = Object.keys(record).length;
      
      if (filledFields / totalFields < 0.8) {
        incomplete.push(i);
      }
    }

    return incomplete;
  }

  private extractPattern(value: any): string {
    if (typeof value === 'number') {
      return 'numeric';
    }
    if (typeof value === 'string') {
      if (value.match(/^\d+$/)) return 'numeric-string';
      if (value.match(/^[A-Z]+$/)) return 'uppercase';
      if (value.match(/^[a-z]+$/)) return 'lowercase';
      if (value.match(/^[A-Z][a-z]+/)) return 'title-case';
      return 'mixed';
    }
    return typeof value;
  }

  private findAnomalies(values: any[], expectedPattern: string): any[] {
    return values.filter(v => this.extractPattern(v) !== expectedPattern);
  }

  private standardizeDate(date: any): string {
    const d = new Date(date);
    return d.toISOString();
  }

  private standardizeRegion(region: string): string {
    // Standardize common region names
    const mappings: Record<string, string> = {
      'n. california': 'Northern California',
      'northern ca': 'Northern California',
      's. california': 'Southern California',
      'southern ca': 'Southern California',
      'bay area': 'Bay Area',
      'sf bay area': 'Bay Area',
    };

    const lower = region.toLowerCase().trim();
    return mappings[lower] || region;
  }

  private getDefaultRules(): ValidationRule[] {
    return [
      {
        field: 'respondentId',
        type: 'required',
        condition: true,
        errorMessage: 'Respondent ID is required',
      },
      {
        field: 'age',
        type: 'range',
        condition: { min: 18, max: 120 },
        errorMessage: 'Age must be between 18 and 120',
      },
      {
        field: 'email',
        type: 'format',
        condition: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errorMessage: 'Invalid email format',
      },
      {
        field: 'satisfaction',
        type: 'range',
        condition: { min: 1, max: 5 },
        errorMessage: 'Satisfaction must be between 1 and 5',
      },
    ];
  }

  private getDefaultBenchmarks(): Record<string, any> {
    return {
      completeness: 95,
      accuracy: 98,
      consistency: 90,
      validity: 95,
      timeliness: 85,
      uniqueness: 99,
    };
  }

  private emptyAssessment(): QualityAssessment {
    return {
      overallScore: 0,
      dimensions: {
        completeness: this.emptyDimensionScore(),
        accuracy: this.emptyDimensionScore(),
        consistency: this.emptyDimensionScore(),
        validity: this.emptyDimensionScore(),
        timeliness: this.emptyDimensionScore(),
        uniqueness: this.emptyDimensionScore(),
      },
      issues: [],
      recommendations: [],
      confidenceInterval: [0, 0],
    };
  }

  private emptyDimensionScore(): DimensionScore {
    return {
      score: 0,
      status: 'poor',
      details: 'No data available',
      affectedRecords: 0,
      improvementPotential: 100,
    };
  }
}

export default DataQualityEngine;