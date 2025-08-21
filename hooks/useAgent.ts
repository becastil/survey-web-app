/**
 * @module useAgent
 * @description React hook for using agents
 */

import { useState, useCallback, useEffect } from 'react';
import { getAgentOrchestrator } from '@/lib/agents/orchestrator';
import { AgentStatus, AgentInput } from '@/lib/archon/types';

interface UseAgentOptions {
  autoExecute?: boolean;
  onStatusChange?: (status: AgentStatus) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

interface UseAgentResult {
  execute: (input: AgentInput) => Promise<any>;
  abort: () => void;
  status: AgentStatus;
  loading: boolean;
  error: Error | null;
  result: any;
}

export function useAgent(agentId: string, options: UseAgentOptions = {}): UseAgentResult {
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<any>(null);

  const { onStatusChange, onSuccess, onError } = options;

  // Update status
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const execute = useCallback(async (input: AgentInput) => {
    setLoading(true);
    setError(null);
    setStatus('processing');

    try {
      const orchestrator = getAgentOrchestrator();
      const agentResult = await orchestrator.runAgent(agentId, input);
      
      setResult(agentResult);
      setStatus('completed');
      onSuccess?.(agentResult);
      
      return agentResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Agent execution failed');
      setError(error);
      setStatus('error');
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [agentId, onSuccess, onError]);

  const abort = useCallback(() => {
    const orchestrator = getAgentOrchestrator();
    orchestrator.abortAll();
    setStatus('aborted');
    setLoading(false);
  }, []);

  return {
    execute,
    abort,
    status,
    loading,
    error,
    result,
  };
}