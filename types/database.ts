export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          organization: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          organization?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          organization?: string | null;
          updated_at?: string;
        };
      };
      surveys: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: 'draft' | 'active' | 'completed' | 'archived';
          created_by: string;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'completed' | 'archived';
          created_by: string;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'completed' | 'archived';
          start_date?: string | null;
          end_date?: string | null;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          survey_id: string;
          question_text: string;
          question_type: 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'date' | 'scale';
          required: boolean;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          survey_id: string;
          question_text: string;
          question_type: 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'date' | 'scale';
          required?: boolean;
          order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          question_text?: string;
          question_type?: 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'date' | 'scale';
          required?: boolean;
          order?: number;
          updated_at?: string;
        };
      };
      question_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_text: string;
          order: number;
          created_at?: string;
        };
        Update: {
          option_text?: string;
          order?: number;
        };
      };
      responses: {
        Row: {
          id: string;
          survey_id: string;
          respondent_id: string | null;
          respondent_email: string | null;
          status: 'in_progress' | 'completed';
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          survey_id: string;
          respondent_id?: string | null;
          respondent_email?: string | null;
          status?: 'in_progress' | 'completed';
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          status?: 'in_progress' | 'completed';
          completed_at?: string | null;
        };
      };
      answers: {
        Row: {
          id: string;
          response_id: string;
          question_id: string;
          answer_text: string | null;
          answer_number: number | null;
          answer_date: string | null;
          selected_option_ids: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          response_id: string;
          question_id: string;
          answer_text?: string | null;
          answer_number?: number | null;
          answer_date?: string | null;
          selected_option_ids?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          answer_text?: string | null;
          answer_number?: number | null;
          answer_date?: string | null;
          selected_option_ids?: string[] | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
    };
  };
}