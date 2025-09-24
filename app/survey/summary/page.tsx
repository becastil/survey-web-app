'use client';

import { useEffect, useState } from 'react';

interface SurveyResponse {
  [key: string]: any;
}

export default function SurveySummaryPage() {
  const [responses, setResponses] = useState<SurveyResponse | null>(null);

  useEffect(() => {
    // Get responses from localStorage (where SurveyJS typically stores them)
    const storedData = localStorage.getItem('survey-responses');
    if (storedData) {
      try {
        setResponses(JSON.parse(storedData));
      } catch (error) {
        console.error('Error parsing survey responses:', error);
      }
    }
  }, []);

  if (!responses) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Survey Summary</h1>
          <p className="text-gray-600">No survey responses found. Please complete the survey first.</p>
        </div>
      </main>
    );
  }

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value || 'Not provided');
  };

  const formatKey = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="border-b pb-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Healthcare Benefits Survey Summary</h1>
            <p className="text-gray-600 mt-2">Review of your submitted responses</p>
          </div>

          <div className="space-y-8">
            {Object.entries(responses).map(([section, data]) => {
              if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                return (
                  <div key={section} className="border-l-4 border-blue-500 pl-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {formatKey(section)}
                    </h2>
                    <div className="grid gap-4">
                      {Object.entries(data).map(([key, value]) => (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-2">
                          <dt className="font-medium text-gray-700 sm:w-1/3">
                            {formatKey(key)}:
                          </dt>
                          <dd className="text-gray-900 sm:w-2/3">
                            <pre className="whitespace-pre-wrap font-sans text-sm">
                              {formatValue(value)}
                            </pre>
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={section} className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <dt className="font-medium text-gray-700 sm:w-1/3">
                      {formatKey(section)}:
                    </dt>
                    <dd className="text-gray-900 sm:w-2/3">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {formatValue(data)}
                      </pre>
                    </dd>
                  </div>
                );
              }
            })}
          </div>

          <div className="mt-12 pt-8 border-t flex justify-center space-x-4">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Print Summary
            </button>
            <button
              onClick={() => history.back()}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}