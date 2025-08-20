/**
 * @module useArchonQuery
 * @description React hook for querying Archon Knowledge Base
 */

import { useState, useEffect, useCallback } from 'react';
import { getArchonClient } from '@/lib/archon/client';
import { KBResponse, QueryOptions } from '@/lib/archon/types';

interface UseArchonQueryOptions extends QueryOptions {
  enabled?: boolean;
  onSuccess?: (data: KBResponse) => void;
  onError?: (error: Error) => void;
}

interface UseArchonQueryResult {
  data: KBResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useArchonQuery(
  prompt: string,
  options: UseArchonQueryOptions = {}
): UseArchonQueryResult {
  const [data, setData] = useState<KBResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { enabled = true, onSuccess, onError, ...queryOptions } = options;

  const fetchData = useCallback(async () => {
    if (!enabled || !prompt) return;

    setLoading(true);
    setError(null);

    try {
      const archonClient = getArchonClient();
      const response = await archonClient.query(prompt, queryOptions);
      
      setData(response);
      onSuccess?.(response);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Query failed');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [prompt, enabled, JSON.stringify(queryOptions)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}