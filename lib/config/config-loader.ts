/**
 * Configuration Loader
 * Loads and parses YAML configuration files
 */

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

export interface Metric {
  name: string;
  description: string;
  calculation: string;
  benchmark?: number;
  format: 'percentage' | 'currency' | 'number' | 'rating';
  scale?: number;
  category: string;
}

export interface PlanType {
  code: string;
  name: string;
  description: string;
}

export interface Region {
  code: string;
  name: string;
  counties: string[];
}

export interface MetricsConfig {
  metrics: {
    coverage: Record<string, Metric>;
    costs: Record<string, Metric>;
    satisfaction: Record<string, Metric>;
    demographics: Record<string, Metric>;
  };
  plan_types: PlanType[];
  regions: Region[];
  benchmarks: {
    source: string;
    updated: string;
    notes: string;
  };
  calculation_rules: {
    missing_data_handling: 'exclude' | 'zero' | 'average';
    outlier_detection: boolean;
    outlier_threshold: number;
    minimum_sample_size: number;
    confidence_level: number;
  };
}

export interface FieldMapping {
  standard_field: string;
  aliases: string[];
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'array';
  validation?: {
    min?: number;
    max?: number;
    min_length?: number;
    max_length?: number;
    allowed_values?: string[];
  };
  transform?: string;
  calculated?: boolean;
  calculation?: string;
}

export interface FieldMappingsConfig {
  field_mappings: Record<string, FieldMapping>;
  transformations: Record<string, any>;
  quality_checks: {
    duplicate_detection: {
      key_fields: string[];
      action: 'flag' | 'merge' | 'reject';
    };
    required_fields_coverage: {
      threshold: number;
      action: string;
    };
    data_type_validation: {
      strict: boolean;
    };
    outlier_detection: {
      enabled: boolean;
      method: string;
      threshold: number;
    };
  };
}

class ConfigLoader {
  private static instance: ConfigLoader;
  private metricsConfig: MetricsConfig | null = null;
  private fieldMappingsConfig: FieldMappingsConfig | null = null;
  private configPath: string;

  private constructor() {
    // In production, configs might be loaded from a different location
    this.configPath = process.env.CONFIG_PATH || path.join(process.cwd(), 'config');
  }

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * Load metrics configuration
   */
  async loadMetricsConfig(): Promise<MetricsConfig> {
    if (this.metricsConfig) {
      return this.metricsConfig;
    }

    try {
      const configFile = path.join(this.configPath, 'metrics.yaml');
      const fileContents = fs.readFileSync(configFile, 'utf8');
      this.metricsConfig = yaml.load(fileContents) as MetricsConfig;
      return this.metricsConfig;
    } catch (error) {
      console.error('Error loading metrics config:', error);
      // Return default config if file not found
      return this.getDefaultMetricsConfig();
    }
  }

  /**
   * Load field mappings configuration
   */
  async loadFieldMappingsConfig(): Promise<FieldMappingsConfig> {
    if (this.fieldMappingsConfig) {
      return this.fieldMappingsConfig;
    }

    try {
      const configFile = path.join(this.configPath, 'field-mappings.yaml');
      const fileContents = fs.readFileSync(configFile, 'utf8');
      this.fieldMappingsConfig = yaml.load(fileContents) as FieldMappingsConfig;
      return this.fieldMappingsConfig;
    } catch (error) {
      console.error('Error loading field mappings config:', error);
      // Return default config if file not found
      return this.getDefaultFieldMappingsConfig();
    }
  }

  /**
   * Get all metrics as a flat list
   */
  async getAllMetrics(): Promise<Metric[]> {
    const config = await this.loadMetricsConfig();
    const metrics: Metric[] = [];
    
    Object.values(config.metrics).forEach(category => {
      Object.values(category).forEach(metric => {
        metrics.push(metric);
      });
    });
    
    return metrics;
  }

  /**
   * Get field mapping by column name
   */
  async getFieldMapping(columnName: string): Promise<FieldMapping | null> {
    const config = await this.loadFieldMappingsConfig();
    const normalizedColumn = columnName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Check if it's a standard field
    for (const [key, mapping] of Object.entries(config.field_mappings)) {
      if (mapping.standard_field === normalizedColumn) {
        return mapping;
      }
      
      // Check aliases
      const normalizedAliases = mapping.aliases.map(a => a.toLowerCase().replace(/[^a-z0-9]/g, '_'));
      if (normalizedAliases.includes(normalizedColumn)) {
        return mapping;
      }
    }
    
    return null;
  }

  /**
   * Default metrics configuration (fallback)
   */
  private getDefaultMetricsConfig(): MetricsConfig {
    return {
      metrics: {
        coverage: {},
        costs: {},
        satisfaction: {},
        demographics: {}
      },
      plan_types: [
        { code: 'HMO', name: 'Health Maintenance Organization', description: '' },
        { code: 'PPO', name: 'Preferred Provider Organization', description: '' },
        { code: 'EPO', name: 'Exclusive Provider Organization', description: '' },
        { code: 'HDHP', name: 'High Deductible Health Plan', description: '' }
      ],
      regions: [
        { code: 'NORCAL', name: 'Northern California', counties: [] },
        { code: 'SOCAL', name: 'Southern California', counties: [] },
        { code: 'CENTRAL', name: 'Central California', counties: [] }
      ],
      benchmarks: {
        source: 'Default',
        updated: new Date().toISOString(),
        notes: 'Default configuration'
      },
      calculation_rules: {
        missing_data_handling: 'exclude',
        outlier_detection: true,
        outlier_threshold: 3,
        minimum_sample_size: 10,
        confidence_level: 0.95
      }
    };
  }

  /**
   * Default field mappings configuration (fallback)
   */
  private getDefaultFieldMappingsConfig(): FieldMappingsConfig {
    return {
      field_mappings: {},
      transformations: {},
      quality_checks: {
        duplicate_detection: {
          key_fields: ['organization_name'],
          action: 'flag'
        },
        required_fields_coverage: {
          threshold: 0.8,
          action: 'warn'
        },
        data_type_validation: {
          strict: false
        },
        outlier_detection: {
          enabled: true,
          method: 'iqr',
          threshold: 1.5
        }
      }
    };
  }

  /**
   * Clear cached configurations
   */
  clearCache(): void {
    this.metricsConfig = null;
    this.fieldMappingsConfig = null;
  }
}

// Export singleton instance
export const configLoader = ConfigLoader.getInstance();