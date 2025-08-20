import { Response, Answer } from '@/types';

// Generate realistic response data
function generateResponses(surveyId: string, count: number): Response[] {
  const responses: Response[] = [];
  const startDate = new Date('2025-01-01');
  
  for (let i = 0; i < count; i++) {
    const responseDate = new Date(startDate);
    responseDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
    
    responses.push({
      id: `response-${surveyId}-${i}`,
      survey_id: surveyId,
      respondent_email: `user${i + 1}@healthcare.org`,
      status: Math.random() > 0.1 ? 'completed' : 'in_progress',
      started_at: responseDate.toISOString(),
      completed_at: Math.random() > 0.1 ? 
        new Date(responseDate.getTime() + 15 * 60000).toISOString() : 
        null,
    });
  }
  
  return responses;
}

export const mockResponses: Response[] = [
  ...generateResponses('survey-1', 234),
  ...generateResponses('survey-2', 189),
  ...generateResponses('survey-3', 156),
  ...generateResponses('survey-5', 98),
  ...generateResponses('survey-7', 67),
];

// Generate sample answers for analytics
export const mockAnswers: Answer[] = [
  // Sample answers for survey-1, question 1 (employment status)
  ...Array.from({ length: 150 }, (_, i) => ({
    id: `answer-1-${i}`,
    response_id: `response-survey-1-${i}`,
    question_id: 'q1-1',
    selected_option_ids: [i % 4 === 0 ? 'opt1-1' : i % 4 === 1 ? 'opt1-2' : i % 4 === 2 ? 'opt1-3' : 'opt1-4'],
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  })),
  
  // Sample answers for survey-1, question 2 (satisfaction scale)
  ...Array.from({ length: 150 }, (_, i) => ({
    id: `answer-2-${i}`,
    response_id: `response-survey-1-${i}`,
    question_id: 'q1-2',
    selected_option_ids: [
      i % 5 === 0 ? 'opt2-1' : 
      i % 5 === 1 ? 'opt2-2' : 
      i % 5 === 2 ? 'opt2-3' : 
      i % 5 === 3 ? 'opt2-4' : 'opt2-5'
    ],
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  })),
  
  // Sample answers for survey-1, question 3 (healthcare services - multiple choice)
  ...Array.from({ length: 150 }, (_, i) => ({
    id: `answer-3-${i}`,
    response_id: `response-survey-1-${i}`,
    question_id: 'q1-3',
    selected_option_ids: [
      'opt3-1',
      ...(Math.random() > 0.5 ? ['opt3-2'] : []),
      ...(Math.random() > 0.7 ? ['opt3-3'] : []),
      ...(Math.random() > 0.3 ? ['opt3-4'] : []),
      ...(Math.random() > 0.6 ? ['opt3-5'] : []),
      ...(Math.random() > 0.2 ? ['opt3-7'] : []),
    ],
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  })),
  
  // Sample answers for survey-1, question 4 (annual spending)
  ...Array.from({ length: 150 }, (_, i) => ({
    id: `answer-4-${i}`,
    response_id: `response-survey-1-${i}`,
    question_id: 'q1-4',
    answer_number: Math.floor(Math.random() * 10000) + 500,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  })),
  
  // Sample answers for survey-1, question 5 (text response)
  ...Array.from({ length: 75 }, (_, i) => ({
    id: `answer-5-${i}`,
    response_id: `response-survey-1-${i}`,
    question_id: 'q1-5',
    answer_text: [
      'High deductibles make it difficult to afford care',
      'Limited network of specialists in my area',
      'Prescription costs are too high',
      'Prior authorization delays are frustrating',
      'Coverage for mental health services is inadequate',
    ][i % 5],
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  })),
];

// Analytics aggregation helper
export function getResponseStats(surveyId: string) {
  const surveyResponses = mockResponses.filter(r => r.survey_id === surveyId);
  const completed = surveyResponses.filter(r => r.status === 'completed').length;
  const inProgress = surveyResponses.filter(r => r.status === 'in_progress').length;
  
  return {
    total: surveyResponses.length,
    completed,
    inProgress,
    completionRate: surveyResponses.length > 0 
      ? Math.round((completed / surveyResponses.length) * 100) 
      : 0,
  };
}

// Get response trend data for charts
export function getResponseTrend() {
  const trend: { date: string; count: number }[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const count = mockResponses.filter(r => {
      const responseDate = new Date(r.started_at).toISOString().split('T')[0];
      return responseDate === dateStr;
    }).length;
    
    trend.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: count || Math.floor(Math.random() * 20) + 5, // Add some random data for dates with no responses
    });
  }
  
  return trend;
}