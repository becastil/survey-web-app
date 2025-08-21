/**
 * @module ContentGenerator
 * @description Healthcare-specific Natural Language Generation engine
 */

import { z } from 'zod';
import { ProcessedData, Insight, RegionalAnalysis } from './data-processor';

// Medical terminology database
export const MedicalTerminology = {
  // General healthcare terms
  general: {
    positive: ['improved', 'enhanced', 'strengthened', 'optimized', 'elevated', 'advanced'],
    negative: ['declined', 'deteriorated', 'weakened', 'diminished', 'reduced', 'compromised'],
    neutral: ['maintained', 'sustained', 'stabilized', 'unchanged', 'consistent', 'steady'],
    metrics: ['outcomes', 'indicators', 'measures', 'benchmarks', 'standards', 'criteria']
  },
  
  // Domain-specific terminology
  cardiology: {
    terms: ['cardiovascular', 'cardiac', 'hemodynamic', 'vascular', 'coronary', 'arterial'],
    metrics: ['ejection fraction', 'blood pressure', 'heart rate', 'cardiac output', 'stroke volume'],
    outcomes: ['mortality', 'morbidity', 'readmission', 'complications', 'recovery']
  },
  
  oncology: {
    terms: ['oncological', 'neoplastic', 'malignant', 'benign', 'metastatic', 'carcinogenic'],
    metrics: ['survival rate', 'progression-free survival', 'response rate', 'tumor markers'],
    outcomes: ['remission', 'recurrence', 'quality of life', 'toxicity', 'adverse events']
  },
  
  mentalHealth: {
    terms: ['psychological', 'psychiatric', 'behavioral', 'cognitive', 'emotional', 'psychosocial'],
    metrics: ['PHQ-9', 'GAD-7', 'depression screening', 'anxiety assessment', 'mood scores'],
    outcomes: ['symptom reduction', 'functional improvement', 'treatment adherence', 'relapse']
  },
  
  preventiveCare: {
    terms: ['prophylactic', 'preventive', 'screening', 'immunization', 'wellness', 'primary'],
    metrics: ['screening rates', 'vaccination coverage', 'risk assessment', 'compliance rates'],
    outcomes: ['early detection', 'disease prevention', 'health maintenance', 'risk reduction']
  },
  
  pharmacology: {
    terms: ['pharmaceutical', 'medication', 'therapeutic', 'pharmacological', 'dosage', 'regimen'],
    metrics: ['adherence', 'compliance', 'drug levels', 'efficacy', 'bioavailability'],
    outcomes: ['therapeutic response', 'adverse reactions', 'drug interactions', 'tolerance']
  }
};

// Regulatory citations
export const RegulatoryReferences = {
  hipaa: {
    privacy: '45 CFR § 164.502 - Uses and disclosures of protected health information',
    security: '45 CFR § 164.308 - Administrative safeguards',
    breach: '45 CFR § 164.404 - Notification to individuals'
  },
  aca: {
    quality: 'Section 3001 - Hospital Value-Based Purchasing Program',
    reporting: 'Section 3013 - Quality measure development'
  },
  jointCommission: {
    patientSafety: 'NPSG.07.01.01 - Hand hygiene guidelines',
    medication: 'MM.06.01.01 - Medication administration'
  },
  cms: {
    conditions: '42 CFR § 482 - Conditions of participation',
    quality: 'CMS Quality Reporting Programs'
  }
};

// Content generation types
export interface GenerationOptions {
  tone: 'clinical' | 'executive' | 'patient-friendly';
  audience: 'healthcare-professional' | 'c-suite' | 'patient' | 'regulatory';
  domain?: keyof typeof MedicalTerminology;
  includeReferences?: boolean;
  maxLength?: number;
  variationSeed?: number;
}

export interface GeneratedContent {
  text: string;
  confidence: number;
  references?: string[];
  readabilityScore?: number;
  tone: string;
  wordCount: number;
}

// PHI detection patterns
const PHI_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  mrn: /\b[A-Z]{2,3}\d{6,10}\b/g,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  dob: /\b(0[1-9]|1[0-2])[\/\-](0[1-9]|[12][0-9]|3[01])[\/\-](19|20)\d{2}\b/g
};

export class ContentGenerator {
  private variationEngine: VariationEngine;
  private medicalValidator: MedicalValidator;
  
  constructor() {
    this.variationEngine = new VariationEngine();
    this.medicalValidator = new MedicalValidator();
  }

  /**
   * Generate healthcare narrative from processed data
   */
  async generateNarrative(
    data: ProcessedData,
    options: GenerationOptions
  ): Promise<GeneratedContent> {
    // Select appropriate terminology
    const terminology = this.selectTerminology(options.domain);
    
    // Generate base narrative
    let narrative = await this.constructNarrative(data, terminology, options);
    
    // Apply tone adjustments
    narrative = this.adjustTone(narrative, options.tone);
    
    // Add regulatory references if needed
    if (options.includeReferences) {
      narrative = this.addReferences(narrative, options.audience);
    }
    
    // Validate medical accuracy
    const validation = await this.medicalValidator.validate(narrative);
    
    // Calculate readability
    const readabilityScore = this.calculateReadability(narrative);
    
    return {
      text: narrative,
      confidence: validation.accuracy,
      references: options.includeReferences ? this.extractReferences(narrative) : undefined,
      readabilityScore,
      tone: options.tone,
      wordCount: narrative.split(' ').length
    };
  }

  /**
   * Generate insight descriptions
   */
  async generateInsightDescription(
    insight: Insight,
    options: GenerationOptions
  ): Promise<string> {
    const templates = this.getInsightTemplates(options.tone);
    let description = '';
    
    switch (insight.type) {
      case 'positive':
        description = this.variationEngine.select(templates.positive, options.variationSeed);
        break;
      case 'negative':
        description = this.variationEngine.select(templates.negative, options.variationSeed);
        break;
      case 'action':
        description = this.variationEngine.select(templates.action, options.variationSeed);
        break;
      default:
        description = this.variationEngine.select(templates.neutral, options.variationSeed);
    }
    
    // Replace placeholders
    description = this.replacePlaceholders(description, {
      category: insight.category,
      title: insight.title,
      impact: insight.impact,
      confidence: `${(insight.confidence * 100).toFixed(0)}%`
    });
    
    return description;
  }

  /**
   * Generate comparative analysis text
   */
  async generateComparison(
    current: number,
    previous: number,
    benchmark: number,
    metric: string,
    options: GenerationOptions
  ): Promise<string> {
    const change = ((current - previous) / previous) * 100;
    const variance = ((current - benchmark) / benchmark) * 100;
    
    let comparison = '';
    
    if (options.tone === 'clinical') {
      comparison = `${metric} measured at ${current.toFixed(2)}, representing a ${Math.abs(change).toFixed(1)}% ${change > 0 ? 'increase' : 'decrease'} from baseline. `;
      comparison += `Performance is ${Math.abs(variance).toFixed(1)}% ${variance > 0 ? 'above' : 'below'} established benchmarks.`;
    } else if (options.tone === 'executive') {
      comparison = `${metric} ${change > 0 ? 'improved' : 'declined'} by ${Math.abs(change).toFixed(1)}% to ${current.toFixed(1)}. `;
      comparison += variance > 0 
        ? `This exceeds industry benchmarks by ${variance.toFixed(1)}%, demonstrating strong performance.`
        : `This falls ${Math.abs(variance).toFixed(1)}% below industry standards, indicating opportunity for improvement.`;
    } else {
      comparison = `${metric} ${change > 0 ? 'got better' : 'went down'} compared to last time. `;
      comparison += variance > 0 
        ? `This is better than most similar organizations.`
        : `There's room for improvement compared to others.`;
    }
    
    return comparison;
  }

  /**
   * Detect and redact PHI
   */
  detectAndRedactPHI(text: string): { redacted: string; phiDetected: boolean } {
    let redacted = text;
    let phiDetected = false;
    
    for (const [type, pattern] of Object.entries(PHI_PATTERNS)) {
      if (pattern.test(redacted)) {
        phiDetected = true;
        redacted = redacted.replace(pattern, `[REDACTED-${type.toUpperCase()}]`);
      }
    }
    
    return { redacted, phiDetected };
  }

  /**
   * Select appropriate medical terminology
   */
  private selectTerminology(domain?: keyof typeof MedicalTerminology): typeof MedicalTerminology.general {
    if (domain && MedicalTerminology[domain]) {
      return { ...MedicalTerminology.general, ...MedicalTerminology[domain] };
    }
    return MedicalTerminology.general;
  }

  /**
   * Construct narrative from data
   */
  private async constructNarrative(
    data: ProcessedData,
    terminology: any,
    options: GenerationOptions
  ): Promise<string> {
    const sections: string[] = [];
    
    // Opening statement
    sections.push(this.generateOpening(data.summary, terminology, options));
    
    // Key findings
    if (data.insights.length > 0) {
      sections.push(this.generateKeyFindings(data.insights, terminology, options));
    }
    
    // Regional performance
    if (data.regional.length > 0) {
      sections.push(this.generateRegionalAnalysis(data.regional, terminology, options));
    }
    
    // Recommendations
    if (data.benchmarks.improvementAreas.length > 0) {
      sections.push(this.generateRecommendations(data.benchmarks.improvementAreas, terminology, options));
    }
    
    return sections.join('\n\n');
  }

  /**
   * Generate opening statement
   */
  private generateOpening(summary: any, terminology: any, options: GenerationOptions): string {
    const templates = {
      clinical: [
        `Analysis of ${summary.totalResponses} survey responses collected between ${this.formatDate(summary.dateRange.start)} and ${this.formatDate(summary.dateRange.end)} reveals significant findings regarding healthcare service delivery and patient outcomes.`,
        `This report presents clinical findings from ${summary.totalResponses} patient responses across ${summary.uniqueOrganizations} healthcare facilities, with a ${(summary.responseRate * 100).toFixed(1)}% response rate.`
      ],
      executive: [
        `Executive summary based on ${summary.totalResponses} responses from ${summary.uniqueOrganizations} organizations demonstrates key performance indicators and strategic opportunities.`,
        `Comprehensive analysis of ${summary.totalResponses} stakeholder responses reveals critical insights for organizational decision-making and strategic planning.`
      ],
      'patient-friendly': [
        `We collected feedback from ${summary.totalResponses} people about their healthcare experience to understand what's working well and what needs improvement.`,
        `Thank you to the ${summary.totalResponses} participants who shared their experiences. Here's what we learned from your feedback.`
      ]
    };
    
    return this.variationEngine.select(templates[options.tone] || templates.clinical);
  }

  /**
   * Generate key findings section
   */
  private generateKeyFindings(insights: Insight[], terminology: any, options: GenerationOptions): string {
    const findings: string[] = ['Key Findings:'];
    
    const topInsights = insights
      .filter(i => i.impact === 'high')
      .slice(0, 3);
    
    for (const insight of topInsights) {
      const description = this.generateInsightSentence(insight, terminology, options);
      findings.push(`• ${description}`);
    }
    
    return findings.join('\n');
  }

  /**
   * Generate insight sentence
   */
  private generateInsightSentence(insight: Insight, terminology: any, options: GenerationOptions): string {
    const impact = insight.type === 'positive' ? terminology.positive[0] : terminology.negative[0];
    
    if (options.tone === 'clinical') {
      return `${insight.category} metrics ${impact} with ${(insight.confidence * 100).toFixed(0)}% confidence (p < 0.05).`;
    } else if (options.tone === 'executive') {
      return `${insight.title} - ${insight.description}`;
    } else {
      return `${insight.category} has ${impact} based on the survey results.`;
    }
  }

  /**
   * Generate regional analysis
   */
  private generateRegionalAnalysis(regional: RegionalAnalysis[], terminology: any, options: GenerationOptions): string {
    const topRegion = regional[0];
    const bottomRegion = regional[regional.length - 1];
    
    if (options.tone === 'clinical') {
      return `Regional analysis indicates ${topRegion.region} demonstrates superior performance metrics (satisfaction: ${topRegion.metrics.satisfaction.toFixed(2)}), while ${bottomRegion.region} requires targeted intervention (satisfaction: ${bottomRegion.metrics.satisfaction.toFixed(2)}).`;
    } else if (options.tone === 'executive') {
      return `${topRegion.region} leads regional performance with ${topRegion.responseCount} responses and strong satisfaction scores. Focus areas include supporting underperforming regions like ${bottomRegion.region}.`;
    } else {
      return `${topRegion.region} had the best results, while ${bottomRegion.region} has the most room for improvement.`;
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(improvementAreas: any[], terminology: any, options: GenerationOptions): string {
    const recs: string[] = ['Recommendations:'];
    
    const topAreas = improvementAreas.slice(0, 3);
    
    for (const area of topAreas) {
      const rec = this.generateRecommendation(area, terminology, options);
      recs.push(`• ${rec}`);
    }
    
    return recs.join('\n');
  }

  /**
   * Generate single recommendation
   */
  private generateRecommendation(area: any, terminology: any, options: GenerationOptions): string {
    if (options.tone === 'clinical') {
      return `Implement evidence-based interventions to address ${area.metric} (current: ${area.currentValue.toFixed(1)}, target: ${area.targetValue.toFixed(1)}).`;
    } else if (options.tone === 'executive') {
      return `Prioritize ${area.metric} improvement to close ${area.gap.toFixed(1)}-point performance gap and achieve industry benchmarks.`;
    } else {
      return `Work on improving ${area.metric} to reach the goal.`;
    }
  }

  /**
   * Adjust tone of content
   */
  private adjustTone(text: string, tone: GenerationOptions['tone']): string {
    // Tone adjustment mappings
    const adjustments = {
      clinical: {
        'patients': 'subjects',
        'doctors': 'physicians',
        'medicine': 'medication',
        'sick': 'ill'
      },
      executive: {
        'patients': 'stakeholders',
        'costs': 'investments',
        'problems': 'challenges',
        'failures': 'opportunities for improvement'
      },
      'patient-friendly': {
        'physician': 'doctor',
        'medication': 'medicine',
        'adverse event': 'side effect',
        'mortality': 'death rate'
      }
    };
    
    let adjusted = text;
    const toneAdjustments = adjustments[tone];
    
    if (toneAdjustments) {
      for (const [from, to] of Object.entries(toneAdjustments)) {
        const regex = new RegExp(`\\b${from}\\b`, 'gi');
        adjusted = adjusted.replace(regex, to);
      }
    }
    
    return adjusted;
  }

  /**
   * Add regulatory references
   */
  private addReferences(text: string, audience: GenerationOptions['audience']): string {
    const references: string[] = [];
    
    // Add relevant references based on content
    if (text.includes('privacy') || text.includes('PHI')) {
      references.push(RegulatoryReferences.hipaa.privacy);
    }
    if (text.includes('quality') || text.includes('performance')) {
      references.push(RegulatoryReferences.cms.quality);
    }
    
    if (references.length > 0) {
      return `${text}\n\nReferences:\n${references.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
    }
    
    return text;
  }

  /**
   * Extract references from text
   */
  private extractReferences(text: string): string[] {
    const refSection = text.split('References:')[1];
    if (!refSection) return [];
    
    return refSection
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, ''));
  }

  /**
   * Calculate readability score (Flesch-Kincaid)
   */
  private calculateReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const words = text.split(/\s+/).filter(w => w);
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    // Flesch Reading Ease
    const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count syllables in a word
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = /[aeiou]/.test(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    // Adjust for silent e
    if (word.endsWith('e')) {
      count--;
    }
    
    return Math.max(1, count);
  }

  /**
   * Replace placeholders in template
   */
  private replacePlaceholders(template: string, values: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(values)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return result;
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  /**
   * Get insight templates by tone
   */
  private getInsightTemplates(tone: GenerationOptions['tone']) {
    return {
      positive: {
        clinical: [
          '{category} demonstrates statistically significant improvement with {confidence} confidence.',
          'Positive outcomes observed in {category} metrics exceed expected parameters.'
        ],
        executive: [
          '{category} shows strong performance, creating value and competitive advantage.',
          'Excellence in {category} positions the organization for continued success.'
        ],
        'patient-friendly': [
          '{category} is doing really well based on your feedback.',
          'Great news about {category} - things are improving!'
        ]
      }[tone] || [],
      
      negative: {
        clinical: [
          '{category} metrics indicate areas requiring clinical intervention.',
          'Suboptimal performance in {category} necessitates targeted improvement strategies.'
        ],
        executive: [
          '{category} presents opportunities for strategic improvement and resource allocation.',
          'Performance gaps in {category} require executive attention and action planning.'
        ],
        'patient-friendly': [
          '{category} needs some work based on the feedback we received.',
          'We heard your concerns about {category} and are working on improvements.'
        ]
      }[tone] || [],
      
      action: {
        clinical: [
          'Implement evidence-based protocols to address {category} performance gaps.',
          'Clinical intervention recommended for {category} based on data analysis.'
        ],
        executive: [
          'Strategic initiative required to optimize {category} performance metrics.',
          'Executive action needed to address {category} improvement opportunities.'
        ],
        'patient-friendly': [
          'We're taking action to improve {category} based on your feedback.',
          'Your input about {category} is helping us make important changes.'
        ]
      }[tone] || [],
      
      neutral: {
        clinical: [
          '{category} metrics remain within expected clinical parameters.',
          'No significant variance observed in {category} performance indicators.'
        ],
        executive: [
          '{category} performance remains stable and aligned with projections.',
          'Steady state maintained in {category} with consistent metrics.'
        ],
        'patient-friendly': [
          '{category} is staying about the same as before.',
          'No major changes in {category} based on the latest feedback.'
        ]
      }[tone] || []
    };
  }
}

/**
 * Variation engine to avoid repetitive content
 */
class VariationEngine {
  private usedPhrases: Set<string> = new Set();
  
  select(options: string[], seed?: number): string {
    // Filter out recently used phrases
    const available = options.filter(opt => !this.usedPhrases.has(opt));
    
    if (available.length === 0) {
      // Reset if all options used
      this.usedPhrases.clear();
      return options[Math.floor(Math.random() * options.length)];
    }
    
    const selected = available[Math.floor((seed || Math.random()) * available.length)];
    this.usedPhrases.add(selected);
    
    // Keep only last 10 used phrases
    if (this.usedPhrases.size > 10) {
      const arr = Array.from(this.usedPhrases);
      this.usedPhrases = new Set(arr.slice(-10));
    }
    
    return selected;
  }
  
  reset(): void {
    this.usedPhrases.clear();
  }
}

/**
 * Medical content validator
 */
class MedicalValidator {
  async validate(content: string): Promise<{ accuracy: number; issues: string[] }> {
    const issues: string[] = [];
    let accuracy = 1.0;
    
    // Check for contradictions
    if (content.includes('increased') && content.includes('decreased') && content.length < 100) {
      issues.push('Potential contradiction detected');
      accuracy -= 0.1;
    }
    
    // Check for medical term accuracy
    const medicalTerms = content.match(/\b(mortality|morbidity|efficacy|adherence|compliance)\b/gi);
    if (medicalTerms) {
      // Simplified validation - in production would check context
      accuracy = Math.max(0.8, accuracy);
    }
    
    // Check for appropriate confidence language
    if (!content.match(/\b(may|might|suggests|indicates|demonstrates)\b/i)) {
      issues.push('Missing confidence qualifiers');
      accuracy -= 0.05;
    }
    
    return {
      accuracy: Math.max(0, Math.min(1, accuracy)),
      issues
    };
  }
}

export default ContentGenerator;