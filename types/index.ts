export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
  start_date?: string;
  end_date?: string;
}

export interface Question {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'date' | 'scale';
  required: boolean;
  order: number;
  options?: string[];
  help_text?: string;
  scale_min?: number;
  scale_max?: number;
  scale_label_min?: string;
  scale_label_max?: string;
  validation_rules?: ValidationRule[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  order: number;
}

export interface Response {
  id: string;
  survey_id: string;
  respondent_id?: string;
  respondent_email?: string;
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at?: string;
  completion_percentage?: number;
}

export interface Answer {
  id: string;
  response_id: string;
  question_id: string;
  survey_id: string;
  answer_value?: string;
  answer_text?: string;
  answer_number?: number;
  answer_date?: string;
  selected_option_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'custom';
  value: any;
  message: string;
}

export interface Analytics {
  survey_id: string;
  total_responses: number;
  completion_rate: number;
  average_completion_time: number;
  response_trend: Array<{
    date: string;
    count: number;
  }>;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}