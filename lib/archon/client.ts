/**
 * @module ArchonClient
 * @description Archon Knowledge Base client with caching and error handling
 */

import { 
  ArchonKBClient, 
  QueryOptions, 
  KBResponse, 
  CodeExample, 
  KBSource, 
  RAGResponse,
  CachedResponse 
} from './types';
import { archonConfig } from '@/lib/config/archon.config';
import { ArchonAuth } from './auth';
import { ArchonErrorHandler } from './error-handler';
import { CacheManager } from './cache';

export class ArchonClient implements ArchonKBClient {
  public baseUrl: string;
  public apiKey: string;
  private cache: CacheManager;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor() {
    this.baseUrl = archonConfig.api.baseUrl;
    this.apiKey = archonConfig.auth.apiKey || '';
    this.cache = new CacheManager(archonConfig.cache);
  }

  async initialize() {
    await ArchonAuth.initialize();
  }

  /**
   * Query the Archon KB with caching support
   */
  async query(prompt: string, options?: QueryOptions): Promise<KBResponse> {
    const cacheKey = options?.cacheKey || this.generateCacheKey('query', prompt);
    
    // Check cache first
    if (options?.cacheTTL && options.cacheTTL > 0) {
      const cached = await this.cache.get<KBResponse>(cacheKey);
      if (cached) {
        return { ...cached.data, fromCache: true };
      }
    }

    const requestId = crypto.randomUUID();
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: await ArchonAuth.getHeaders(),
        body: JSON.stringify({
          prompt,
          ...options,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`KB query failed: ${response.statusText}`);
      }

      const data: KBResponse = await response.json();
      
      // Cache the response
      if (options?.cacheTTL && options.cacheTTL > 0) {
        await this.cache.set(cacheKey, data, options.cacheTTL);
      }

      return data;
    } catch (error) {
      return await ArchonErrorHandler.handle(error, `query:${prompt}`);
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Search for code examples in the KB
   */
  async searchCodeExamples(query: string, limit: number = 5): Promise<CodeExample[]> {
    const cacheKey = this.generateCacheKey('code-examples', `${query}:${limit}`);
    
    const cached = await this.cache.get<CodeExample[]>(cacheKey);
    if (cached) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}/search-code-examples`, {
        method: 'POST',
        headers: await ArchonAuth.getHeaders(),
        body: JSON.stringify({ query, match_count: limit }),
      });

      if (!response.ok) {
        throw new Error(`Code search failed: ${response.statusText}`);
      }

      const result = await response.json();
      const examples = result.results || [];
      
      await this.cache.set(cacheKey, examples, 600); // Cache for 10 minutes
      return examples;
    } catch (error) {
      console.error('Failed to search code examples:', error);
      return [];
    }
  }

  /**
   * Get available KB sources
   */
  async getAvailableSources(): Promise<KBSource[]> {
    const cacheKey = 'kb-sources';
    
    const cached = await this.cache.get<KBSource[]>(cacheKey);
    if (cached) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}/get-available-sources`, {
        method: 'POST',
        headers: await ArchonAuth.getHeaders(),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Failed to get sources: ${response.statusText}`);
      }

      const result = await response.json();
      const sources = result.sources || [];
      
      await this.cache.set(cacheKey, sources, 3600); // Cache for 1 hour
      return sources;
    } catch (error) {
      console.error('Failed to get KB sources:', error);
      return [];
    }
  }

  /**
   * Perform RAG query on the KB
   */
  async performRAGQuery(query: string, source?: string): Promise<RAGResponse> {
    const cacheKey = this.generateCacheKey('rag', `${query}:${source || 'all'}`);
    
    const cached = await this.cache.get<RAGResponse>(cacheKey);
    if (cached) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}/perform-rag-query`, {
        method: 'POST',
        headers: await ArchonAuth.getHeaders(),
        body: JSON.stringify({ 
          query, 
          source,
          match_count: 5 
        }),
      });

      if (!response.ok) {
        throw new Error(`RAG query failed: ${response.statusText}`);
      }

      const data: RAGResponse = await response.json();
      
      await this.cache.set(cacheKey, data, 300); // Cache for 5 minutes
      return data;
    } catch (error) {
      console.error('RAG query failed:', error);
      return {
        results: [],
        reranked: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Stream query responses for real-time updates
   */
  async *streamQuery(prompt: string, onChunk?: (chunk: string) => void): AsyncIterator<string> {
    const wsUrl = archonConfig.api.wsUrl;
    
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      const chunks: string[] = [];

      ws.onopen = () => {
        ws.send(JSON.stringify({ 
          type: 'stream-query',
          prompt,
          apiKey: this.apiKey 
        }));
      };

      ws.onmessage = (event) => {
        const chunk = event.data;
        chunks.push(chunk);
        
        if (onChunk) {
          onChunk(chunk);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      ws.onclose = () => {
        resolve(chunks);
      };
    }) as any; // Type assertion for async iterator
  }

  /**
   * Abort a request
   */
  abort(requestId: string) {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(prefix: string, input: string): string {
    const hash = this.simpleHash(input);
    return `archon:${prefix}:${hash}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Singleton instance
let clientInstance: ArchonClient | null = null;

export function getArchonClient(): ArchonClient {
  if (!clientInstance) {
    clientInstance = new ArchonClient();
  }
  return clientInstance;
}