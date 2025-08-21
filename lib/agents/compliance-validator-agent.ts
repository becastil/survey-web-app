/**
 * @module ComplianceValidatorAgent
 * @description Agent for validating survey compliance with regulations
 */

import { BaseAgent } from './base-agent';
import { AgentInput, AgentResult, ComplianceIssue } from '@/lib/archon/types';
import { getArchonClient } from '@/lib/archon/client';
import { Survey } from '@/types';

export interface ComplianceValidationResult {
  isCompliant: boolean;
  issues: ComplianceIssue[];
  score: number; // 0-100
  recommendations: string[];
  certifications: string[];
}

export class ComplianceValidatorAgent extends BaseAgent {
  constructor() {
    super('compliance-validator', 'validator');
  }

  async execute<T = ComplianceValidationResult>(
    input: AgentInput
  ): Promise<AgentResult<T>> {
    return this.wrapExecution(async () => {
      const { survey, regulations = ['HIPAA', 'GDPR'] } = input.data as {
        survey: Survey;
        regulations?: string[];
      };

      const issues: ComplianceIssue[] = [];
      const recommendations: string[] = [];

      // Check each regulation
      for (const regulation of regulations) {
        const complianceCheck = await this.checkRegulation(survey, regulation);
        issues.push(...complianceCheck.issues);
        recommendations.push(...complianceCheck.recommendations);
      }

      // Calculate compliance score
      const score = this.calculateComplianceScore(issues);

      // Get certifications that can be claimed
      const certifications = await this.getApplicableCertifications(score, regulations);

      const result: ComplianceValidationResult = {
        isCompliant: issues.filter(i => i.severity === 'critical').length === 0,
        issues,
        score,
        recommendations: [...new Set(recommendations)], // Remove duplicates
        certifications,
      };

      return result as T;
    });
  }

  /**
   * Check compliance for a specific regulation
   */
  private async checkRegulation(
    survey: Survey,
    regulation: string
  ): Promise<{ issues: ComplianceIssue[]; recommendations: string[] }> {
    const archonClient = getArchonClient();
    
    const response = await archonClient.query(
      `Check this healthcare survey for ${regulation} compliance. Survey: ${JSON.stringify({
        title: survey.title,
        description: survey.description,
        questions: survey.questions?.map(q => ({
          text: q.text,
          type: q.type,
          required: q.required,
        })),
      })}. Provide specific compliance issues and recommendations.`,
      {
        source: 'file_2025_HC_Survey_FAQ_Cheat_Sheet_pdf_1755645746',
        cacheKey: `compliance:${regulation}:${survey.id}`,
        cacheTTL: 1800,
      }
    );

    // Parse response for issues
    const issues: ComplianceIssue[] = [];
    const recommendations: string[] = [];

    // Check for specific compliance requirements
    if (regulation === 'HIPAA') {
      issues.push(...this.checkHIPAACompliance(survey));
      recommendations.push(...this.getHIPAARecommendations(survey));
    } else if (regulation === 'GDPR') {
      issues.push(...this.checkGDPRCompliance(survey));
      recommendations.push(...this.getGDPRRecommendations(survey));
    }

    // Add KB-derived insights
    if (response.data.suggestions) {
      recommendations.push(...response.data.suggestions);
    }

    return { issues, recommendations };
  }

  /**
   * Check HIPAA compliance
   */
  private checkHIPAACompliance(survey: Survey): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];
    const questions = survey.questions || [];

    // Check for PHI handling
    const phiQuestions = questions.filter(q => 
      q.text && this.containsPHI(q.text)
    );

    if (phiQuestions.length > 0 && !survey.settings?.encryptionEnabled) {
      issues.push({
        severity: 'critical',
        regulation: 'HIPAA',
        description: 'Survey collects Protected Health Information without encryption',
        recommendation: 'Enable end-to-end encryption for PHI data',
        affectedQuestions: phiQuestions.map(q => q.id),
      });
    }

    // Check for consent
    const hasConsent = questions.some(q => 
      q.text?.toLowerCase().includes('consent') || 
      q.text?.toLowerCase().includes('agree')
    );

    if (!hasConsent && phiQuestions.length > 0) {
      issues.push({
        severity: 'high',
        regulation: 'HIPAA',
        description: 'Missing explicit consent for PHI collection',
        recommendation: 'Add a consent question at the beginning of the survey',
        affectedQuestions: [],
      });
    }

    return issues;
  }

  /**
   * Check GDPR compliance
   */
  private checkGDPRCompliance(survey: Survey): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];
    const questions = survey.questions || [];

    // Check for personal data
    const personalDataQuestions = questions.filter(q =>
      q.text && this.containsPersonalData(q.text)
    );

    if (personalDataQuestions.length > 0) {
      // Check for purpose limitation
      if (!survey.description || survey.description.length < 50) {
        issues.push({
          severity: 'medium',
          regulation: 'GDPR',
          description: 'Insufficient description of data processing purpose',
          recommendation: 'Provide a clear, detailed description of how the data will be used',
          affectedQuestions: personalDataQuestions.map(q => q.id),
        });
      }

      // Check for data retention policy
      if (!survey.settings?.dataRetentionDays) {
        issues.push({
          severity: 'high',
          regulation: 'GDPR',
          description: 'No data retention policy specified',
          recommendation: 'Define a clear data retention period',
          affectedQuestions: [],
        });
      }
    }

    return issues;
  }

  /**
   * Get HIPAA recommendations
   */
  private getHIPAARecommendations(_survey: Survey): string[] {
    return [
      'Implement access controls and audit logs',
      'Use secure transmission protocols (HTTPS/TLS)',
      'Add Business Associate Agreement (BAA) if sharing data',
      'Implement automatic session timeout',
      'Enable data encryption at rest and in transit',
    ];
  }

  /**
   * Get GDPR recommendations
   */
  private getGDPRRecommendations(_survey: Survey): string[] {
    return [
      'Add privacy policy link',
      'Implement right to erasure (delete user data)',
      'Provide data portability options',
      'Add explicit consent checkboxes',
      'Document lawful basis for processing',
    ];
  }

  /**
   * Check if text contains PHI
   */
  private containsPHI(text: string): boolean {
    const phiKeywords = [
      'medical', 'health', 'diagnosis', 'treatment', 'medication',
      'condition', 'symptom', 'disease', 'prescription', 'insurance',
      'ssn', 'social security', 'date of birth', 'dob',
    ];

    const lowerText = text.toLowerCase();
    return phiKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Check if text contains personal data
   */
  private containsPersonalData(text: string): boolean {
    const personalKeywords = [
      'name', 'email', 'phone', 'address', 'age', 'gender',
      'birth', 'identification', 'id', 'passport', 'license',
    ];

    const lowerText = text.toLowerCase();
    return personalKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(issues: ComplianceIssue[]): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Get applicable certifications based on score
   */
  private async getApplicableCertifications(
    score: number,
    regulations: string[]
  ): Promise<string[]> {
    const certifications: string[] = [];

    if (score >= 95) {
      certifications.push('Gold Compliance Standard');
    } else if (score >= 85) {
      certifications.push('Silver Compliance Standard');
    } else if (score >= 75) {
      certifications.push('Bronze Compliance Standard');
    }

    if (score >= 90 && regulations.includes('HIPAA')) {
      certifications.push('HIPAA Ready');
    }

    if (score >= 90 && regulations.includes('GDPR')) {
      certifications.push('GDPR Compliant');
    }

    return certifications;
  }
}