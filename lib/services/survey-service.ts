import { Survey, Question, Response, Answer } from '@/types';
import { mockSurveys } from '@/lib/mock-data/surveys';
import { mockQuestions } from '@/lib/mock-data/questions';
import { mockResponses, mockAnswers, getResponseStats, getResponseTrend } from '@/lib/mock-data/responses';
import { createClient } from '@/lib/supabase/client';
import { safeLocalStorage } from '@/lib/utils/storage';

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

class SurveyService {
  private supabase = USE_MOCK_DATA ? null : createClient();

  // Survey CRUD operations
  async getSurveys(): Promise<Survey[]> {
    if (USE_MOCK_DATA) {
      // Get from localStorage if exists, otherwise use mock data
      const stored = safeLocalStorage.getItem('surveys');
      return stored ? JSON.parse(stored) : mockSurveys;
    }

    const { data, error } = await this.supabase!
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getSurvey(id: string): Promise<Survey | null> {
    if (USE_MOCK_DATA) {
      const surveys = await this.getSurveys();
      return surveys.find(s => s.id === id) || null;
    }

    const { data, error } = await this.supabase!
      .from('surveys')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createSurvey(survey: Omit<Survey, 'id' | 'created_at' | 'updated_at'>): Promise<Survey> {
    const newSurvey: Survey = {
      ...survey,
      id: `survey-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (USE_MOCK_DATA) {
      const surveys = await this.getSurveys();
      const updated = [...surveys, newSurvey];
      safeLocalStorage.setItem('surveys', JSON.stringify(updated));
      return newSurvey;
    }

    const { data, error } = await this.supabase!
      .from('surveys')
      .insert(survey)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSurvey(id: string, updates: Partial<Survey>): Promise<Survey> {
    if (USE_MOCK_DATA) {
      const surveys = await this.getSurveys();
      const index = surveys.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Survey not found');
      
      surveys[index] = {
        ...surveys[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      safeLocalStorage.setItem('surveys', JSON.stringify(surveys));
      return surveys[index];
    }

    const { data, error } = await this.supabase!
      .from('surveys')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSurvey(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const surveys = await this.getSurveys();
      const filtered = surveys.filter(s => s.id !== id);
      safeLocalStorage.setItem('surveys', JSON.stringify(filtered));
      return;
    }

    const { error } = await this.supabase!
      .from('surveys')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Question operations
  async getQuestions(surveyId: string): Promise<Question[]> {
    if (USE_MOCK_DATA) {
      const stored = safeLocalStorage.getItem(`questions-${surveyId}`);
      return stored ? JSON.parse(stored) : (mockQuestions[surveyId] || []);
    }

    const { data, error } = await this.supabase!
      .from('questions')
      .select('*, question_options(*)')
      .eq('survey_id', surveyId)
      .order('order');

    if (error) throw error;
    return data || [];
  }

  async createQuestion(question: Omit<Question, 'id'>): Promise<Question> {
    const newQuestion: Question = {
      ...question,
      id: `q-${Date.now()}`,
    };

    if (USE_MOCK_DATA) {
      const questions = await this.getQuestions(question.survey_id);
      const updated = [...questions, newQuestion];
      safeLocalStorage.setItem(`questions-${question.survey_id}`, JSON.stringify(updated));
      return newQuestion;
    }

    const { data, error } = await this.supabase!
      .from('questions')
      .insert(question)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Response operations
  async getResponses(surveyId?: string): Promise<Response[]> {
    if (USE_MOCK_DATA) {
      const stored = safeLocalStorage.getItem('responses');
      const responses = stored ? JSON.parse(stored) : mockResponses;
      return surveyId ? responses.filter((r: Response) => r.survey_id === surveyId) : responses;
    }

    const query = this.supabase!.from('responses').select('*');
    if (surveyId) query.eq('survey_id', surveyId);
    
    const { data, error } = await query.order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async submitResponse(response: Omit<Response, 'id' | 'started_at'>): Promise<Response> {
    const newResponse: Response = {
      ...response,
      id: `response-${Date.now()}`,
      started_at: new Date().toISOString(),
    };

    if (USE_MOCK_DATA) {
      const responses = await this.getResponses();
      const updated = [...responses, newResponse];
      safeLocalStorage.setItem('responses', JSON.stringify(updated));
      return newResponse;
    }

    const { data, error } = await this.supabase!
      .from('responses')
      .insert(response)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics
  async getSurveyStats(surveyId: string) {
    if (USE_MOCK_DATA) {
      return getResponseStats(surveyId);
    }

    const { data, error } = await this.supabase!
      .from('responses')
      .select('status')
      .eq('survey_id', surveyId);

    if (error) throw error;

    const completed = data?.filter((r: any) => r.status === 'completed').length || 0;
    const inProgress = data?.filter((r: any) => r.status === 'in_progress').length || 0;
    const total = data?.length || 0;

    return {
      total,
      completed,
      inProgress,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  async getResponseTrend() {
    if (USE_MOCK_DATA) {
      return getResponseTrend();
    }

    // Implement real data fetching
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await this.supabase!
      .from('responses')
      .select('started_at')
      .gte('started_at', thirtyDaysAgo.toISOString())
      .order('started_at');

    if (error) throw error;

    // Group by date and count
    const trend: { [key: string]: number } = {};
    data?.forEach((response: any) => {
      const date = new Date(response.started_at).toISOString().split('T')[0];
      trend[date] = (trend[date] || 0) + 1;
    });

    return Object.entries(trend).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }));
  }

  // Answer operations
  async submitAnswers(answers: Omit<Answer, 'id' | 'created_at' | 'updated_at'>[]): Promise<Answer[]> {
    if (USE_MOCK_DATA) {
      const newAnswers = answers.map(answer => ({
        ...answer,
        id: `answer-${Date.now()}-${Math.random()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const stored = safeLocalStorage.getItem('answers');
      const existing = stored ? JSON.parse(stored) : mockAnswers;
      const updated = [...existing, ...newAnswers];
      
      safeLocalStorage.setItem('answers', JSON.stringify(updated));
      return newAnswers;
    }

    const { data, error } = await this.supabase!
      .from('answers')
      .insert(answers)
      .select();

    if (error) throw error;
    return data || [];
  }

  async getAnswers(responseId: string): Promise<Answer[]> {
    if (USE_MOCK_DATA) {
      const stored = safeLocalStorage.getItem('answers');
      const answers = stored ? JSON.parse(stored) : mockAnswers;
      return answers.filter((a: Answer) => a.response_id === responseId);
    }

    const { data, error } = await this.supabase!
      .from('answers')
      .select('*')
      .eq('response_id', responseId);

    if (error) throw error;
    return data || [];
  }
}

export const surveyService = new SurveyService();