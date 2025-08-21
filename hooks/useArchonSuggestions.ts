/**
 * @module useArchonSuggestions
 * @description React hook for getting AI-powered suggestions from Archon KB
 */

import { useState, useEffect } from 'react';
import { getArchonClient } from '@/lib/archon/client';
import { SuggestedQuestion } from '@/lib/archon/types';
import { Question } from '@/types';

interface UseArchonSuggestionsOptions {
  context?: string;
  existingQuestions?: Question[];
  source?: string;
  limit?: number;
}

interface UseArchonSuggestionsResult {
  suggestions: SuggestedQuestion[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useArchonSuggestions(
  options: UseArchonSuggestionsOptions = {}
): UseArchonSuggestionsResult {
  const [suggestions, setSuggestions] = useState<SuggestedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { context, existingQuestions = [], source, limit = 5 } = options;

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const archonClient = getArchonClient();
      
      // Build context for the query
      const queryContext = `
        Survey Context: ${context || 'Healthcare survey'}
        Existing Questions: ${existingQuestions.length}
        ${existingQuestions.length > 0 ? `Topics covered: ${existingQuestions.map(q => q.text).join(', ')}` : ''}
        
        Suggest ${limit} relevant survey questions that complement the existing questions.
      `;

      // Perform RAG query for suggestions
      const ragResponse = await archonClient.performRAGQuery(
        queryContext,
        source || 'file_2025_HC_Survey_FINAL_pdf_1755645523'
      );

      // Parse suggestions from RAG results
      const parsedSuggestions: SuggestedQuestion[] = [];
      
      if (ragResponse.results) {
        for (const result of ragResponse.results.slice(0, limit)) {
          // Extract questions from the content
          const questionMatch = result.content.match(/(?:Question|Q\d+)[:\s]+([^?\n]+\?)/gi);
          
          if (questionMatch) {
            questionMatch.forEach((match, index) => {
              const questionText = match.replace(/^(?:Question|Q\d+)[:\s]+/i, '').trim();
              
              parsedSuggestions.push({
                id: `suggestion-${Date.now()}-${index}`,
                text: questionText,
                type: determineQuestionType(questionText),
                category: context || 'general',
                relevanceScore: result.relevance,
                source: result.source,
                rationale: `Relevance: ${(result.relevance * 100).toFixed(1)}%`,
              });
            });
          }
        }
      }

      // If no suggestions from RAG, generate some defaults
      if (parsedSuggestions.length === 0) {
        const defaultSuggestions = await generateDefaultSuggestions(context, existingQuestions);
        setSuggestions(defaultSuggestions);
      } else {
        setSuggestions(parsedSuggestions);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch suggestions');
      setError(error);
      console.error('Suggestions error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [context, JSON.stringify(existingQuestions), source, limit]);

  return {
    suggestions,
    loading,
    error,
    refresh: fetchSuggestions,
  };
}

/**
 * Determine question type based on text content
 */
function determineQuestionType(text: string): 'text' | 'multiple_choice' | 'rating' | 'checkbox' {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('rate') || lowerText.includes('scale') || lowerText.includes('1-10')) {
    return 'rating';
  }
  if (lowerText.includes('select all') || lowerText.includes('check all') || lowerText.includes('which of')) {
    return 'checkbox';
  }
  if (lowerText.includes('select') || lowerText.includes('choose') || lowerText.includes('pick')) {
    return 'multiple_choice';
  }
  
  return 'text';
}

/**
 * Generate default suggestions when KB is unavailable
 */
async function generateDefaultSuggestions(
  _context?: string,
  _existingQuestions?: Question[]
): Promise<SuggestedQuestion[]> {
  const healthcareSuggestions: SuggestedQuestion[] = [
    {
      id: 'default-1',
      text: 'How satisfied are you with your current healthcare coverage?',
      type: 'rating',
      category: 'satisfaction',
      relevanceScore: 0.9,
      source: 'default',
      rationale: 'Essential satisfaction metric for healthcare surveys',
    },
    {
      id: 'default-2',
      text: 'Which healthcare services have you used in the past 12 months?',
      type: 'checkbox',
      category: 'usage',
      relevanceScore: 0.85,
      source: 'default',
      rationale: 'Helps understand service utilization patterns',
    },
    {
      id: 'default-3',
      text: 'What is your primary concern regarding healthcare costs?',
      type: 'multiple_choice',
      category: 'financial',
      relevanceScore: 0.88,
      source: 'default',
      rationale: 'Critical for understanding cost-related barriers',
    },
    {
      id: 'default-4',
      text: 'Please describe any challenges you face accessing healthcare services',
      type: 'text',
      category: 'access',
      relevanceScore: 0.82,
      source: 'default',
      rationale: 'Open-ended feedback on access barriers',
    },
    {
      id: 'default-5',
      text: 'How likely are you to recommend your healthcare provider to others?',
      type: 'rating',
      category: 'nps',
      relevanceScore: 0.95,
      source: 'default',
      rationale: 'Net Promoter Score for provider satisfaction',
    },
  ];

  // Filter out suggestions that might duplicate existing questions
  const existingTexts = _existingQuestions?.map((q: any) => q.text?.toLowerCase()) || [];
  
  return healthcareSuggestions.filter(suggestion => 
    !existingTexts.some((existing: any) => 
      existing.includes(suggestion.text.toLowerCase().slice(0, 20))
    )
  );
}