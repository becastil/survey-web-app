'use client';

export default function SurveyCompleteContent() {
  const handleCloseWindow = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 text-center">
      <div className="max-w-2xl space-y-6">
        <div className="mb-6 text-6xl text-green-500">✓</div>
        <h1 className="text-4xl font-bold text-slate-900">Survey Complete!</h1>
        <p className="text-lg text-slate-600">
          Your comprehensive Healthcare Benefits Strategy Survey has been submitted successfully.
          Your responses will help create a customized benefits strategy for your organization.
        </p>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-slate-500">What happens next:</p>
          <ul className="mx-auto space-y-2 text-left text-slate-600 max-w-md">
            <li>• Our team will review your responses</li>
            <li>• We'll analyze your current benefits structure</li>
            <li>• You'll receive a customized strategy report</li>
            <li>• A benefits specialist will contact you within 2-3 business days</li>
          </ul>
        </div>
        <div className="pt-6">
          <button
            type="button"
            onClick={handleCloseWindow}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            Close Window
          </button>
        </div>
      </div>
    </main>
  );
}
