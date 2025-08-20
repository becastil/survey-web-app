/**
 * @module SurveyEnrichmentAgent
 * @description Agent for enriching surveys with KB context and suggestions
 */

import { BaseAgent } from './base-agent';
import { 
  AgentInput, 
  AgentResult, 
  SurveyEnrichmentResult,
  SuggestedQuestion,
  EnrichedQuestion
} from '@/lib/archon/types';
import { getArchonClient } from '@/lib/archon/client';
import { Survey, Question } from '@/types';

export class SurveyEnrichmentAgent extends BaseAgent {
  constructor() {
    super('survey-enrichment', 'enricher');
  }

  async execute<T = SurveyEnrichmentResult>(
    input: AgentInput
  ): Promise<AgentResult<T>> {
    return this.wrapExecution(async () => {
      const { survey, category } = input.data as { survey: Survey; category?: string };
      const archonClient = getArchonClient();

      // Parallel execution of enrichment tasks
      const [enrichedQuestions, suggestions, complianceCheck] = await Promise.all([
        this.enrichQuestions(survey.questions || [], category),
        this.getSuggestions(survey, category),
        this.checkCompliance(survey),
      ]);

      // Get insights from KB
      const insightsResponse = await archonClient.query(
        `Analyze this healthcare survey and provide improvement insights: ${JSON.stringify({
          title: survey.title,
          description: survey.description,
          questionCount: survey.questions?.length || 0,
          category,
        })}`,
        { 
          cacheKey: `survey-insights:${survey.id}`,
          cacheTTL: 600 
        }
      );

      const result: SurveyEnrichmentResult = {
        enrichedQuestions,
        suggestedQuestions: suggestions,
        complianceIssues: complianceCheck,
        insights: insightsResponse.data.insights || [],
      };

      return result as T;
    });
  }

  /**
   * Enrich existing questions with KB context
   */
  private async enrichQuestions(
    questions: Question[], 
    category?: string
  ): Promise<EnrichedQuestion[]> {
    const archonClient = getArchonClient();
    
    const enrichmentPromises = questions.map(async (question) => {
      const response = await archonClient.query(
        `Enhance this survey question with helpful context and accessibility features: ${question.text}. Category: ${category || 'healthcare'}`,
        { 
          cacheKey: `question-enrich:${question.id}`,
          cacheTTL: 1800 
        }
      );

      return {
        id: question.id,
        text: question.text,
        helpText: response.data.helpText || '',
        validationRules: response.data.validation || [],
        accessibility: {
          ariaLabel: question.text,
          ariaDescribedBy: `help-${question.id}`,
          screenReaderHint: response.data.suggestions?.[0] || '',
        },
      } as EnrichedQuestion;
    });

    return Promise.all(enrichmentPromises);
  }

  /**
   * Get question suggestions from KB
   */
  private async getSuggestions(
    survey: Survey, 
    category?: string
  ): Promise<SuggestedQuestion[]> {
    const archonClient = getArchonClient();
    
    // Query for relevant questions based on survey context
    const ragResponse = await archonClient.performRAGQuery(
      `Suggest relevant survey questions for: ${survey.title}. Category: ${category || 'healthcare benefits'}. Existing questions: ${survey.questions?.length || 0}`,
      'file_2025_HC_Survey_FINAL_pdf_1755645523' // Healthcare survey source
    );

    const suggestions: SuggestedQuestion[] = [];
    
    if (ragResponse.results && ragResponse.results.length > 0) {
      for (const result of ragResponse.results.slice(0, 5)) {
        // Parse suggestions from RAG results
        const suggestionText = this.extractQuestionFromContent(result.content);
        if (suggestionText) {
          suggestions.push({
            id: `suggestion-${Date.now()}-${Math.random()}`,
            text: suggestionText,
            type: this.determineQuestionType(suggestionText),
            category: category || 'general',
            relevanceScore: result.relevance,
            source: result.source,
            rationale: `Relevance: ${(result.relevance * 100).toFixed(1)}% - From healthcare survey best practices`,
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Check compliance issues
   */
  private async checkCompliance(survey: Survey): Promise<any[]> {
    const archonClient = getArchonClient();
    
    const complianceResponse = await archonClient.query(
      `Check this healthcare survey for HIPAA and GDPR compliance issues: ${JSON.stringify({
        title: survey.title,
        questions: survey.questions?.map(q => q.text),
      })}`,
      { 
        source: 'file_2025_HC_Survey_FAQ_Cheat_Sheet_pdf_1755645746',
        cacheKey: `compliance:${survey.id}`,
        cacheTTL: 1800 
      }
    );

    // Parse compliance issues from response
    const issues = [];
    if (complianceResponse.data.content.includes('HIPAA')) {
      issues.push({
        severity: 'high',
        regulation: 'HIPAA',
        description: 'Ensure proper handling of protected health information',
        recommendation: 'Add privacy notice and consent mechanisms',
        affectedQuestions: [],
      });
    }

    return issues;
  }

  /**
   * Extract question text from KB content
   */
  private extractQuestionFromContent(content: string): string | null {
    // Simple extraction - in production, use NLP
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.includes('?') || line.toLowerCase().includes('question')) {
        return line.trim();
      }
    }
    return null;
  }

  /**
   * Determine question type based on text
   */
  private determineQuestionType(text: string): 'text' | 'multiple_choice' | 'rating' | 'checkbox' {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('rate') || lowerText.includes('scale')) {
      return 'rating';
    }
    if (lowerText.includes('select all') || lowerText.includes('check all')) {
      return 'checkbox';
    }
    if (lowerText.includes('select') || lowerText.includes('choose')) {
      return 'multiple_choice';
    }
    
    return 'text';
  }
}