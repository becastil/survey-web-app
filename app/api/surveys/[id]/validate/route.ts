import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SurveyData, MedicalPlan, DentalPlan, RateTier } from '@/types/survey';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'range' | 'logic';
}

function validateSurveyData(data: Partial<SurveyData>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate General Information
  if (data.generalInformation) {
    const gi = data.generalInformation;

    if (!gi.organizationName?.trim()) {
      errors.push({ field: 'generalInformation.organizationName', message: 'Organization name is required', type: 'required' });
    }

    if (!gi.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push({ field: 'generalInformation.email', message: 'Valid email is required', type: 'format' });
    }

    if (gi.employeeCount && gi.employeeCount < 0) {
      errors.push({ field: 'generalInformation.employeeCount', message: 'Employee count must be positive', type: 'range' });
    }

    if (gi.eligibleEmployees && gi.employeeCount && gi.eligibleEmployees > gi.employeeCount) {
      errors.push({ field: 'generalInformation.eligibleEmployees', message: 'Eligible employees cannot exceed total employees', type: 'logic' });
    }
  }

  // Validate Medical Plans
  if (data.medicalPlans && data.medicalPlans.length > 0) {
    data.medicalPlans.forEach((plan: MedicalPlan, index: number) => {
      if (!plan.planName?.trim()) {
        errors.push({ field: `medicalPlans[${index}].planName`, message: 'Plan name is required', type: 'required' });
      }

      if (!plan.carrier?.trim()) {
        errors.push({ field: `medicalPlans[${index}].carrier`, message: 'Carrier is required', type: 'required' });
      }

      if (plan.rateTiers) {
        let totalEmployerContribution = 0;
        let totalEmployeeContribution = 0;

        plan.rateTiers.forEach((tier: RateTier, tierIndex: number) => {
          if (tier.monthlyPremium <= 0) {
            errors.push({ field: `medicalPlans[${index}].rateTiers[${tierIndex}].monthlyPremium`, message: 'Monthly premium must be positive', type: 'range' });
          }

          if (tier.employerContribution + tier.employeeContribution !== tier.monthlyPremium) {
            errors.push({ field: `medicalPlans[${index}].rateTiers[${tierIndex}]`, message: 'Employer + Employee contribution must equal monthly premium', type: 'logic' });
          }

          totalEmployerContribution += tier.employerContribution;
          totalEmployeeContribution += tier.employeeContribution;
        });
      }

      if (plan.planDesign) {
        const pd = plan.planDesign;

        if (pd.deductible && pd.deductible.family < pd.deductible.individual) {
          errors.push({ field: `medicalPlans[${index}].planDesign.deductible`, message: 'Family deductible must be >= individual deductible', type: 'logic' });
        }

        if (pd.outOfPocketMax && pd.outOfPocketMax.family < pd.outOfPocketMax.individual) {
          errors.push({ field: `medicalPlans[${index}].planDesign.outOfPocketMax`, message: 'Family out-of-pocket max must be >= individual max', type: 'logic' });
        }
      }
    });
  }

  // Validate Dental Plans
  if (data.dentalPlans && data.dentalPlans.length > 0) {
    data.dentalPlans.forEach((plan: DentalPlan, index: number) => {
      if (!plan.planName?.trim()) {
        errors.push({ field: `dentalPlans[${index}].planName`, message: 'Plan name is required', type: 'required' });
      }

      if (plan.planDesign) {
        const coverage = plan.planDesign.coverage;

        if (coverage.preventive < 0 || coverage.preventive > 100) {
          errors.push({ field: `dentalPlans[${index}].planDesign.coverage.preventive`, message: 'Coverage percentage must be between 0 and 100', type: 'range' });
        }

        if (coverage.basic < 0 || coverage.basic > 100) {
          errors.push({ field: `dentalPlans[${index}].planDesign.coverage.basic`, message: 'Coverage percentage must be between 0 and 100', type: 'range' });
        }

        if (coverage.major < 0 || coverage.major > 100) {
          errors.push({ field: `dentalPlans[${index}].planDesign.coverage.major`, message: 'Coverage percentage must be between 0 and 100', type: 'range' });
        }
      }
    });
  }

  // Validate Retirement
  if (data.retirement) {
    const ret = data.retirement;

    if (ret.plan401k?.offered && ret.plan401k.employerMatch?.provided && !ret.plan401k.employerMatch.formula) {
      errors.push({ field: 'retirement.plan401k.employerMatch.formula', message: 'Employer match formula is required when match is provided', type: 'required' });
    }
  }

  // Validate Time Off
  if (data.timeOff) {
    const to = data.timeOff;

    if (to.paidTimeOff?.offered && to.paidTimeOff.structure === 'accrual' && (!to.paidTimeOff.accrualRates || to.paidTimeOff.accrualRates.length === 0)) {
      errors.push({ field: 'timeOff.paidTimeOff.accrualRates', message: 'Accrual rates are required when using accrual structure', type: 'required' });
    }
  }

  return errors;
}

// POST /api/surveys/[id]/validate - Validate survey data
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    // Get survey
    const { data: survey, error: surveyError } = await supabase
      .from('survey_responses')
      .select('data')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (surveyError) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    // Validate survey data
    const validationErrors = validateSurveyData(survey.data);

    // Store validation errors in database
    if (validationErrors.length > 0) {
      // Clear previous unresolved validations
      await supabase
        .from('survey_validations')
        .delete()
        .eq('survey_response_id', id)
        .eq('resolved', false);

      // Insert new validation errors
      const validationRecords = validationErrors.map(error => ({
        survey_response_id: id,
        field_path: error.field,
        error_type: error.type,
        error_message: error.message
      }));

      await supabase
        .from('survey_validations')
        .insert(validationRecords);
    }

    return NextResponse.json({
      valid: validationErrors.length === 0,
      errors: validationErrors,
      errorCount: validationErrors.length
    });
  } catch (error) {
    console.error('Error validating survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
