import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SurveyData } from '@/types/survey';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/surveys/import - Import survey data from JSON
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data: surveyData, createNew = true } = body;

    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate survey data structure
    const validationErrors = validateImportData(surveyData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid survey data structure',
          validationErrors
        },
        { status: 400 }
      );
    }

    if (createNew) {
      // Create new survey with imported data
      const { data, error } = await supabase
        .from('survey_responses')
        .insert([
          {
            organization_id: userData.organization_id,
            user_id: user.id,
            status: 'draft',
            data: surveyData
          }
        ])
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        {
          message: 'Survey imported successfully',
          survey: data
        },
        { status: 201 }
      );
    } else {
      // Return validated data for user to review before saving
      return NextResponse.json({
        message: 'Survey data validated successfully',
        data: surveyData,
        validationErrors
      });
    }
  } catch (error) {
    console.error('Error importing survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateImportData(data: any): string[] {
  const errors: string[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push('Survey data must be an object');
    return errors;
  }

  // Validate structure
  const expectedSections = [
    'generalInformation',
    'medicalPlans',
    'dentalPlans',
    'visionPlans',
    'basicLifeDisability',
    'retirement',
    'timeOff',
    'benefitsStrategy',
    'voluntaryBenefits',
    'bestPractices'
  ];

  // Check if at least one section exists
  const hasAnySections = expectedSections.some(section => section in data);
  if (!hasAnySections) {
    errors.push('Survey data must contain at least one valid section');
  }

  // Validate General Information if present
  if (data.generalInformation) {
    if (typeof data.generalInformation !== 'object') {
      errors.push('generalInformation must be an object');
    } else {
      if (data.generalInformation.email && !isValidEmail(data.generalInformation.email)) {
        errors.push('generalInformation.email must be a valid email address');
      }

      if (data.generalInformation.employeeCount !== undefined) {
        if (typeof data.generalInformation.employeeCount !== 'number' || data.generalInformation.employeeCount < 0) {
          errors.push('generalInformation.employeeCount must be a non-negative number');
        }
      }
    }
  }

  // Validate Medical Plans if present
  if (data.medicalPlans) {
    if (!Array.isArray(data.medicalPlans)) {
      errors.push('medicalPlans must be an array');
    } else {
      data.medicalPlans.forEach((plan: any, index: number) => {
        if (!plan.planName) {
          errors.push(`medicalPlans[${index}].planName is required`);
        }
        if (!plan.carrier) {
          errors.push(`medicalPlans[${index}].carrier is required`);
        }
        if (plan.rateTiers && !Array.isArray(plan.rateTiers)) {
          errors.push(`medicalPlans[${index}].rateTiers must be an array`);
        }
      });
    }
  }

  // Validate Dental Plans if present
  if (data.dentalPlans) {
    if (!Array.isArray(data.dentalPlans)) {
      errors.push('dentalPlans must be an array');
    } else {
      data.dentalPlans.forEach((plan: any, index: number) => {
        if (!plan.planName) {
          errors.push(`dentalPlans[${index}].planName is required`);
        }
        if (!plan.carrier) {
          errors.push(`dentalPlans[${index}].carrier is required`);
        }
      });
    }
  }

  // Validate Vision Plans if present
  if (data.visionPlans) {
    if (!Array.isArray(data.visionPlans)) {
      errors.push('visionPlans must be an array');
    }
  }

  return errors;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
