/**
 * @module BaseTemplate
 * @description Base template architecture for healthcare report generation
 */

import { z } from 'zod';
import { ProcessedData } from '../services/data-processor';

// Template metadata schema
export const TemplateMetadataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  category: z.enum([
    'patient-satisfaction',
    'clinical-outcomes',
    'cost-efficiency',
    'regulatory-compliance',
    'operational-metrics',
    'quality-measures',
    'executive-summary'
  ]),
  compliance: z.object({
    hipaa: z.boolean(),
    hitech: z.boolean(),
    gdpr: z.boolean(),
    accessibility: z.enum(['WCAG-AA', 'WCAG-AAA', 'Section-508'])
  }),
  industry: z.enum(['hospital', 'clinic', 'insurance', 'pharma', 'research', 'government']),
  audience: z.enum(['executive', 'clinical', 'operational', 'technical', 'patient']),
  dataRequirements: z.array(z.string()),
  estimatedPageCount: z.number().min(1),
  lastModified: z.date(),
  author: z.string(),
  tags: z.array(z.string())
});

export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;

// Template section types
export interface TemplateSection {
  id: string;
  title: string;
  type: 'cover' | 'executive-summary' | 'methodology' | 'findings' | 'recommendations' | 'appendix';
  order: number;
  required: boolean;
  conditional?: {
    field: string;
    operator: 'exists' | 'equals' | 'greater' | 'less';
    value: any;
  };
  components: TemplateComponent[];
  validationRules?: ValidationRule[];
}

export interface TemplateComponent {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  dataBinding?: DataBinding;
  styling?: ComponentStyling;
  accessibility?: AccessibilityOptions;
}

export type ComponentType = 
  | 'text' | 'heading' | 'paragraph' | 'list'
  | 'chart' | 'table' | 'metric-card' | 'kpi-grid'
  | 'image' | 'logo' | 'divider' | 'spacer'
  | 'alert' | 'callout' | 'quote'
  | 'patient-demographics' | 'clinical-timeline'
  | 'risk-matrix' | 'compliance-checklist';

export interface DataBinding {
  source: string; // Path to data field
  transform?: string; // Transformation function name
  fallback?: any; // Default value if data missing
  format?: string; // Format string for display
}

export interface ComponentStyling {
  className?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  spacing?: {
    margin?: string;
    padding?: string;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
  };
}

export interface AccessibilityOptions {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  altText?: string;
  highContrast?: boolean;
  screenReaderText?: string;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'min-length' | 'max-length' | 'pattern' | 'custom';
  value?: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Template rendering context
export interface RenderContext {
  data: ProcessedData;
  metadata: TemplateMetadata;
  settings: RenderSettings;
  locale: string;
  timezone: string;
}

export interface RenderSettings {
  format: 'pdf' | 'html' | 'docx' | 'pptx';
  paperSize: 'A4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  includePageNumbers: boolean;
  includeTableOfContents: boolean;
  includeGlossary: boolean;
  watermark?: string;
  confidentiality?: 'public' | 'internal' | 'confidential' | 'restricted';
}

// Base template class
export abstract class BaseTemplate {
  protected metadata: TemplateMetadata;
  protected sections: TemplateSection[];
  protected validationErrors: ValidationError[];

  constructor(metadata: TemplateMetadata) {
    this.metadata = metadata;
    this.sections = [];
    this.validationErrors = [];
  }

  /**
   * Validate template against HIPAA and accessibility standards
   */
  async validate(): Promise<ValidationResult> {
    this.validationErrors = [];

    // Validate metadata
    try {
      TemplateMetadataSchema.parse(this.metadata);
    } catch (error) {
      this.validationErrors.push({
        type: 'metadata',
        field: 'metadata',
        message: 'Invalid template metadata',
        severity: 'error'
      });
    }

    // Validate HIPAA compliance
    if (this.metadata.compliance.hipaa) {
      await this.validateHIPAACompliance();
    }

    // Validate accessibility
    await this.validateAccessibility();

    // Validate sections
    for (const section of this.sections) {
      await this.validateSection(section);
    }

    return {
      valid: this.validationErrors.filter(e => e.severity === 'error').length === 0,
      errors: this.validationErrors.filter(e => e.severity === 'error'),
      warnings: this.validationErrors.filter(e => e.severity === 'warning'),
      info: this.validationErrors.filter(e => e.severity === 'info')
    };
  }

  /**
   * Validate HIPAA compliance requirements
   */
  protected async validateHIPAACompliance(): Promise<void> {
    // Check for PHI fields
    const phiFields = ['patientName', 'patientId', 'ssn', 'dob', 'medicalRecordNumber'];
    const hasUnprotectedPHI = this.sections.some(section => 
      section.components.some(comp => 
        comp.dataBinding && phiFields.includes(comp.dataBinding.source) && 
        !comp.props.encrypted
      )
    );

    if (hasUnprotectedPHI) {
      this.validationErrors.push({
        type: 'hipaa',
        field: 'phi',
        message: 'Template contains unencrypted PHI fields',
        severity: 'error'
      });
    }

    // Check for audit logging
    const hasAuditLog = this.metadata.tags?.includes('audit-enabled');
    if (!hasAuditLog) {
      this.validationErrors.push({
        type: 'hipaa',
        field: 'audit',
        message: 'HIPAA-compliant templates must have audit logging enabled',
        severity: 'warning'
      });
    }

    // Check for data retention policy
    const hasRetentionPolicy = this.metadata.tags?.includes('retention-policy');
    if (!hasRetentionPolicy) {
      this.validationErrors.push({
        type: 'hipaa',
        field: 'retention',
        message: 'Define data retention policy for HIPAA compliance',
        severity: 'warning'
      });
    }
  }

  /**
   * Validate accessibility standards
   */
  protected async validateAccessibility(): Promise<void> {
    const standard = this.metadata.compliance.accessibility;

    for (const section of this.sections) {
      for (const component of section.components) {
        // Check images have alt text
        if (component.type === 'image' && !component.accessibility?.altText) {
          this.validationErrors.push({
            type: 'accessibility',
            field: `${section.id}.${component.id}`,
            message: `Image component missing alt text (${standard} requirement)`,
            severity: 'error'
          });
        }

        // Check charts have descriptions
        if (component.type === 'chart' && !component.accessibility?.ariaLabel) {
          this.validationErrors.push({
            type: 'accessibility',
            field: `${section.id}.${component.id}`,
            message: `Chart component missing accessible description`,
            severity: 'error'
          });
        }

        // Check color contrast for WCAG-AA
        if (standard.includes('WCAG') && component.styling?.colors) {
          const contrastRatio = this.calculateContrastRatio(
            component.styling.colors.primary || '#000',
            component.styling.colors.secondary || '#fff'
          );
          
          const requiredRatio = standard === 'WCAG-AAA' ? 7 : 4.5;
          if (contrastRatio < requiredRatio) {
            this.validationErrors.push({
              type: 'accessibility',
              field: `${section.id}.${component.id}`,
              message: `Insufficient color contrast (${contrastRatio.toFixed(2)}:1, need ${requiredRatio}:1)`,
              severity: 'error'
            });
          }
        }
      }
    }
  }

  /**
   * Validate individual section
   */
  protected async validateSection(section: TemplateSection): Promise<void> {
    // Check required fields
    if (section.required && section.components.length === 0) {
      this.validationErrors.push({
        type: 'section',
        field: section.id,
        message: `Required section "${section.title}" has no components`,
        severity: 'error'
      });
    }

    // Validate custom rules
    if (section.validationRules) {
      for (const rule of section.validationRules) {
        const isValid = await this.validateRule(rule, section);
        if (!isValid) {
          this.validationErrors.push({
            type: 'validation',
            field: `${section.id}.${rule.field}`,
            message: rule.message,
            severity: rule.severity
          });
        }
      }
    }
  }

  /**
   * Validate custom rule
   */
  protected async validateRule(rule: ValidationRule, section: TemplateSection): Promise<boolean> {
    // Implementation would check specific rule types
    return true;
  }

  /**
   * Calculate color contrast ratio (WCAG formula)
   */
  protected calculateContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
      // Simplified luminance calculation
      const rgb = this.hexToRgb(color);
      const [r, g, b] = rgb.map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Convert hex color to RGB
   */
  protected hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }

  /**
   * Render template to specified format
   */
  abstract async render(context: RenderContext): Promise<RenderOutput>;

  /**
   * Get template preview
   */
  abstract async preview(data: Partial<ProcessedData>): Promise<PreviewOutput>;

  /**
   * Export template definition
   */
  async export(): Promise<TemplateExport> {
    return {
      metadata: this.metadata,
      sections: this.sections,
      version: '1.0.0',
      exportDate: new Date(),
      checksum: await this.calculateChecksum()
    };
  }

  /**
   * Import template definition
   */
  static async import(data: TemplateExport): Promise<BaseTemplate> {
    // Validate checksum
    // Create appropriate template subclass
    throw new Error('Import must be implemented by subclass');
  }

  /**
   * Calculate template checksum for integrity
   */
  protected async calculateChecksum(): Promise<string> {
    const content = JSON.stringify({
      metadata: this.metadata,
      sections: this.sections
    });
    // Simple hash for now
    return Buffer.from(content).toString('base64').slice(0, 16);
  }
}

// Type definitions
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

export interface ValidationError {
  type: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface RenderOutput {
  content: Buffer | string;
  format: string;
  metadata: {
    pageCount: number;
    fileSize: number;
    generatedAt: Date;
    templateUsed: string;
  };
}

export interface PreviewOutput {
  html: string;
  css: string;
  estimatedPages: number;
  warnings: string[];
}

export interface TemplateExport {
  metadata: TemplateMetadata;
  sections: TemplateSection[];
  version: string;
  exportDate: Date;
  checksum: string;
}

export default BaseTemplate;