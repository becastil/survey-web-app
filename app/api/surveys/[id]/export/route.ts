import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import type { SurveyData, MedicalPlan, DentalPlan, VisionPlan } from '@/types/survey';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function flattenSurveyData(data: Partial<SurveyData>): Record<string, any>[] {
  const rows: Record<string, any>[] = [];

  // General Information
  if (data.generalInformation) {
    rows.push({
      Section: 'General Information',
      Field: 'Organization Name',
      Value: data.generalInformation.organizationName || ''
    });
    rows.push({
      Section: 'General Information',
      Field: 'Contact Person',
      Value: data.generalInformation.contactPerson || ''
    });
    rows.push({
      Section: 'General Information',
      Field: 'Email',
      Value: data.generalInformation.email || ''
    });
    rows.push({
      Section: 'General Information',
      Field: 'Phone',
      Value: data.generalInformation.phone || ''
    });
    rows.push({
      Section: 'General Information',
      Field: 'Employee Count',
      Value: data.generalInformation.employeeCount || ''
    });
  }

  // Medical Plans
  if (data.medicalPlans) {
    data.medicalPlans.forEach((plan: MedicalPlan, index: number) => {
      rows.push({
        Section: `Medical Plan ${index + 1}`,
        Field: 'Plan Name',
        Value: plan.planName || ''
      });
      rows.push({
        Section: `Medical Plan ${index + 1}`,
        Field: 'Carrier',
        Value: plan.carrier || ''
      });
      rows.push({
        Section: `Medical Plan ${index + 1}`,
        Field: 'Plan Type',
        Value: plan.planType || ''
      });
      rows.push({
        Section: `Medical Plan ${index + 1}`,
        Field: 'Enrolled Employees',
        Value: plan.enrolledEmployees || ''
      });

      if (plan.planDesign) {
        rows.push({
          Section: `Medical Plan ${index + 1}`,
          Field: 'Individual Deductible',
          Value: plan.planDesign.deductible?.individual || ''
        });
        rows.push({
          Section: `Medical Plan ${index + 1}`,
          Field: 'Family Deductible',
          Value: plan.planDesign.deductible?.family || ''
        });
      }
    });
  }

  // Dental Plans
  if (data.dentalPlans) {
    data.dentalPlans.forEach((plan: DentalPlan, index: number) => {
      rows.push({
        Section: `Dental Plan ${index + 1}`,
        Field: 'Plan Name',
        Value: plan.planName || ''
      });
      rows.push({
        Section: `Dental Plan ${index + 1}`,
        Field: 'Carrier',
        Value: plan.carrier || ''
      });
      rows.push({
        Section: `Dental Plan ${index + 1}`,
        Field: 'Plan Type',
        Value: plan.planType || ''
      });
    });
  }

  // Vision Plans
  if (data.visionPlans) {
    data.visionPlans.forEach((plan: VisionPlan, index: number) => {
      rows.push({
        Section: `Vision Plan ${index + 1}`,
        Field: 'Plan Name',
        Value: plan.planName || ''
      });
      rows.push({
        Section: `Vision Plan ${index + 1}`,
        Field: 'Carrier',
        Value: plan.carrier || ''
      });
    });
  }

  // Additional sections can be added similarly...

  return rows;
}

// GET /api/surveys/[id]/export?format=json|csv|excel
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

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
      .select('*')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (surveyError) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    // Log export
    await supabase.from('survey_exports').insert([
      {
        survey_response_id: id,
        export_format: format,
        created_by: user.id
      }
    ]);

    // Generate export based on format
    if (format === 'json') {
      return NextResponse.json(survey.data, {
        headers: {
          'Content-Disposition': `attachment; filename="survey-${id}.json"`,
          'Content-Type': 'application/json'
        }
      });
    }

    if (format === 'csv') {
      const flatData = flattenSurveyData(survey.data);
      const csv = Papa.unparse(flatData);

      return new NextResponse(csv, {
        headers: {
          'Content-Disposition': `attachment; filename="survey-${id}.csv"`,
          'Content-Type': 'text/csv'
        }
      });
    }

    if (format === 'excel') {
      // For Excel, we'll return CSV for now (can be enhanced with xlsx library)
      const flatData = flattenSurveyData(survey.data);
      const csv = Papa.unparse(flatData);

      return new NextResponse(csv, {
        headers: {
          'Content-Disposition': `attachment; filename="survey-${id}.xlsx"`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
