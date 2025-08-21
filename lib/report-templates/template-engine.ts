/**
 * @module TemplateEngine
 * @description Dynamic template engine with conditional logic and data binding
 */

import { z } from 'zod';
import BaseTemplate, { 
  TemplateMetadata, 
  RenderContext,
  TemplateSection,
  TemplateComponent,
  ComponentType,
  ValidationResult
} from './base-template';
import { ProcessedData } from '../services/data-processor';
import PatientSatisfactionTemplate from './patient-satisfaction-template';

// Template registry
export class TemplateRegistry {
  private static instance: TemplateRegistry;
  private templates: Map<string, typeof BaseTemplate>;

  private constructor() {
    this.templates = new Map();
    this.registerDefaultTemplates();
  }

  static getInstance(): TemplateRegistry {
    if (!TemplateRegistry.instance) {
      TemplateRegistry.instance = new TemplateRegistry();
    }
    return TemplateRegistry.instance;
  }

  private registerDefaultTemplates(): void {
    // Register built-in templates
    this.register('patient-satisfaction', PatientSatisfactionTemplate);
    // More templates would be registered here
  }

  register(id: string, templateClass: typeof BaseTemplate): void {
    this.templates.set(id, templateClass);
  }

  get(id: string): typeof BaseTemplate | undefined {
    return this.templates.get(id);
  }

  list(): Array<{ id: string; name: string }> {
    return Array.from(this.templates.entries()).map(([id, _]) => ({
      id,
      name: id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    }));
  }
}

// Template builder for dynamic creation
export class TemplateBuilder {
  private metadata: Partial<TemplateMetadata>;
  private sections: TemplateSection[];

  constructor() {
    this.metadata = {};
    this.sections = [];
  }

  setMetadata(metadata: Partial<TemplateMetadata>): TemplateBuilder {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }

  addSection(section: TemplateSection): TemplateBuilder {
    this.sections.push(section);
    return this;
  }

  addComponent(sectionId: string, component: TemplateComponent): TemplateBuilder {
    const section = this.sections.find(s => s.id === sectionId);
    if (section) {
      section.components.push(component);
    }
    return this;
  }

  build(): DynamicTemplate {
    // Validate and fill defaults
    const fullMetadata: TemplateMetadata = {
      id: this.metadata.id || `dynamic-${Date.now()}`,
      name: this.metadata.name || 'Dynamic Template',
      version: this.metadata.version || '1.0.0',
      category: this.metadata.category || 'operational-metrics',
      compliance: this.metadata.compliance || {
        hipaa: false,
        hitech: false,
        gdpr: false,
        accessibility: 'WCAG-AA'
      },
      industry: this.metadata.industry || 'hospital',
      audience: this.metadata.audience || 'operational',
      dataRequirements: this.metadata.dataRequirements || [],
      estimatedPageCount: this.metadata.estimatedPageCount || 10,
      lastModified: new Date(),
      author: this.metadata.author || 'System',
      tags: this.metadata.tags || []
    };

    return new DynamicTemplate(fullMetadata, this.sections);
  }
}

// Dynamic template implementation
export class DynamicTemplate extends BaseTemplate {
  constructor(metadata: TemplateMetadata, sections: TemplateSection[]) {
    super(metadata);
    this.sections = sections;
  }

  async render(context: RenderContext): Promise<any> {
    // Validate template
    const validation = await this.validate();
    if (!validation.valid) {
      throw new Error(`Template validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Process sections with data binding
    const processedSections = await this.processSections(context);

    // Render based on format
    switch (context.settings.format) {
      case 'html':
        return this.renderHTML(processedSections, context);
      case 'pdf':
        return this.renderPDF(processedSections, context);
      default:
        throw new Error(`Format ${context.settings.format} not supported`);
    }
  }

  async preview(data: Partial<ProcessedData>): Promise<any> {
    const html = await this.generatePreviewHTML(this.sections.slice(0, 2));
    return {
      html,
      css: this.getDefaultCSS(),
      estimatedPages: this.metadata.estimatedPageCount,
      warnings: []
    };
  }

  private async processSections(context: RenderContext): Promise<TemplateSection[]> {
    const processed = [...this.sections];
    
    for (const section of processed) {
      // Apply conditional logic
      if (section.conditional) {
        const shouldRender = this.evaluateCondition(section.conditional, context.data);
        if (!shouldRender) {
          section.components = [];
          continue;
        }
      }

      // Process components
      for (const component of section.components) {
        if (component.dataBinding) {
          component.props.data = await this.resolveBinding(
            component.dataBinding,
            context.data
          );
        }
      }
    }

    return processed;
  }

  private evaluateCondition(condition: any, data: any): boolean {
    const value = this.getNestedValue(data, condition.field);
    
    switch (condition.operator) {
      case 'exists':
        return value !== undefined && value !== null;
      case 'equals':
        return value === condition.value;
      case 'greater':
        return Number(value) > Number(condition.value);
      case 'less':
        return Number(value) < Number(condition.value);
      default:
        return true;
    }
  }

  private async resolveBinding(binding: any, data: any): Promise<any> {
    let value = this.getNestedValue(data, binding.source);

    if (binding.transform) {
      value = await this.applyTransform(value, binding.transform);
    }

    if (binding.format) {
      value = this.formatValue(value, binding.format);
    }

    return value !== undefined ? value : binding.fallback;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async applyTransform(value: any, transform: string): Promise<any> {
    // Apply built-in transformations
    const transforms: Record<string, (val: any) => any> = {
      uppercase: (val) => String(val).toUpperCase(),
      lowercase: (val) => String(val).toLowerCase(),
      percentage: (val) => `${(Number(val) * 100).toFixed(1)}%`,
      currency: (val) => `$${Number(val).toFixed(2)}`,
      date: (val) => new Date(val).toLocaleDateString(),
      truncate: (val) => String(val).slice(0, 100) + '...'
    };

    return transforms[transform] ? transforms[transform](value) : value;
  }

  private formatValue(value: any, format: string): string {
    // Simple template formatting
    return format.replace(/{value}/g, String(value));
  }

  private async renderHTML(sections: TemplateSection[], context: RenderContext): Promise<string> {
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.metadata.name}</title>
  <style>${this.getDefaultCSS()}</style>
</head>
<body>
  <div class="report-container">
`;

    for (const section of sections) {
      html += await this.renderSection(section);
    }

    html += `
  </div>
</body>
</html>`;

    return html;
  }

  private async renderSection(section: TemplateSection): Promise<string> {
    let html = `<section id="${section.id}" class="report-section">`;
    
    if (section.title && section.type !== 'cover') {
      html += `<h2 class="section-title">${section.title}</h2>`;
    }

    for (const component of section.components) {
      html += await this.renderComponent(component);
    }

    html += `</section>`;
    return html;
  }

  private async renderComponent(component: TemplateComponent): Promise<string> {
    const { type, props } = component;

    switch (type) {
      case 'heading':
        return `<h${props.level} class="heading">${props.text}</h${props.level}>`;
      
      case 'paragraph':
        return `<p class="paragraph">${props.text || props.data}</p>`;
      
      case 'list':
        const listTag = props.ordered ? 'ol' : 'ul';
        const items = (props.data || props.items || [])
          .map((item: any) => `<li>${item}</li>`)
          .join('');
        return `<${listTag} class="list">${items}</${listTag}>`;
      
      case 'table':
        return this.renderTable(props);
      
      case 'chart':
        return `<div class="chart" data-type="${props.chartType}">${props.data ? 'Chart: ' + JSON.stringify(props.data).slice(0, 50) + '...' : 'Chart placeholder'}</div>`;
      
      case 'metric-card':
        return `
          <div class="metric-card">
            <div class="metric-label">${props.label}</div>
            <div class="metric-value">${props.value || props.data}</div>
            ${props.trend ? `<div class="metric-trend trend-${props.trend}">${props.trend}</div>` : ''}
          </div>`;
      
      case 'alert':
        return `<div class="alert alert-${props.type}">${props.text || props.data}</div>`;
      
      default:
        return `<div class="component-${type}">${JSON.stringify(props.data || props).slice(0, 100)}</div>`;
    }
  }

  private renderTable(props: any): string {
    if (!props.data || !Array.isArray(props.data)) {
      return '<table class="table"><tr><td>No data</td></tr></table>';
    }

    let html = '<table class="table">';
    
    // Header
    if (props.columns) {
      html += '<thead><tr>';
      for (const col of props.columns) {
        html += `<th>${col.label}</th>`;
      }
      html += '</tr></thead>';
    }

    // Body
    html += '<tbody>';
    for (const row of props.data) {
      html += '<tr>';
      if (props.columns) {
        for (const col of props.columns) {
          html += `<td>${row[col.key] || ''}</td>`;
        }
      } else {
        // Auto-generate from first row
        for (const value of Object.values(row)) {
          html += `<td>${value}</td>`;
        }
      }
      html += '</tr>';
    }
    html += '</tbody></table>';

    return html;
  }

  private async renderPDF(sections: TemplateSection[], context: RenderContext): Promise<Buffer> {
    // Simplified PDF rendering - would use pdf-lib or puppeteer in production
    const html = await this.renderHTML(sections, context);
    return Buffer.from(html);
  }

  private async generatePreviewHTML(sections: TemplateSection[]): Promise<string> {
    let html = '<div class="preview">';
    for (const section of sections) {
      html += await this.renderSection(section);
    }
    html += '</div>';
    return html;
  }

  private getDefaultCSS(): string {
    return `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      .report-section {
        margin-bottom: 40px;
        page-break-inside: avoid;
      }
      .section-title {
        color: #1a202c;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }
      .heading {
        color: #2d3748;
        margin: 20px 0 10px;
      }
      .paragraph {
        margin: 10px 0;
      }
      .table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      .table th {
        background: #f7fafc;
        padding: 12px;
        text-align: left;
        border-bottom: 2px solid #e2e8f0;
      }
      .table td {
        padding: 12px;
        border-bottom: 1px solid #e2e8f0;
      }
      .metric-card {
        display: inline-block;
        padding: 20px;
        margin: 10px;
        background: #f7fafc;
        border-radius: 8px;
        min-width: 200px;
      }
      .metric-label {
        font-size: 14px;
        color: #718096;
        margin-bottom: 5px;
      }
      .metric-value {
        font-size: 28px;
        font-weight: bold;
        color: #2d3748;
      }
      .metric-trend {
        font-size: 14px;
        margin-top: 5px;
      }
      .trend-up { color: #48bb78; }
      .trend-down { color: #f56565; }
      .trend-stable { color: #a0aec0; }
      .alert {
        padding: 15px;
        margin: 20px 0;
        border-radius: 4px;
        border-left: 4px solid;
      }
      .alert-info {
        background: #ebf8ff;
        border-color: #3182ce;
        color: #2c5282;
      }
      .alert-warning {
        background: #fffdf7;
        border-color: #f6ad55;
        color: #744210;
      }
      .alert-error {
        background: #fff5f5;
        border-color: #fc8181;
        color: #742a2a;
      }
      .chart {
        padding: 40px;
        background: #f7fafc;
        border-radius: 8px;
        margin: 20px 0;
        text-align: center;
        min-height: 300px;
      }
      @media print {
        .report-section {
          page-break-after: always;
        }
      }
    `;
  }
}

// Template validation engine
export class TemplateValidator {
  private errors: Array<{ field: string; message: string; severity: string }> = [];

  async validateTemplate(template: BaseTemplate): Promise<ValidationResult> {
    this.errors = [];

    // Run base validation
    const baseValidation = await template.validate();
    
    // Additional custom validations
    await this.validateDataBindings(template);
    await this.validateAccessibility(template);
    await this.validatePerformance(template);

    return {
      valid: this.errors.filter(e => e.severity === 'error').length === 0,
      errors: this.errors.filter(e => e.severity === 'error'),
      warnings: this.errors.filter(e => e.severity === 'warning'),
      info: this.errors.filter(e => e.severity === 'info')
    };
  }

  private async validateDataBindings(template: any): Promise<void> {
    // Validate all data bindings reference valid paths
    // Implementation would check each binding
  }

  private async validateAccessibility(template: any): Promise<void> {
    // Validate WCAG compliance
    // Implementation would check accessibility attributes
  }

  private async validatePerformance(template: any): Promise<void> {
    // Check for performance issues
    // Implementation would check template complexity
  }
}

// Export main template engine
export class TemplateEngine {
  private registry: TemplateRegistry;
  private validator: TemplateValidator;

  constructor() {
    this.registry = TemplateRegistry.getInstance();
    this.validator = new TemplateValidator();
  }

  /**
   * Create a new template using the builder
   */
  createTemplate(): TemplateBuilder {
    return new TemplateBuilder();
  }

  /**
   * Get a registered template
   */
  getTemplate(id: string): typeof BaseTemplate | undefined {
    return this.registry.get(id);
  }

  /**
   * List all available templates
   */
  listTemplates(): Array<{ id: string; name: string }> {
    return this.registry.list();
  }

  /**
   * Validate a template
   */
  async validateTemplate(template: BaseTemplate): Promise<ValidationResult> {
    return this.validator.validateTemplate(template);
  }

  /**
   * Render a template with data
   */
  async renderTemplate(
    templateId: string,
    data: ProcessedData,
    settings: RenderContext['settings']
  ): Promise<any> {
    const TemplateClass = this.registry.get(templateId);
    if (!TemplateClass) {
      throw new Error(`Template ${templateId} not found`);
    }

    const template = new (TemplateClass as any)();
    const context: RenderContext = {
      data,
      metadata: template.metadata,
      settings,
      locale: 'en-US',
      timezone: 'America/Los_Angeles'
    };

    return template.render(context);
  }
}

export default TemplateEngine;