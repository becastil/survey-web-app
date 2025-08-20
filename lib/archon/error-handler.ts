/**
 * @module ArchonErrorHandler
 * @description Error handling with retry logic and fallback mechanisms
 */

import { KBResponse } from './types';
import { CacheManager } from './cache';

interface ErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
}

export class ArchonErrorHandler {
  private static retryAttempts = new Map<string, number>();
  private static cache = new CacheManager({ enabled: true, ttl: 3600, strategy: 'lru' });

  /**
   * Handle errors with retry logic and fallback
   */
  static async handle(
    error: any, 
    context: string,
    options: ErrorHandlerOptions = {}
  ): Promise<any> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      exponentialBackoff = true,
    } = options;

    // Get current retry attempt
    const attemptKey = `${context}:${Date.now()}`;
    const currentAttempt = this.retryAttempts.get(attemptKey) || 0;

    // Log the error
    this.logError(error, context, currentAttempt);

    // Handle rate limiting
    if (error.status === 429) {
      const retryAfter = this.getRetryAfter(error);
      await this.delay(retryAfter * 1000);
      return { retry: true, delay: retryAfter };
    }

    // Handle network errors with retry
    if (this.isNetworkError(error) && currentAttempt < maxRetries) {
      this.retryAttempts.set(attemptKey, currentAttempt + 1);
      
      const delay = exponentialBackoff 
        ? retryDelay * Math.pow(2, currentAttempt)
        : retryDelay;
      
      await this.delay(delay);
      return { retry: true, delay };
    }

    // Try to get fallback from cache
    const fallback = await this.getFallback(context);
    if (fallback) {
      console.warn(`Using cached fallback for ${context}`);
      return fallback;
    }

    // Return default error response
    return this.getDefaultErrorResponse(error, context);
  }

  /**
   * Log error with context
   */
  private static logError(error: any, context: string, attempt: number) {
    const errorInfo = {
      message: error.message || 'Unknown error',
      status: error.status,
      context,
      attempt,
      timestamp: new Date().toISOString(),
      stack: error.stack,
    };

    console.error('[Archon Error]', errorInfo);

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(errorInfo);
    }
  }

  /**
   * Send error to monitoring service
   */
  private static async sendToMonitoring(errorInfo: any) {
    try {
      // Integration with Sentry or other monitoring service
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(new Error(errorInfo.message), {
          tags: {
            component: 'archon-kb',
            context: errorInfo.context,
          },
          extra: errorInfo,
        });
      }
    } catch (e) {
      console.error('Failed to send to monitoring:', e);
    }
  }

  /**
   * Check if error is network-related
   */
  private static isNetworkError(error: any): boolean {
    return (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ETIMEDOUT' ||
      error.message?.includes('fetch failed') ||
      error.message?.includes('Network')
    );
  }

  /**
   * Get retry-after value from error response
   */
  private static getRetryAfter(error: any): number {
    const retryAfter = error.headers?.['retry-after'];
    if (retryAfter) {
      // If it's a number, it's seconds
      if (!isNaN(retryAfter)) {
        return parseInt(retryAfter);
      }
      // If it's a date, calculate seconds
      const retryDate = new Date(retryAfter);
      const now = new Date();
      return Math.max(0, Math.floor((retryDate.getTime() - now.getTime()) / 1000));
    }
    // Default to 5 seconds
    return 5;
  }

  /**
   * Get fallback response from cache
   */
  private static async getFallback(context: string): Promise<any> {
    const fallbackKey = `fallback:${context}`;
    const cached = await this.cache.get(fallbackKey);
    return cached?.data || null;
  }

  /**
   * Get default error response
   */
  private static getDefaultErrorResponse(error: any, context: string): KBResponse {
    return {
      data: {
        content: 'An error occurred while processing your request.',
        insights: [],
        suggestions: [],
      },
      source: 'error-fallback',
      fromCache: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Delay helper for retry logic
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear retry attempts for a context
   */
  static clearRetries(context: string) {
    const keysToDelete: string[] = [];
    this.retryAttempts.forEach((_, key) => {
      if (key.startsWith(context)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.retryAttempts.delete(key));
  }
}