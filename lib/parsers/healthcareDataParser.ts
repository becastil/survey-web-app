import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import pdfParse from 'pdf-parse';
import { z } from 'zod';

// Healthcare Survey Data Schema
export const HealthcareSurveySchema = z.object({
  organizationName: z.string(),
  region: z.string(),
  subRegion: z.string().optional(),
  employeeCount: z.number().min(0),
  unionPopulation: z.boolean().optional(),
  medicalPlans: z.array(z.object({
    planType: z.enum(['HMO', 'PPO', 'EPO', 'HDHP', 'POS', 'Other']),
    carrier: z.string(),
    enrollment: z.number().min(0),
    premiumCost: z.number().min(0),
    employerContribution: z.number().min(0).max(100),
    deductible: z.number().min(0),
    outOfPocketMax: z.number().min(0)
  })).optional(),
  benefitBudgetIncrease: z.number().optional(),
  demographicData: z.object({
    averageAge: z.number().optional(),
    genderDistribution: z.object({
      male: z.number().optional(),
      female: z.number().optional(),
      other: z.number().optional()
    }).optional(),
    coverageTiers: z.object({
      employeeOnly: z.number().optional(),
      employeeSpouse: z.number().optional(),
      employeeChildren: z.number().optional(),
      family: z.number().optional()
    }).optional()
  }).optional()
});

export type HealthcareSurveyData = z.infer<typeof HealthcareSurveySchema>;

// Field mapping for common healthcare survey columns
const FIELD_MAPPINGS: Record<string, string[]> = {
  organizationName: [
    'Organization Name',
    'Company Name',
    'Employer Name',
    'Organization',
    'Company',
    'General Information - Organization Name'
  ],
  region: [
    'Region',
    'Location',
    'Geographic Region',
    'State',
    'General Information - Location Represented'
  ],
  employeeCount: [
    'Employee Count',
    'Total Employees',
    'Number of Employees',
    'Total FTEs',
    'General Information - Total Employees'
  ],
  unionPopulation: [
    'Union',
    'Union Population',
    'Union Status',
    'General Information - Union population?'
  ],
  planType: [
    'Plan Type',
    'Medical Plan Type',
    'Plan Design',
    'Coverage Type'
  ],
  premiumCost: [
    'Premium',
    'Monthly Premium',
    'Premium Cost',
    'Total Premium',
    'Employee Premium'
  ],
  deductible: [
    'Deductible',
    'Annual Deductible',
    'In-Network Deductible',
    'Individual Deductible'
  ],
  benefitBudgetIncrease: [
    'Budget Increase',
    'Medical Budget Increase',
    '2025 Budget Increase',
    'Medical Plan 1 - What is your 2025 Medical/Pharmacy final budget increase'
  ]
};

export class HealthcareDataParser {
  /**
   * Parse healthcare data from various file formats
   */
  static async parseFile(file: File): Promise<{
    data: any[];
    headers: string[];
    metadata: {
      fileType: string;
      rowCount: number;
      columnCount: number;
      detectedFields: string[];
    };
  }> {
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';
    
    switch (fileType) {
      case 'csv':
        return await this.parseCSV(file);
      case 'xlsx':
      case 'xls':
        return await this.parseExcel(file);
      case 'pdf':
        return await this.parsePDF(file);
      case 'txt':
        return await this.parseText(file);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  /**
   * Parse CSV file using PapaParse
   */
  private static async parseCSV(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          const detectedFields = this.detectHealthcareFields(headers);
          
          resolve({
            data: results.data,
            headers,
            metadata: {
              fileType: 'csv',
              rowCount: results.data.length,
              columnCount: headers.length,
              detectedFields
            }
          });
        },
        error: (error) => reject(error)
      });
    });
  }

  /**
   * Parse Excel file using XLSX
   */
  private static async parseExcel(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first sheet
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          if (jsonData.length === 0) {
            throw new Error('Empty Excel file');
          }
          
          // Extract headers and data
          const headers = (jsonData[0] as any[]).map(h => String(h || ''));
          const rows = jsonData.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = (row as any[])[index];
            });
            return obj;
          });
          
          const detectedFields = this.detectHealthcareFields(headers);
          
          resolve({
            data: rows,
            headers,
            metadata: {
              fileType: 'excel',
              rowCount: rows.length,
              columnCount: headers.length,
              detectedFields,
              sheets: workbook.SheetNames
            }
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Parse PDF file and extract structured data
   */
  private static async parsePDF(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const buffer = Buffer.from(e.target?.result as ArrayBuffer);
          const pdfData = await pdfParse(buffer);
          
          // Extract text and try to parse tables
          const text = pdfData.text;
          const lines = text.split('\n').filter(line => line.trim());
          
          // Try to detect table structure
          const tableData = this.extractTableFromText(lines);
          
          resolve({
            data: tableData.data,
            headers: tableData.headers,
            metadata: {
              fileType: 'pdf',
              rowCount: tableData.data.length,
              columnCount: tableData.headers.length,
              detectedFields: this.detectHealthcareFields(tableData.headers),
              pageCount: pdfData.numpages,
              textLength: text.length
            }
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Parse plain text file
   */
  private static async parseText(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          // Try to detect if it's tab or comma delimited
          const delimiter = this.detectDelimiter(lines[0]);
          
          if (delimiter) {
            // Parse as delimited data
            const headers = lines[0].split(delimiter).map(h => h.trim());
            const data = lines.slice(1).map(line => {
              const values = line.split(delimiter);
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = values[index]?.trim();
              });
              return obj;
            });
            
            resolve({
              data,
              headers,
              metadata: {
                fileType: 'text',
                rowCount: data.length,
                columnCount: headers.length,
                detectedFields: this.detectHealthcareFields(headers),
                delimiter
              }
            });
          } else {
            // Return as unstructured text
            resolve({
              data: [{ text }],
              headers: ['text'],
              metadata: {
                fileType: 'text',
                rowCount: 1,
                columnCount: 1,
                detectedFields: [],
                lineCount: lines.length
              }
            });
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * Detect healthcare-specific fields in headers
   */
  private static detectHealthcareFields(headers: string[]): string[] {
    const detectedFields: string[] = [];
    
    for (const [field, patterns] of Object.entries(FIELD_MAPPINGS)) {
      for (const pattern of patterns) {
        if (headers.some(h => h.toLowerCase().includes(pattern.toLowerCase()))) {
          detectedFields.push(field);
          break;
        }
      }
    }
    
    return detectedFields;
  }

  /**
   * Extract table data from PDF text lines
   */
  private static extractTableFromText(lines: string[]): {
    headers: string[];
    data: any[];
  } {
    // Simple heuristic: look for lines with consistent delimiters
    const potentialHeaders = lines[0]?.split(/\s{2,}|\t/) || [];
    const data: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/\s{2,}|\t/);
      if (values.length === potentialHeaders.length) {
        const row: any = {};
        potentialHeaders.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }
    
    return {
      headers: potentialHeaders,
      data
    };
  }

  /**
   * Detect delimiter in text line
   */
  private static detectDelimiter(line: string): string | null {
    const delimiters = ['\t', ',', '|', ';'];
    
    for (const delimiter of delimiters) {
      if (line.includes(delimiter)) {
        // Check if delimiter appears consistently
        const parts = line.split(delimiter);
        if (parts.length > 1) {
          return delimiter;
        }
      }
    }
    
    return null;
  }

  /**
   * Transform parsed data to healthcare survey format
   */
  static transformToHealthcareSurvey(
    data: any[],
    headers: string[]
  ): HealthcareSurveyData[] {
    const transformed: HealthcareSurveyData[] = [];
    
    for (const row of data) {
      try {
        const surveyData: any = {};
        
        // Map fields based on detected patterns
        for (const [field, patterns] of Object.entries(FIELD_MAPPINGS)) {
          for (const pattern of patterns) {
            const header = headers.find(h => 
              h.toLowerCase().includes(pattern.toLowerCase())
            );
            
            if (header && row[header] !== undefined) {
              // Handle different field types
              if (field === 'employeeCount') {
                surveyData[field] = parseInt(String(row[header]).replace(/\D/g, '')) || 0;
              } else if (field === 'unionPopulation') {
                const value = String(row[header]).toLowerCase();
                surveyData[field] = value === 'yes' || value === 'true' || value === '1';
              } else if (field === 'benefitBudgetIncrease') {
                surveyData[field] = parseFloat(String(row[header]).replace(/[^\d.-]/g, '')) || 0;
              } else {
                surveyData[field] = row[header];
              }
              break;
            }
          }
        }
        
        // Only add if we have at least organization name and region
        if (surveyData.organizationName && surveyData.region) {
          // Set defaults for required fields
          surveyData.employeeCount = surveyData.employeeCount || 0;
          
          const validated = HealthcareSurveySchema.parse(surveyData);
          transformed.push(validated);
        }
      } catch (error) {
        // Skip invalid rows
        console.warn('Failed to transform row:', error);
      }
    }
    
    return transformed;
  }

  /**
   * Validate healthcare data quality
   */
  static validateDataQuality(data: HealthcareSurveyData[]): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
    stats: {
      totalRecords: number;
      validRecords: number;
      missingFields: Record<string, number>;
      dataCompleteness: number;
    };
  } {
    const issues: string[] = [];
    const warnings: string[] = [];
    const missingFields: Record<string, number> = {};
    let validRecords = 0;
    
    // Check each record
    for (const record of data) {
      let recordValid = true;
      
      // Check required fields
      if (!record.organizationName) {
        missingFields.organizationName = (missingFields.organizationName || 0) + 1;
        recordValid = false;
      }
      
      if (!record.region) {
        missingFields.region = (missingFields.region || 0) + 1;
        recordValid = false;
      }
      
      // Check data quality
      if (record.employeeCount < 0) {
        warnings.push(`Invalid employee count for ${record.organizationName}`);
      }
      
      if (record.benefitBudgetIncrease && 
          (record.benefitBudgetIncrease < -50 || record.benefitBudgetIncrease > 100)) {
        warnings.push(`Unusual budget increase for ${record.organizationName}: ${record.benefitBudgetIncrease}%`);
      }
      
      if (recordValid) validRecords++;
    }
    
    // Calculate completeness
    const totalFields = Object.keys(HealthcareSurveySchema.shape).length;
    const avgMissingFields = Object.values(missingFields).reduce((a, b) => a + b, 0) / data.length;
    const dataCompleteness = ((totalFields - avgMissingFields) / totalFields) * 100;
    
    // Generate issues
    if (validRecords === 0) {
      issues.push('No valid records found in the dataset');
    }
    
    if (dataCompleteness < 50) {
      issues.push(`Low data completeness: ${dataCompleteness.toFixed(1)}%`);
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      stats: {
        totalRecords: data.length,
        validRecords,
        missingFields,
        dataCompleteness
      }
    };
  }
}