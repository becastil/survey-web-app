/**
 * @module useComplianceAgent
 * @description React hook for compliance validation using agent
 */

import { useState, useCallback } from 'react';
import { getAgentOrchestrator } from '@/lib/agents/orchestrator';
import { ComplianceValidatorAgent, ComplianceValidationResult } from '@/lib/agents/compliance-validator-agent';
import { Survey } from '@/types';

interface UseComplianceAgentOptions {
  regulations?: string[];
  autoCheck?: boolean;
}

interface UseComplianceAgentResult {
  validate: (survey: Survey) => Promise<ComplianceValidationResult>;
  status: ComplianceValidationResult | null;
  loading: boolean;
  error: Error | null;
}

export function useComplianceAgent(
  options: UseComplianceAgentOptions = {}
): UseComplianceAgentResult {
  const [status, setStatus] = useState<ComplianceValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { regulations = ['HIPAA', 'GDPR'] } = options;

  const validate = useCallback(async (survey: Survey): Promise<ComplianceValidationResult> => {
    setLoading(true);
    setError(null);

    try {
      // Register compliance agent if not already registered
      const orchestrator = getAgentOrchestrator();
      const complianceAgent = new ComplianceValidatorAgent();
      orchestrator.registerAgent(complianceAgent);

      // Run validation
      const result = await orchestrator.runAgent<ComplianceValidationResult>(
        'compliance-validator',
        {
          data: { survey, regulations },
          context: {
            needsKBContext: true,
            kbPrompt: `Healthcare survey compliance check for ${regulations.join(', ')}`,
          },
        }
      );

      setStatus(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Compliance validation failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [regulations]);

  return {
    validate,
    status,
    loading,
    error,
  };
}