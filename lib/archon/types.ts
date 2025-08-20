/**
 * @module ArchonTypes
 * @description Type definitions for Archon KB and Agent interfaces
 */

// Archon Knowledge Base Types
export interface ArchonKBClient {
  baseUrl: string;
  apiKey: string;
  
  // Core Methods
  query(prompt: string, options?: QueryOptions): Promise<KBResponse>;
  searchCodeExamples(query: string, limit?: number): Promise<CodeExample[]>;
  getAvailableSources(): Promise<KBSource[]>;
  performRAGQuery(query: string, source?: string): Promise<RAGResponse>;
  
  // Streaming support
  streamQuery(prompt: string, onChunk: (chunk: string) => void): AsyncIterator<string>;
}

export interface QueryOptions {
  maxTokens?: number;
  temperature?: number;
  includeContext?: boolean;
  source?: string;
  cacheKey?: string;
  cacheTTL?: number; // seconds
}

export interface KBResponse {
  data: {
    content: string;
    insights?: string[];
    suggestions?: string[];
    helpText?: string;
    validation?: ValidationRule[];
  };
  source: string;
  fromCache?: boolean;
  timestamp: string;
}

export interface CodeExample {
  id: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  tags?: string[];
}

export interface KBSource {
  source_id: string;
  title: string;
  summary: string;
  metadata: {
    tags: string[];
    knowledge_type: string;
    update_frequency: number;
  };
  total_words: number;
  created_at: string;
  updated_at: string;
}

export interface RAGResponse {
  results: Array<{
    content: string;
    relevance: number;
    source: string;
    metadata?: Record<string, any>;
  }>;
  reranked: boolean;
  error: string | null;
}

// Agent Types
export type AgentType = 'analyzer' | 'validator' | 'generator' | 'enricher';
export type AgentStatus = 'idle' | 'processing' | 'completed' | 'error' | 'aborted';

export interface Agent {
  id: string;
  type: AgentType;
  
  // Async execution with abort support
  execute<T>(input: AgentInput): Promise<AgentResult<T>>;
  abort(): void;
  
  // Status monitoring
  getStatus(): AgentStatus;
  onStatusChange(callback: (status: AgentStatus) => void): void;
}

export interface AgentInput {
  data: any;
  context?: Record<string, any>;
  kbContext?: KBResponse;
  options?: Record<string, any>;
}

export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    executionTime: number;
    agentId: string;
    timestamp: string;
    cached?: boolean;
  };
}

export interface AgentTask {
  agentId: string;
  input: AgentInput;
  priority?: number;
  timeout?: number;
}

export interface AgentOrchestrator {
  // Agent management
  registerAgent(agent: Agent): void;
  runAgent<T>(agentId: string, input: any): Promise<T>;
  runParallel(tasks: AgentTask[]): Promise<AgentResult[]>;
  
  // Circuit breaker pattern
  setMaxRetries(retries: number): void;
  setTimeoutMs(timeout: number): void;
}

// Survey-specific Agent Types
export interface SurveyEnrichmentResult {
  enrichedQuestions: EnrichedQuestion[];
  suggestedQuestions: SuggestedQuestion[];
  complianceIssues: ComplianceIssue[];
  insights: string[];
}

export interface EnrichedQuestion {
  id: string;
  text: string;
  helpText: string;
  validationRules: ValidationRule[];
  accessibility: {
    ariaLabel: string;
    ariaDescribedBy?: string;
    screenReaderHint?: string;
  };
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating' | 'checkbox';
  category: string;
  relevanceScore: number;
  source: string;
  rationale: string;
}

export interface ComplianceIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  regulation: string;
  description: string;
  recommendation: string;
  affectedQuestions: string[];
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// Analytics Agent Types
export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  data?: any;
  visualization?: {
    type: string;
    config: any;
  };
  actions?: Array<{
    label: string;
    action: string;
    params?: any;
  }>;
}

export interface AnomalyDetectionResult {
  anomalies: Array<{
    id: string;
    dataPoint: any;
    severity: 'low' | 'medium' | 'high';
    confidence: number;
    explanation: string;
    position?: { x: number; y: number };
  }>;
  summary: string;
  recommendations: string[];
}

// Cache Types
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // seconds
  maxSize?: number; // MB
  strategy: 'lru' | 'fifo';
}

export interface CachedResponse<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}