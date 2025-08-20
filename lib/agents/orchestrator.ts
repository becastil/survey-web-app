/**
 * @module AgentOrchestrator
 * @description Central coordinator for all agent operations
 */

import { 
  Agent, 
  AgentOrchestrator as IAgentOrchestrator, 
  AgentTask, 
  AgentResult, 
  AgentInput 
} from '@/lib/archon/types';
import { getArchonClient } from '@/lib/archon/client';
import { archonConfig } from '@/lib/config/archon.config';

export class AgentOrchestrator implements IAgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private maxRetries: number = archonConfig.agents.circuitBreaker.threshold;
  private timeoutMs: number = archonConfig.api.timeout;
  private activeRequests: Map<string, AbortController> = new Map();
  private circuitBreaker: Map<string, CircuitBreakerState> = new Map();

  /**
   * Register an agent
   */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    this.circuitBreaker.set(agent.id, {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
    });
  }

  /**
   * Run a single agent
   */
  async runAgent<T>(agentId: string, input: any): Promise<T> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Check circuit breaker
    const breaker = this.circuitBreaker.get(agentId)!;
    if (breaker.state === 'open') {
      const resetTime = breaker.lastFailureTime + archonConfig.agents.circuitBreaker.resetTimeout;
      if (Date.now() < resetTime) {
        throw new Error(`Circuit breaker open for agent ${agentId}`);
      }
      // Try to close the circuit
      breaker.state = 'half-open';
    }

    const requestId = crypto.randomUUID();
    const abortController = new AbortController();
    this.activeRequests.set(requestId, abortController);

    try {
      // Set timeout
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, this.timeoutMs);

      // Run agent with retry logic
      const result = await this.runWithRetry(agent, input, 0);
      
      clearTimeout(timeoutId);
      
      // Reset circuit breaker on success
      if (breaker.state === 'half-open') {
        breaker.state = 'closed';
        breaker.failures = 0;
      }

      return result.data as T;
    } catch (error) {
      // Update circuit breaker
      breaker.failures++;
      breaker.lastFailureTime = Date.now();
      
      if (breaker.failures >= this.maxRetries) {
        breaker.state = 'open';
      }

      throw error;
    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Run multiple agents in parallel
   */
  async runParallel(tasks: AgentTask[]): Promise<AgentResult[]> {
    const promises = tasks.map(async (task) => {
      try {
        const result = await this.runAgent(task.agentId, task.input);
        return {
          success: true,
          data: result,
          metadata: {
            agentId: task.agentId,
            executionTime: Date.now(),
            timestamp: new Date().toISOString(),
          },
        } as AgentResult;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata: {
            agentId: task.agentId,
            executionTime: Date.now(),
            timestamp: new Date().toISOString(),
          },
        } as AgentResult;
      }
    });

    return Promise.all(promises);
  }

  /**
   * Set maximum retries
   */
  setMaxRetries(retries: number): void {
    this.maxRetries = retries;
  }

  /**
   * Set timeout in milliseconds
   */
  setTimeoutMs(timeout: number): void {
    this.timeoutMs = timeout;
  }

  /**
   * Run agent with retry logic
   */
  private async runWithRetry(
    agent: Agent, 
    input: AgentInput, 
    attempt: number
  ): Promise<AgentResult> {
    try {
      // Add KB context if needed
      if (!input.kbContext && input.context?.needsKBContext) {
        const archonClient = getArchonClient();
        input.kbContext = await archonClient.query(
          input.context.kbPrompt || 'Provide context for healthcare survey',
          { cacheKey: `agent:${agent.id}:context`, cacheTTL: 300 }
        );
      }

      return await agent.execute(input);
    } catch (error) {
      if (attempt < this.maxRetries - 1) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await this.delay(delay);
        return this.runWithRetry(agent, input, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Abort all active requests
   */
  abortAll(): void {
    this.activeRequests.forEach(controller => controller.abort());
    this.activeRequests.clear();
  }

  /**
   * Get agent status
   */
  getAgentStatus(agentId: string): any {
    const agent = this.agents.get(agentId);
    const breaker = this.circuitBreaker.get(agentId);
    
    return {
      exists: !!agent,
      status: agent?.getStatus(),
      circuitBreaker: breaker,
    };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'open' | 'closed' | 'half-open';
}

// Singleton instance
let orchestratorInstance: AgentOrchestrator | null = null;

export function getAgentOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator();
    // Register default agents
    registerDefaultAgents(orchestratorInstance);
  }
  return orchestratorInstance;
}

/**
 * Register default agents
 */
function registerDefaultAgents(orchestrator: AgentOrchestrator) {
  // Import and register all default agents
  // These will be created in separate files
  // For now, we'll add placeholders
  
  // Example agents that will be implemented:
  // - SurveyEnrichmentAgent
  // - ComplianceValidatorAgent
  // - InsightGeneratorAgent
  // - AnomalyDetectorAgent
  // - QuestionSuggesterAgent
}