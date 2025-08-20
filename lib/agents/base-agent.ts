/**
 * @module BaseAgent
 * @description Base class for all agents
 */

import { 
  Agent, 
  AgentType, 
  AgentStatus, 
  AgentInput, 
  AgentResult 
} from '@/lib/archon/types';

export abstract class BaseAgent implements Agent {
  public readonly id: string;
  public readonly type: AgentType;
  protected status: AgentStatus = 'idle';
  protected statusListeners: ((status: AgentStatus) => void)[] = [];
  protected abortController: AbortController | null = null;

  constructor(id: string, type: AgentType) {
    this.id = id;
    this.type = type;
  }

  /**
   * Execute agent logic - to be implemented by subclasses
   */
  abstract execute<T>(input: AgentInput): Promise<AgentResult<T>>;

  /**
   * Abort current execution
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.setStatus('aborted');
  }

  /**
   * Get current status
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(callback: (status: AgentStatus) => void): void {
    this.statusListeners.push(callback);
  }

  /**
   * Update status and notify listeners
   */
  protected setStatus(status: AgentStatus): void {
    this.status = status;
    this.statusListeners.forEach(listener => listener(status));
  }

  /**
   * Create abort controller for request
   */
  protected createAbortController(): AbortController {
    this.abortController = new AbortController();
    return this.abortController;
  }

  /**
   * Wrap execution with error handling
   */
  protected async wrapExecution<T>(
    executeFn: () => Promise<T>
  ): Promise<AgentResult<T>> {
    const startTime = Date.now();
    this.setStatus('processing');

    try {
      const data = await executeFn();
      this.setStatus('completed');
      
      return {
        success: true,
        data,
        metadata: {
          executionTime: Date.now() - startTime,
          agentId: this.id,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.setStatus('error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          executionTime: Date.now() - startTime,
          agentId: this.id,
          timestamp: new Date().toISOString(),
        },
      };
    } finally {
      this.abortController = null;
    }
  }
}