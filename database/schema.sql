-- Keenan Healthcare Benefits Survey Database Schema
-- PostgreSQL/Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations Table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey Responses Table
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted')),
  progress NUMERIC(5,2) DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT progress_valid CHECK (
    (status = 'completed' AND progress = 100) OR
    (status != 'completed')
  )
);

-- Auto-save snapshots for recovery
CREATE TABLE survey_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey validation errors log
CREATE TABLE survey_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  field_path TEXT NOT NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Survey exports/submissions tracking
CREATE TABLE survey_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  export_format TEXT NOT NULL CHECK (export_format IN ('json', 'csv', 'pdf', 'excel')),
  file_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_survey_responses_org ON survey_responses(organization_id);
CREATE INDEX idx_survey_responses_user ON survey_responses(user_id);
CREATE INDEX idx_survey_responses_status ON survey_responses(status);
CREATE INDEX idx_survey_responses_updated ON survey_responses(updated_at DESC);
CREATE INDEX idx_survey_snapshots_response ON survey_snapshots(survey_response_id);
CREATE INDEX idx_survey_snapshots_created ON survey_snapshots(created_at DESC);
CREATE INDEX idx_survey_validations_response ON survey_validations(survey_response_id);
CREATE INDEX idx_survey_validations_unresolved ON survey_validations(survey_response_id) WHERE resolved = FALSE;

-- JSONB indexes for efficient querying of survey data
CREATE INDEX idx_survey_data_general_info ON survey_responses USING gin ((data->'generalInformation'));
CREATE INDEX idx_survey_data_medical ON survey_responses USING gin ((data->'medicalPlans'));
CREATE INDEX idx_survey_data_dental ON survey_responses USING gin ((data->'dentalPlans'));

-- Triggers for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_responses_updated_at
  BEFORE UPDATE ON survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate survey progress based on completed fields
CREATE OR REPLACE FUNCTION calculate_survey_progress(survey_data JSONB)
RETURNS NUMERIC AS $$
DECLARE
  total_fields INTEGER := 0;
  completed_fields INTEGER := 0;
  section_key TEXT;
  section_data JSONB;
BEGIN
  -- Count completed fields in each section
  FOR section_key, section_data IN SELECT * FROM jsonb_each(survey_data)
  LOOP
    IF section_data IS NOT NULL AND section_data::text != 'null' AND section_data::text != '{}' THEN
      completed_fields := completed_fields + 1;
    END IF;
    total_fields := total_fields + 1;
  END LOOP;

  IF total_fields = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND((completed_fields::NUMERIC / total_fields::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update progress when data changes
CREATE OR REPLACE FUNCTION auto_update_progress()
RETURNS TRIGGER AS $$
BEGIN
  NEW.progress := calculate_survey_progress(NEW.data);

  -- Auto-update status based on progress
  IF NEW.progress = 100 AND NEW.status = 'in_progress' THEN
    NEW.status := 'completed';
  ELSIF NEW.progress > 0 AND NEW.status = 'draft' THEN
    NEW.status := 'in_progress';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_update_progress
  BEFORE INSERT OR UPDATE OF data ON survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_progress();

-- Auto-snapshot creation for important changes
CREATE OR REPLACE FUNCTION create_auto_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Create snapshot on significant progress milestones
  IF (NEW.progress - OLD.progress) >= 10 OR NEW.status != OLD.status THEN
    INSERT INTO survey_snapshots (survey_response_id, snapshot_data)
    VALUES (NEW.id, NEW.data);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_auto_snapshot
  AFTER UPDATE OF data, status ON survey_responses
  FOR EACH ROW
  WHEN (OLD.data IS DISTINCT FROM NEW.data OR OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION create_auto_snapshot();

-- Row Level Security (RLS) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_exports ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Users: Can view users in their organization
CREATE POLICY "Users can view org members"
  ON users FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Survey Responses: Users can manage their own organization's surveys
CREATE POLICY "Users can view own org surveys"
  ON survey_responses FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert own org surveys"
  ON survey_responses FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own org surveys"
  ON survey_responses FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete surveys"
  ON survey_responses FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Survey Snapshots: Users can view snapshots of their org's surveys
CREATE POLICY "Users can view own org snapshots"
  ON survey_snapshots FOR SELECT
  USING (survey_response_id IN (
    SELECT id FROM survey_responses WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

-- Survey Validations: Users can view validations for their org's surveys
CREATE POLICY "Users can view own org validations"
  ON survey_validations FOR SELECT
  USING (survey_response_id IN (
    SELECT id FROM survey_responses WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

-- Survey Exports: Users can view and create exports for their org
CREATE POLICY "Users can view own org exports"
  ON survey_exports FOR SELECT
  USING (survey_response_id IN (
    SELECT id FROM survey_responses WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can create exports"
  ON survey_exports FOR INSERT
  WITH CHECK (survey_response_id IN (
    SELECT id FROM survey_responses WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

-- Seed data for testing (optional)
-- INSERT INTO organizations (name) VALUES ('Test Organization');
