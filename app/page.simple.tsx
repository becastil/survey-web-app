export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Healthcare Survey Dashboard</h1>
        <p className="text-gray-400 mb-8">Transform Healthcare with Data-Driven Insights</p>
        <div className="flex gap-4 justify-center">
          <a href="/login" className="px-6 py-3 bg-violet-600 rounded-lg hover:bg-violet-700">
            Sign In
          </a>
          <a href="/register" className="px-6 py-3 border border-violet-600 rounded-lg hover:bg-violet-600/10">
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}