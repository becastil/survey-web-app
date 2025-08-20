-- Healthcare Survey Application Database Schema
-- Version: 1.0.0
-- Description: Initial schema with RLS, indexes, and triggers

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'analyst', 'viewer');
CREATE TYPE survey_status AS ENUM ('draft', 'published', 'closed', 'archived');
CREATE TYPE question_type AS ENUM (
    'text',
    'textarea',
    'number',
    'select',
    'multi_select',
    'radio',
    'checkbox',
    'date',
    'datetime',
    'rating',
    'scale',
    'boolean'
);
CREATE TYPE response_status AS ENUM ('in_progress', 'completed', 'abandoned');

-- ==============================================
-- PROFILES TABLE
-- ==============================================
-- Extends Supabase auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'viewer',
    full_name TEXT NOT NULL,
    organization TEXT,
    department TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT profiles_full_name_check CHECK (char_length(full_name) >= 2),
    CONSTRAINT profiles_phone_check CHECK (phone ~ '^\+?[1-9]\d{1,14}$' OR phone IS NULL)
);

-- Create index for profiles
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_organization ON public.profiles(organization) WHERE organization IS NOT NULL;
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- ==============================================
-- SURVEYS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    status survey_status NOT NULL DEFAULT 'draft',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_anonymous BOOLEAN DEFAULT false,
    requires_authentication BOOLEAN DEFAULT true,
    max_responses_per_user INTEGER DEFAULT 1,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT surveys_title_check CHECK (char_length(title) >= 3),
    CONSTRAINT surveys_date_check CHECK (
        (start_date IS NULL AND end_date IS NULL) OR
        (start_date IS NOT NULL AND end_date IS NOT NULL AND end_date > start_date) OR
        (start_date IS NOT NULL AND end_date IS NULL)
    ),
    CONSTRAINT surveys_max_responses_check CHECK (max_responses_per_user > 0)
);

-- Create indexes for surveys
CREATE INDEX idx_surveys_created_by ON public.surveys(created_by);
CREATE INDEX idx_surveys_status ON public.surveys(status);
CREATE INDEX idx_surveys_start_date ON public.surveys(start_date) WHERE start_date IS NOT NULL;
CREATE INDEX idx_surveys_end_date ON public.surveys(end_date) WHERE end_date IS NOT NULL;
CREATE INDEX idx_surveys_tags ON public.surveys USING GIN(tags) WHERE tags IS NOT NULL;
CREATE INDEX idx_surveys_created_at ON public.surveys(created_at DESC);

-- ==============================================
-- QUESTIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER NOT NULL,
    section TEXT,
    validation_rules JSONB DEFAULT '{}',
    conditional_logic JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT questions_text_check CHECK (char_length(question_text) >= 3),
    CONSTRAINT questions_order_check CHECK (display_order >= 0),
    CONSTRAINT questions_unique_order UNIQUE(survey_id, display_order)
);

-- Create indexes for questions
CREATE INDEX idx_questions_survey_id ON public.questions(survey_id);
CREATE INDEX idx_questions_display_order ON public.questions(survey_id, display_order);
CREATE INDEX idx_questions_type ON public.questions(question_type);
CREATE INDEX idx_questions_is_required ON public.questions(is_required) WHERE is_required = true;
CREATE INDEX idx_questions_section ON public.questions(section) WHERE section IS NOT NULL;

-- ==============================================
-- QUESTION_OPTIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_value TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    is_other BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT options_text_check CHECK (char_length(option_text) >= 1),
    CONSTRAINT options_order_check CHECK (display_order >= 0),
    CONSTRAINT options_unique_order UNIQUE(question_id, display_order)
);

-- Create indexes for question_options
CREATE INDEX idx_question_options_question_id ON public.question_options(question_id);
CREATE INDEX idx_question_options_display_order ON public.question_options(question_id, display_order);

-- ==============================================
-- RESPONSES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    respondent_id UUID REFERENCES public.profiles(id),
    respondent_email TEXT,
    respondent_name TEXT,
    status response_status NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT responses_email_check CHECK (
        respondent_email IS NULL OR 
        respondent_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT responses_completed_check CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR
        (status != 'completed' AND completed_at IS NULL)
    )
);

-- Create indexes for responses
CREATE INDEX idx_responses_survey_id ON public.responses(survey_id);
CREATE INDEX idx_responses_respondent_id ON public.responses(respondent_id) WHERE respondent_id IS NOT NULL;
CREATE INDEX idx_responses_status ON public.responses(status);
CREATE INDEX idx_responses_started_at ON public.responses(started_at DESC);
CREATE INDEX idx_responses_completed_at ON public.responses(completed_at DESC) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_responses_survey_status ON public.responses(survey_id, status);

-- ==============================================
-- ANSWERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    -- Different answer types
    text_answer TEXT,
    number_answer NUMERIC,
    boolean_answer BOOLEAN,
    date_answer DATE,
    datetime_answer TIMESTAMPTZ,
    selected_option_id UUID REFERENCES public.question_options(id),
    selected_option_ids UUID[],
    json_answer JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT answers_unique_response_question UNIQUE(response_id, question_id),
    CONSTRAINT answers_value_check CHECK (
        -- At least one answer field must be non-null
        text_answer IS NOT NULL OR
        number_answer IS NOT NULL OR
        boolean_answer IS NOT NULL OR
        date_answer IS NOT NULL OR
        datetime_answer IS NOT NULL OR
        selected_option_id IS NOT NULL OR
        selected_option_ids IS NOT NULL OR
        json_answer IS NOT NULL
    )
);

-- Create indexes for answers
CREATE INDEX idx_answers_response_id ON public.answers(response_id);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);
CREATE INDEX idx_answers_response_question ON public.answers(response_id, question_id);
CREATE INDEX idx_answers_selected_option_id ON public.answers(selected_option_id) WHERE selected_option_id IS NOT NULL;
CREATE INDEX idx_answers_selected_option_ids ON public.answers USING GIN(selected_option_ids) WHERE selected_option_ids IS NOT NULL;

-- ==============================================
-- AUDIT LOG TABLE (Optional but recommended)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit_logs
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ==============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.surveys
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_question_options_updated_at BEFORE UPDATE ON public.question_options
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON public.responses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON public.answers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PROFILES RLS POLICIES
-- ==============================================

-- Admin: Full CRUD
CREATE POLICY profiles_admin_all ON public.profiles
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Analyst: Read all profiles
CREATE POLICY profiles_analyst_read ON public.profiles
    FOR SELECT USING (get_user_role(auth.uid()) = 'analyst');

-- Viewer: Read all profiles
CREATE POLICY profiles_viewer_read ON public.profiles
    FOR SELECT USING (get_user_role(auth.uid()) = 'viewer');

-- Users can read their own profile
CREATE POLICY profiles_own_read ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY profiles_own_update ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ==============================================
-- SURVEYS RLS POLICIES
-- ==============================================

-- Admin: Full CRUD
CREATE POLICY surveys_admin_all ON public.surveys
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Analyst: Read all surveys
CREATE POLICY surveys_analyst_read ON public.surveys
    FOR SELECT USING (get_user_role(auth.uid()) = 'analyst');

-- Analyst: Create surveys
CREATE POLICY surveys_analyst_create ON public.surveys
    FOR INSERT WITH CHECK (
        get_user_role(auth.uid()) = 'analyst' AND
        created_by = auth.uid()
    );

-- Analyst: Update own surveys
CREATE POLICY surveys_analyst_update ON public.surveys
    FOR UPDATE USING (
        get_user_role(auth.uid()) = 'analyst' AND
        created_by = auth.uid()
    );

-- Analyst: Delete own draft surveys
CREATE POLICY surveys_analyst_delete ON public.surveys
    FOR DELETE USING (
        get_user_role(auth.uid()) = 'analyst' AND
        created_by = auth.uid() AND
        status = 'draft'
    );

-- Viewer: Read published surveys
CREATE POLICY surveys_viewer_read ON public.surveys
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'viewer' AND
        status IN ('published', 'closed')
    );

-- Public: Read published surveys (for anonymous responses)
CREATE POLICY surveys_public_read ON public.surveys
    FOR SELECT USING (
        status = 'published' AND
        is_anonymous = true AND
        requires_authentication = false
    );

-- ==============================================
-- QUESTIONS RLS POLICIES
-- ==============================================

-- Admin: Full CRUD
CREATE POLICY questions_admin_all ON public.questions
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Analyst: Read all questions
CREATE POLICY questions_analyst_read ON public.questions
    FOR SELECT USING (get_user_role(auth.uid()) = 'analyst');

-- Analyst: Manage questions for own surveys
CREATE POLICY questions_analyst_manage ON public.questions
    FOR ALL USING (
        get_user_role(auth.uid()) = 'analyst' AND
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = questions.survey_id
            AND surveys.created_by = auth.uid()
        )
    );

-- Viewer: Read questions for published surveys
CREATE POLICY questions_viewer_read ON public.questions
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'viewer' AND
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = questions.survey_id
            AND surveys.status IN ('published', 'closed')
        )
    );

-- Public: Read questions for public surveys
CREATE POLICY questions_public_read ON public.questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = questions.survey_id
            AND surveys.status = 'published'
            AND surveys.is_anonymous = true
            AND surveys.requires_authentication = false
        )
    );

-- ==============================================
-- QUESTION_OPTIONS RLS POLICIES
-- ==============================================

-- Admin: Full CRUD
CREATE POLICY question_options_admin_all ON public.question_options
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Analyst: Read all options
CREATE POLICY question_options_analyst_read ON public.question_options
    FOR SELECT USING (get_user_role(auth.uid()) = 'analyst');

-- Analyst: Manage options for own survey questions
CREATE POLICY question_options_analyst_manage ON public.question_options
    FOR ALL USING (
        get_user_role(auth.uid()) = 'analyst' AND
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.surveys s ON s.id = q.survey_id
            WHERE q.id = question_options.question_id
            AND s.created_by = auth.uid()
        )
    );

-- Viewer: Read options for published surveys
CREATE POLICY question_options_viewer_read ON public.question_options
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'viewer' AND
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.surveys s ON s.id = q.survey_id
            WHERE q.id = question_options.question_id
            AND s.status IN ('published', 'closed')
        )
    );

-- Public: Read options for public surveys
CREATE POLICY question_options_public_read ON public.question_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.surveys s ON s.id = q.survey_id
            WHERE q.id = question_options.question_id
            AND s.status = 'published'
            AND s.is_anonymous = true
            AND s.requires_authentication = false
        )
    );

-- ==============================================
-- RESPONSES RLS POLICIES
-- ==============================================

-- Admin: Full CRUD
CREATE POLICY responses_admin_all ON public.responses
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Analyst: Read all responses
CREATE POLICY responses_analyst_read ON public.responses
    FOR SELECT USING (get_user_role(auth.uid()) = 'analyst');

-- Analyst: Manage responses for own surveys
CREATE POLICY responses_analyst_manage ON public.responses
    FOR ALL USING (
        get_user_role(auth.uid()) = 'analyst' AND
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = responses.survey_id
            AND surveys.created_by = auth.uid()
        )
    );

-- Viewer: Read responses for published surveys
CREATE POLICY responses_viewer_read ON public.responses
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'viewer' AND
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = responses.survey_id
            AND surveys.status IN ('published', 'closed')
        )
    );

-- Users can create responses for published surveys
CREATE POLICY responses_user_create ON public.responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = survey_id
            AND surveys.status = 'published'
            AND (
                surveys.requires_authentication = false OR
                auth.uid() IS NOT NULL
            )
        )
    );

-- Users can read and update their own responses
CREATE POLICY responses_own_read ON public.responses
    FOR SELECT USING (respondent_id = auth.uid());

CREATE POLICY responses_own_update ON public.responses
    FOR UPDATE USING (respondent_id = auth.uid())
    WITH CHECK (respondent_id = auth.uid());

-- ==============================================
-- ANSWERS RLS POLICIES
-- ==============================================

-- Admin: Full CRUD
CREATE POLICY answers_admin_all ON public.answers
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Analyst: Read all answers
CREATE POLICY answers_analyst_read ON public.answers
    FOR SELECT USING (get_user_role(auth.uid()) = 'analyst');

-- Analyst: Manage answers for own surveys
CREATE POLICY answers_analyst_manage ON public.answers
    FOR ALL USING (
        get_user_role(auth.uid()) = 'analyst' AND
        EXISTS (
            SELECT 1 FROM public.responses r
            JOIN public.surveys s ON s.id = r.survey_id
            WHERE r.id = answers.response_id
            AND s.created_by = auth.uid()
        )
    );

-- Viewer: Read answers for published surveys
CREATE POLICY answers_viewer_read ON public.answers
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'viewer' AND
        EXISTS (
            SELECT 1 FROM public.responses r
            JOIN public.surveys s ON s.id = r.survey_id
            WHERE r.id = answers.response_id
            AND s.status IN ('published', 'closed')
        )
    );

-- Users can manage answers for their own responses
CREATE POLICY answers_own_manage ON public.answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.responses
            WHERE responses.id = answers.response_id
            AND responses.respondent_id = auth.uid()
        )
    );

-- Anonymous users can create answers for their responses
CREATE POLICY answers_anonymous_create ON public.answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.responses r
            JOIN public.surveys s ON s.id = r.survey_id
            WHERE r.id = response_id
            AND s.status = 'published'
            AND s.is_anonymous = true
        )
    );

-- ==============================================
-- AUDIT_LOGS RLS POLICIES
-- ==============================================

-- Admin: Full read access
CREATE POLICY audit_logs_admin_read ON public.audit_logs
    FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- System: Allow inserts (for trigger functions)
CREATE POLICY audit_logs_system_insert ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- ==============================================
-- HELPER FUNCTIONS
-- ==============================================

-- Function to check if user can respond to survey
CREATE OR REPLACE FUNCTION public.can_user_respond_to_survey(
    p_survey_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_survey RECORD;
    v_response_count INTEGER;
BEGIN
    -- Get survey details
    SELECT * INTO v_survey
    FROM public.surveys
    WHERE id = p_survey_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if survey is published
    IF v_survey.status != 'published' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if survey requires authentication
    IF v_survey.requires_authentication AND p_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check response limit
    IF p_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_response_count
        FROM public.responses
        WHERE survey_id = p_survey_id
        AND respondent_id = p_user_id
        AND status = 'completed';
        
        IF v_response_count >= v_survey.max_responses_per_user THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Check survey dates
    IF v_survey.start_date IS NOT NULL AND NOW() < v_survey.start_date THEN
        RETURN FALSE;
    END IF;
    
    IF v_survey.end_date IS NOT NULL AND NOW() > v_survey.end_date THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get survey statistics
CREATE OR REPLACE FUNCTION public.get_survey_statistics(p_survey_id UUID)
RETURNS JSON AS $$
DECLARE
    v_stats JSON;
BEGIN
    SELECT json_build_object(
        'total_responses', COUNT(DISTINCT r.id),
        'completed_responses', COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'completed'),
        'in_progress_responses', COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'in_progress'),
        'abandoned_responses', COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'abandoned'),
        'avg_completion_time', AVG(
            EXTRACT(EPOCH FROM (r.completed_at - r.started_at))/60
        ) FILTER (WHERE r.status = 'completed'),
        'total_questions', COUNT(DISTINCT q.id),
        'required_questions', COUNT(DISTINCT q.id) FILTER (WHERE q.is_required = true)
    ) INTO v_stats
    FROM public.surveys s
    LEFT JOIN public.responses r ON r.survey_id = s.id
    LEFT JOIN public.questions q ON q.survey_id = s.id
    WHERE s.id = p_survey_id
    GROUP BY s.id;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- AUDIT TRIGGER FUNCTION
-- ==============================================

CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            user_id,
            table_name,
            record_id,
            action,
            new_data,
            ip_address
        ) VALUES (
            auth.uid(),
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            to_jsonb(NEW),
            inet_client_addr()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            user_id,
            table_name,
            record_id,
            action,
            old_data,
            new_data,
            ip_address
        ) VALUES (
            auth.uid(),
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            to_jsonb(OLD),
            to_jsonb(NEW),
            inet_client_addr()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            user_id,
            table_name,
            record_id,
            action,
            old_data,
            ip_address
        ) VALUES (
            auth.uid(),
            TG_TABLE_NAME,
            OLD.id,
            TG_OP,
            to_jsonb(OLD),
            inet_client_addr()
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to main tables (optional - enable as needed)
-- CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles
--     FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
-- 
-- CREATE TRIGGER audit_surveys AFTER INSERT OR UPDATE OR DELETE ON public.surveys
--     FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
-- 
-- CREATE TRIGGER audit_responses AFTER INSERT OR UPDATE OR DELETE ON public.responses
--     FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- ==============================================
-- SAMPLE DATA FUNCTIONS (Optional - for testing)
-- ==============================================

-- Function to create sample admin user
CREATE OR REPLACE FUNCTION public.create_sample_admin(
    p_email TEXT,
    p_full_name TEXT
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- This is a placeholder - in production, user creation happens through Supabase Auth
    -- This function would be called after user signs up
    v_user_id := gen_random_uuid();
    
    INSERT INTO public.profiles (
        id,
        role,
        full_name,
        organization
    ) VALUES (
        v_user_id,
        'admin',
        p_full_name,
        'Healthcare Organization'
    );
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- PERFORMANCE OPTIMIZATION VIEWS
-- ==============================================

-- Materialized view for survey response summary (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.survey_response_summary AS
SELECT 
    s.id as survey_id,
    s.title,
    s.status,
    s.created_by,
    COUNT(DISTINCT r.id) as total_responses,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'completed') as completed_responses,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'in_progress') as in_progress_responses,
    AVG(EXTRACT(EPOCH FROM (r.completed_at - r.started_at))/60) FILTER (WHERE r.status = 'completed') as avg_completion_minutes,
    MIN(r.started_at) as first_response_at,
    MAX(r.completed_at) as last_response_at
FROM public.surveys s
LEFT JOIN public.responses r ON r.survey_id = s.id
GROUP BY s.id, s.title, s.status, s.created_by;

CREATE INDEX idx_survey_response_summary_survey_id ON public.survey_response_summary(survey_id);
CREATE INDEX idx_survey_response_summary_created_by ON public.survey_response_summary(created_by);

-- ==============================================
-- GRANTS (Adjust based on your Supabase setup)
-- ==============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant limited permissions to anonymous users (for public surveys)
GRANT SELECT ON public.surveys TO anon;
GRANT SELECT ON public.questions TO anon;
GRANT SELECT ON public.question_options TO anon;
GRANT INSERT, SELECT ON public.responses TO anon;
GRANT INSERT, SELECT ON public.answers TO anon;

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users with role-based access control';
COMMENT ON TABLE public.surveys IS 'Survey definitions with lifecycle management and access control';
COMMENT ON TABLE public.questions IS 'Survey questions with various types and validation rules';
COMMENT ON TABLE public.question_options IS 'Options for multiple choice and select questions';
COMMENT ON TABLE public.responses IS 'Survey response sessions tracking respondent progress';
COMMENT ON TABLE public.answers IS 'Individual answers to survey questions supporting multiple data types';
COMMENT ON TABLE public.audit_logs IS 'Audit trail for all data modifications';

COMMENT ON COLUMN public.profiles.role IS 'User role determining access level: admin (full access), analyst (create/manage surveys), viewer (read-only)';
COMMENT ON COLUMN public.surveys.status IS 'Survey lifecycle: draft (editing), published (accepting responses), closed (no new responses), archived (hidden)';
COMMENT ON COLUMN public.questions.question_type IS 'Question input type determining answer format and validation';
COMMENT ON COLUMN public.questions.validation_rules IS 'JSON object with validation rules like min/max length, regex patterns, numeric ranges';
COMMENT ON COLUMN public.questions.conditional_logic IS 'JSON object defining when to show/hide question based on previous answers';
COMMENT ON COLUMN public.responses.status IS 'Response progress: in_progress (active), completed (submitted), abandoned (inactive timeout)';

-- ==============================================
-- END OF SCHEMA
-- ==============================================