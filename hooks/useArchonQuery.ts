import { useState, useEffect } from 'react';

export function useArchonQuery(query: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
  }, [query]);

  return { data, loading, error };
}