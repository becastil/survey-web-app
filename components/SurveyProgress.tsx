'use client';

import { useMemo } from 'react';
import type { SurveyData } from '@/types/survey';

interface SurveyProgressProps {
  data: Partial<SurveyData>;
  className?: string;
}

interface SectionProgress {
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

function calculateSectionProgress(sectionData: any, requiredFields: string[]): number {
  if (!sectionData) return 0;

  let completed = 0;
  for (const field of requiredFields) {
    const value = sectionData[field];
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        completed++;
      } else if (typeof value === 'object' && Object.keys(value).length > 0) {
        completed++;
      } else if (typeof value !== 'object') {
        completed++;
      }
    }
  }

  return Math.round((completed / requiredFields.length) * 100);
}

export function SurveyProgress({ data, className = '' }: SurveyProgressProps) {
  const sections = useMemo<SectionProgress[]>(() => {
    const sectionConfigs = [
      {
        name: 'General Information',
        key: 'generalInformation',
        requiredFields: ['organizationName', 'contactPerson', 'email', 'phone', 'employeeCount']
      },
      {
        name: 'Medical Plans',
        key: 'medicalPlans',
        requiredFields: ['length'] // For arrays, we just check if there are items
      },
      {
        name: 'Dental Plans',
        key: 'dentalPlans',
        requiredFields: ['length']
      },
      {
        name: 'Vision Plans',
        key: 'visionPlans',
        requiredFields: ['length']
      },
      {
        name: 'Basic Life & Disability',
        key: 'basicLifeDisability',
        requiredFields: ['basicLife', 'supplementalLife', 'shortTermDisability', 'longTermDisability']
      },
      {
        name: 'Retirement',
        key: 'retirement',
        requiredFields: ['plan401k', 'plan403b', 'pensionPlan']
      },
      {
        name: 'Time Off',
        key: 'timeOff',
        requiredFields: ['paidTimeOff', 'sickLeave', 'holidays']
      },
      {
        name: 'Benefits Strategy',
        key: 'benefitsStrategy',
        requiredFields: ['objectives', 'priorities', 'communicationStrategy']
      },
      {
        name: 'Voluntary Benefits',
        key: 'voluntaryBenefits',
        requiredFields: ['criticalIllness', 'accident', 'hospital']
      },
      {
        name: 'Best Practices',
        key: 'bestPractices',
        requiredFields: ['wellnessProgram', 'eap', 'benefitsEducation']
      }
    ];

    return sectionConfigs.map(config => {
      const sectionData = (data as any)?.[config.key];
      const percentage = calculateSectionProgress(sectionData, config.requiredFields);

      return {
        name: config.name,
        completed: percentage,
        total: 100,
        percentage
      };
    });
  }, [data]);

  const overallProgress = useMemo(() => {
    if (sections.length === 0) return 0;
    const totalPercentage = sections.reduce((sum, section) => sum + section.percentage, 0);
    return Math.round(totalPercentage / sections.length);
  }, [sections]);

  const completedSections = sections.filter(s => s.percentage === 100).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-700">Overall Progress</h3>
          <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
        </div>

        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          {completedSections} of {sections.length} sections completed
        </p>
      </div>

      {/* Section Progress */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-700">Section Progress</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {sections.map((section) => (
            <div key={section.name} className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-700">{section.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">
                    {section.percentage}%
                  </span>
                  {section.percentage === 100 && (
                    <svg
                      className="h-4 w-4 text-green-500"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    section.percentage === 100
                      ? 'bg-green-500'
                      : section.percentage > 0
                      ? 'bg-blue-500'
                      : 'bg-slate-300'
                  }`}
                  style={{ width: `${section.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Messages */}
      {overallProgress === 100 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-start gap-2">
            <svg
              className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">Survey Complete!</p>
              <p className="text-xs text-green-700 mt-1">
                All sections have been filled out. You can now submit your survey.
              </p>
            </div>
          </div>
        </div>
      )}

      {overallProgress > 0 && overallProgress < 100 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-start gap-2">
            <svg
              className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">In Progress</p>
              <p className="text-xs text-blue-700 mt-1">
                Continue filling out the remaining sections. Your progress is automatically saved.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
