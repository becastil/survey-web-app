'use client';

import { useState } from 'react';

export default function NaturalLanguageQuery() {
  const [query, setQuery] = useState('');

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ask a question about your data..."
          className="flex-1 px-4 py-2 border rounded-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Query
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <button className="text-sm text-blue-600 hover:underline">
          "Show regional distribution"
        </button>
        <button className="text-sm text-blue-600 hover:underline">
          "Compare to industry average"
        </button>
      </div>
    </div>
  );
}