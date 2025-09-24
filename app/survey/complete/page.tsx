export default function SurveyCompletePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 text-center">
      <div className="max-w-2xl space-y-6">
        <div className="text-6xl text-green-500 mb-6">✓</div>
        <h1 className="text-4xl font-bold text-slate-900">Survey Complete!</h1>
        <p className="text-lg text-slate-600">
          Your comprehensive Healthcare Benefits Strategy Survey has been submitted successfully. 
          Your responses will help create a customized benefits strategy for your organization.
        </p>
        <div className="pt-4 space-y-4">
          <p className="text-sm text-slate-500">
            What happens next:
          </p>
          <ul className="text-left text-slate-600 space-y-2 max-w-md mx-auto">
            <li>• Our team will review your responses</li>
            <li>• We'll analyze your current benefits structure</li>
            <li>• You'll receive a customized strategy report</li>
            <li>• A benefits specialist will contact you within 2-3 business days</li>
          </ul>
        </div>
        <div className="pt-6">
          <button 
            onClick={() => window.close()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </main>
  );
}
