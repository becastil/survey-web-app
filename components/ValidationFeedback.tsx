'use client';

import type { ValidationError } from '@/hooks/useValidation';

interface ValidationFeedbackProps {
  error?: ValidationError | null;
  className?: string;
}

export function ValidationFeedback({ error, className = '' }: ValidationFeedbackProps) {
  if (!error) return null;

  const isError = error.severity === 'error';
  const isWarning = error.severity === 'warning';

  return (
    <div
      className={`mt-1 flex items-start gap-1.5 text-xs ${
        isError ? 'text-red-600' : 'text-amber-600'
      } ${className}`}
      role="alert"
    >
      {isError && (
        <svg
          className="h-4 w-4 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {isWarning && (
        <svg
          className="h-4 w-4 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span>{error.message}</span>
    </div>
  );
}

interface ValidationSummaryProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  className?: string;
}

export function ValidationSummary({ errors, warnings, className = '' }: ValidationSummaryProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">
                {errors.length} {errors.length === 1 ? 'Error' : 'Errors'} Found
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-red-700">
                {errors.slice(0, 5).map((error, index) => (
                  <li key={`${error.field}-${index}`} className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>
                      <strong className="font-medium">{formatFieldName(error.field)}:</strong> {error.message}
                    </span>
                  </li>
                ))}
                {errors.length > 5 && (
                  <li className="text-xs text-red-600 italic">
                    ...and {errors.length - 5} more errors
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800">
                {warnings.length} {warnings.length === 1 ? 'Warning' : 'Warnings'}
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-amber-700">
                {warnings.slice(0, 3).map((warning, index) => (
                  <li key={`${warning.field}-${index}`} className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>
                      <strong className="font-medium">{formatFieldName(warning.field)}:</strong> {warning.message}
                    </span>
                  </li>
                ))}
                {warnings.length > 3 && (
                  <li className="text-xs text-amber-600 italic">
                    ...and {warnings.length - 3} more warnings
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatFieldName(fieldPath: string): string {
  // Convert field path like "medicalPlans[0].planName" to "Medical Plan 1 - Plan Name"
  return fieldPath
    .replace(/\[(\d+)\]/g, (_, num) => ` ${parseInt(num) + 1}`)
    .split('.')
    .map(part => {
      // Convert camelCase to Title Case
      return part
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^\w/, c => c.toUpperCase());
    })
    .join(' - ');
}
