// Survey System Type Definitions

export type QuestionType = 
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'scale'
  | 'matrix'
  | 'email'
  | 'phone'
  | 'currency'
  | 'percentage';

export interface SurveyQuestion {
  id: string;
  surveyId: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  section?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
  options?: Array<{
    value: string;
    label: string;
  }>;
  conditionalLogic?: {
    showIf: {
      questionId: string;
      operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
      value: any;
    }[];
  };
  metadata?: Record<string, any>;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  year: number;
  status: 'draft' | 'active' | 'closed' | 'archived';
  template?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  settings: {
    allowSaveDraft: boolean;
    requireAuthentication: boolean;
    showProgressBar: boolean;
    randomizeQuestions: boolean;
    allowMultipleSubmissions: boolean;
    notificationEmail?: string;
  };
  questions: SurveyQuestion[];
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  clientId: string;
  organizationId: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'validated';
  startedAt: Date;
  submittedAt?: Date;
  completionPercentage: number;
  answers: SurveyAnswer[];
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    timeSpent?: number;
  };
}

export interface SurveyAnswer {
  id: string;
  responseId: string;
  questionId: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  employeeCount?: number;
  revenue?: number;
  location: {
    city?: string;
    state?: string;
    country: string;
    region: string;
  };
  contactEmail: string;
  settings?: {
    branding?: {
      primaryColor?: string;
      logo?: string;
    };
  };
  createdAt: Date;
}

export interface AggregatedData {
  surveyId: string;
  questionId: string;
  aggregationType: 'mean' | 'median' | 'mode' | 'sum' | 'count' | 'distribution';
  value: any;
  breakdown?: {
    byIndustry?: Record<string, any>;
    bySize?: Record<string, any>;
    byRegion?: Record<string, any>;
  };
  benchmarks?: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    industry?: number;
    topPerformers?: number;
  };
}