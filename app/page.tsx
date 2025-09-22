import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 text-center">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold text-slate-900">
          Healthcare Benefits Strategy Survey
        </h1>
        <p className="text-lg text-slate-600">
          Move beyond static spreadsheets with a modern, guided experience for collecting comprehensive employee benefits information.
        </p>
        <Link
          href="/survey"
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Launch Survey
        </Link>
      </div>
    </main>
  );
}
