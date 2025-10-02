'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { createClient } from '@supabase/supabase-js';
import { healthcareBenefitsSurvey } from '@/config/healthcareBenefitsSurvey';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useValidation } from '@/hooks/useValidation';
import { SurveyProgress } from '@/components/SurveyProgress';
import { ValidationSummary } from '@/components/ValidationFeedback';
import type { SurveyData } from '@/types/survey';

import 'survey-core/defaultV2.min.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;

  const [surveyModel, setSurveyModel] = useState<Model | null>(null);
  const [surveyData, setSurveyData] = useState<Partial<SurveyData>>({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>('');
  const [surveyStatus, setSurveyStatus] = useState<'draft' | 'in_progress' | 'completed' | 'submitted'>('draft');

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setToken(session.access_token);
      } else {
        router.push('/login');
      }
    };

    initAuth();
  }, [router]);

  // Load survey data
  useEffect(() => {
    if (!token || !surveyId) return;

    const loadSurvey = async () => {
      try {
        const response = await fetch(`/api/surveys/${surveyId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const survey = await response.json();
          setSurveyData(survey.data || {});
          setSurveyStatus(survey.status || 'draft');
        } else if (response.status === 404) {
          // Create new survey if not found
          const createResponse = await fetch('/api/surveys', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ data: {} })
          });

          if (createResponse.ok) {
            const newSurvey = await createResponse.json();
            router.replace(`/survey/${newSurvey.id}`);
          }
        }
      } catch (error) {
        console.error('Error loading survey:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSurvey();
  }, [token, surveyId, router]);

  // Initialize SurveyJS model
  useEffect(() => {
    if (!healthcareBenefitsSurvey) return;

    const model = new Model(healthcareBenefitsSurvey as any);

    // Load existing data into survey
    if (Object.keys(surveyData).length > 0) {
      model.data = surveyData;
    }

    // Configure survey settings
    model.showProgressBar = 'top';
    model.progressBarType = 'pages';
    model.showQuestionNumbers = 'off';
    model.completeText = 'Submit Survey';
    model.showPreviewBeforeComplete = 'showAnsweredQuestions';

    // Handle value changes
    model.onValueChanged.add((sender, options) => {
      setSurveyData({ ...sender.data });
    });

    // Handle survey completion
    model.onComplete.add(async (sender) => {
      setSurveyData(sender.data);
      await handleSubmit(sender.data);
    });

    setSurveyModel(model);
  }, [surveyData]);

  // Auto-save hook
  const { isSaving, lastSaved, saveNow } = useAutoSave({
    surveyId,
    data: surveyData,
    enabled: surveyStatus !== 'submitted',
    interval: 5000,
    onSave: async (data: Partial<SurveyData>) => {
      if (!token) return;

      await fetch(`/api/surveys/${surveyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ data })
      });
    },
    onError: (error: Error) => {
      console.error('Auto-save error:', error);
    }
  });

  // Validation hook
  const { isValid, errors, warnings, validateNow } = useValidation({
    data: surveyData,
    enabled: true,
    realTime: false, // Only validate on demand to avoid interfering with SurveyJS
    debounceMs: 500
  });

  const handleSubmit = async (data: any) => {
    // Validate before submission
    const validationResult = validateNow();

    if (!validationResult.isValid) {
      alert(`Cannot submit: ${validationResult.errors.length} errors found. Please fix them first.`);
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          data,
          status: 'submitted'
        })
      });

      if (response.ok) {
        setSurveyStatus('submitted');
        alert('Survey submitted successfully!');
        router.push('/surveys');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Error submitting survey. Please try again.');
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/export?format=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `survey-${surveyId}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting survey:', error);
    }
  };

  const handleValidate = () => {
    const result = validateNow();
    if (result.isValid) {
      alert('Survey is valid! No errors found.');
    } else {
      alert(`Found ${result.errors.length} errors and ${result.warnings.length} warnings.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!surveyModel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error loading survey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">
              Healthcare Benefits Survey 2025
            </h1>

            <div className="flex items-center gap-4">
              {/* Auto-save status */}
              <div className="text-sm text-slate-600">
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : lastSaved ? (
                  `Last saved: ${lastSaved.toLocaleTimeString()}`
                ) : (
                  'Not saved yet'
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleValidate}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Validate
                </button>

                <div className="relative group">
                  <button className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">
                    Export ▼
                  </button>
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50"
                    >
                      Excel
                    </button>
                  </div>
                </div>

                <button
                  onClick={saveNow}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Survey */}
          <div className="lg:col-span-3">
            {/* Validation Summary */}
            {(errors.length > 0 || warnings.length > 0) && (
              <div className="mb-6">
                <ValidationSummary errors={errors} warnings={warnings} />
              </div>
            )}

            {/* Survey Status Banner */}
            {surveyStatus === 'submitted' && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-green-800">Survey Submitted</h3>
                    <p className="text-sm text-green-700">This survey has been successfully submitted.</p>
                  </div>
                </div>
              </div>
            )}

            {/* SurveyJS Component */}
            <div className="bg-white rounded-xl shadow-sm">
              <Survey model={surveyModel} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress */}
            <SurveyProgress data={surveyData} />

            {/* Quick Stats */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span className="font-medium capitalize">{surveyStatus.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Errors:</span>
                  <span className={`font-medium ${errors.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {errors.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Warnings:</span>
                  <span className={`font-medium ${warnings.length > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    {warnings.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Need Help?</h3>
              <p className="text-xs text-slate-600 mb-3">
                Your progress is automatically saved every 5 seconds. You can safely leave and return to this survey at any time.
              </p>
              <button className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
