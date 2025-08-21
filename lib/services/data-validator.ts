/**
 * @module DataValidator
 * @description Comprehensive data validation framework for survey data processing
 */

import Papa from 'papaparse';
import { z } from 'zod';

// Healthcare survey data schemas
const SurveyResponseSchema = z.object({
  respondentId: z.string(),
  organizationId: z.string().optional(),
  region: z.string(),
  completedDate: z.string(),
  responses: z.record(z.any()),
});

const HealthcareSurveyDataSchema = z.object({
  surveyId: z.string(),
  surveyName: z.string(),
  period: z.string(),
  totalResponses: z.number(),
  regions: z.array(z.string()),
  questions: z.array(z.object({
    questionId: z.string(),
    questionText: z.string(),
    questionType: z.enum(['single', 'multiple', 'scale', 'text', 'number']),
    required: z.boolean(),
  })),
  data: z.array(SurveyResponseSchema),
});

export interface DataQualityReport {
  score: number; // 0-100
  issues: DataIssue[];
  suggestions: DataSuggestion[];
  statistics: DataStatistics;
}

export interface DataIssue {
  severity: 'critical' | 'warning' | 'info';
  field: string;
  issue: string;
  rowNumbers?: number[];
  count: number;
}

export interface DataSuggestion {
  field: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
  autoFixAvailable: boolean;
}

export interface DataStatistics {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  missingValues: number;
  duplicates: number;
  completenessRate: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  cleanedData?: any;
  preview?: any;
}

export class DataValidator {
  /**
   * Validate CSV structure and content
   */
  static async validateCSVStructure(
    csvContent: string,
    expectedHeaders?: string[]
  ): Promise<ValidationResult> {
    return new Promise((resolve) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          // Check for parsing errors
          if (result.errors.length > 0) {
            result.errors.forEach(error => {
              errors.push(`Row ${error.row}: ${error.message}`);
            });
          }

          // Validate headers if expected headers provided
          if (expectedHeaders && result.meta.fields) {
            const missingHeaders = expectedHeaders.filter(
              h => !result.meta.fields?.includes(h)
            );
            if (missingHeaders.length > 0) {
              errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
            }

            const extraHeaders = result.meta.fields.filter(
              h => !expectedHeaders.includes(h)
            );
            if (extraHeaders.length > 0) {
              warnings.push(`Unexpected headers found: ${extraHeaders.join(', ')}`);
            }
          }

          // Check for empty dataset
          if (result.data.length === 0) {
            errors.push('CSV file contains no data rows');
          }

          // Validate data consistency
          const preview = result.data.slice(0, 5);

          resolve({
            isValid: errors.length === 0,
            errors,
            warnings,
            cleanedData: result.data,
            preview,
          });
        },
        error: (error) => {
          errors.push(`CSV parsing failed: ${error.message}`);
          resolve({
            isValid: false,
            errors,
            warnings,
          });
        },
      });
    });
  }

  /**
   * Score data quality (0-100)
   */
  static scoreDataQuality(data: any[]): DataQualityReport {
    const issues: DataIssue[] = [];
    const suggestions: DataSuggestion[] = [];
    
    if (!data || data.length === 0) {
      return {
        score: 0,
        issues: [{
          severity: 'critical',
          field: 'data',
          issue: 'No data provided',
          count: 1,
        }],
        suggestions: [],
        statistics: {
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          missingValues: 0,
          duplicates: 0,
          completenessRate: 0,
        },
      };
    }

    const totalRows = data.length;
    let validRows = 0;
    let missingValues = 0;
    const duplicateCheck = new Set();
    let duplicates = 0;

    // Analyze each row
    data.forEach((row, index) => {
      let rowValid = true;
      const rowString = JSON.stringify(row);
      
      // Check for duplicates
      if (duplicateCheck.has(rowString)) {
        duplicates++;
        issues.push({
          severity: 'warning',
          field: 'row',
          issue: 'Duplicate row detected',
          rowNumbers: [index],
          count: 1,
        });
      }
      duplicateCheck.add(rowString);

      // Check for missing values
      Object.entries(row).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          missingValues++;
          rowValid = false;
        }
      });

      if (rowValid) validRows++;
    });

    // Calculate completeness rate
    const totalFields = totalRows * (data[0] ? Object.keys(data[0]).length : 0);
    const completenessRate = totalFields > 0 
      ? ((totalFields - missingValues) / totalFields) * 100 
      : 0;

    // Generate suggestions based on issues
    if (missingValues > totalRows * 0.1) {
      suggestions.push({
        field: 'missing_values',
        suggestion: 'Consider imputing missing values or removing incomplete rows',
        impact: 'high',
        autoFixAvailable: true,
      });
    }

    if (duplicates > totalRows * 0.05) {
      suggestions.push({
        field: 'duplicates',
        suggestion: 'Remove duplicate entries to improve data quality',
        impact: 'medium',
        autoFixAvailable: true,
      });
    }

    // Calculate overall score
    const score = Math.round(
      (validRows / totalRows) * 50 + // 50% weight for valid rows
      (completenessRate / 100) * 30 + // 30% weight for completeness
      ((totalRows - duplicates) / totalRows) * 20 // 20% weight for uniqueness
    );

    return {
      score: Math.min(100, Math.max(0, score)),
      issues,
      suggestions,
      statistics: {
        totalRows,
        validRows,
        invalidRows: totalRows - validRows,
        missingValues,
        duplicates,
        completenessRate,
      },
    };
  }

  /**
   * Suggest automatic data cleaning operations
   */
  static suggestDataCleaning(data: any[]): DataSuggestion[] {
    const suggestions: DataSuggestion[] = [];

    if (!data || data.length === 0) return suggestions;

    // Analyze data patterns
    const firstRow = data[0];
    Object.keys(firstRow).forEach(key => {
      const values = data.map(row => row[key]);
      
      // Check for consistent data types
      const types = new Set(values.map(v => typeof v));
      if (types.size > 1) {
        suggestions.push({
          field: key,
          suggestion: `Standardize data type for field '${key}'`,
          impact: 'high',
          autoFixAvailable: true,
        });
      }

      // Check for outliers in numeric fields
      const numericValues = values.filter(v => typeof v === 'number');
      if (numericValues.length > 0) {
        const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        const stdDev = Math.sqrt(
          numericValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / numericValues.length
        );
        
        const outliers = numericValues.filter(v => Math.abs(v - mean) > 3 * stdDev);
        if (outliers.length > 0) {
          suggestions.push({
            field: key,
            suggestion: `${outliers.length} outliers detected in '${key}' field`,
            impact: 'medium',
            autoFixAvailable: false,
          });
        }
      }

      // Check for whitespace issues
      const stringValues = values.filter(v => typeof v === 'string');
      const hasWhitespaceIssues = stringValues.some(v => v !== v.trim());
      if (hasWhitespaceIssues) {
        suggestions.push({
          field: key,
          suggestion: `Trim whitespace in '${key}' field`,
          impact: 'low',
          autoFixAvailable: true,
        });
      }
    });

    return suggestions;
  }

  /**
   * Preview data transformation before applying
   */
  static previewTransformation(
    data: any[],
    transformations: Array<{
      type: 'rename' | 'remove' | 'transform' | 'filter';
      field?: string;
      newName?: string;
      transformer?: (value: any) => any;
      condition?: (row: any) => boolean;
    }>
  ): { preview: any[]; summary: string[] } {
    if (!data || data.length === 0) {
      return { preview: [], summary: ['No data to transform'] };
    }

    let transformed = [...data];
    const summary: string[] = [];

    transformations.forEach(transformation => {
      switch (transformation.type) {
        case 'rename':
          if (transformation.field && transformation.newName) {
            transformed = transformed.map(row => {
              const newRow = { ...row };
              newRow[transformation.newName!] = newRow[transformation.field!];
              delete newRow[transformation.field!];
              return newRow;
            });
            summary.push(`Renamed field '${transformation.field}' to '${transformation.newName}'`);
          }
          break;

        case 'remove':
          if (transformation.field) {
            transformed = transformed.map(row => {
              const newRow = { ...row };
              delete newRow[transformation.field!];
              return newRow;
            });
            summary.push(`Removed field '${transformation.field}'`);
          }
          break;

        case 'transform':
          if (transformation.field && transformation.transformer) {
            transformed = transformed.map(row => ({
              ...row,
              [transformation.field!]: transformation.transformer!(row[transformation.field!]),
            }));
            summary.push(`Transformed field '${transformation.field}'`);
          }
          break;

        case 'filter':
          if (transformation.condition) {
            const originalCount = transformed.length;
            transformed = transformed.filter(transformation.condition);
            summary.push(`Filtered ${originalCount - transformed.length} rows`);
          }
          break;
      }
    });

    return {
      preview: transformed.slice(0, 10),
      summary,
    };
  }

  /**
   * Auto-fix common data issues
   */
  static autoFixData(data: any[], issues: DataIssue[]): any[] {
    let fixed = [...data];

    issues.forEach(issue => {
      switch (issue.issue) {
        case 'Duplicate row detected':
          // Remove duplicates
          const seen = new Set();
          fixed = fixed.filter(row => {
            const key = JSON.stringify(row);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          break;

        case 'Missing values':
          // Handle missing values based on field type
          fixed = fixed.map(row => {
            const fixedRow = { ...row };
            Object.keys(fixedRow).forEach(key => {
              if (fixedRow[key] === null || fixedRow[key] === undefined || fixedRow[key] === '') {
                // Infer type from other rows
                const nonNullValues = data
                  .map(r => r[key])
                  .filter(v => v !== null && v !== undefined && v !== '');
                
                if (nonNullValues.length > 0) {
                  const firstNonNull = nonNullValues[0];
                  if (typeof firstNonNull === 'number') {
                    // Use mean for numeric fields
                    const mean = nonNullValues.reduce((a, b) => a + b, 0) / nonNullValues.length;
                    fixedRow[key] = mean;
                  } else {
                    // Use mode for categorical fields
                    const frequency: Record<string, number> = {};
                    nonNullValues.forEach(v => {
                      frequency[v] = (frequency[v] || 0) + 1;
                    });
                    const mode = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0][0];
                    fixedRow[key] = mode;
                  }
                }
              }
            });
            return fixedRow;
          });
          break;
      }
    });

    return fixed;
  }

  /**
   * Validate healthcare survey specific data
   */
  static validateHealthcareSurveyData(data: any): ValidationResult {
    try {
      const parsed = HealthcareSurveyDataSchema.parse(data);
      
      const warnings: string[] = [];
      
      // Check for minimum response threshold
      if (parsed.totalResponses < 30) {
        warnings.push('Low response count may affect statistical significance');
      }

      // Check for regional balance
      const regionCounts: Record<string, number> = {};
      parsed.data.forEach(response => {
        regionCounts[response.region] = (regionCounts[response.region] || 0) + 1;
      });
      
      const avgResponsesPerRegion = parsed.totalResponses / parsed.regions.length;
      Object.entries(regionCounts).forEach(([region, count]) => {
        if (count < avgResponsesPerRegion * 0.5) {
          warnings.push(`Region '${region}' has low response rate (${count} responses)`);
        }
      });

      return {
        isValid: true,
        errors: [],
        warnings,
        cleanedData: parsed,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
          warnings: [],
        };
      }
      return {
        isValid: false,
        errors: ['Unknown validation error'],
        warnings: [],
      };
    }
  }
}

export default DataValidator;