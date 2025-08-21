import React, { useCallback, useRef, useState } from 'react';
import * as Sentry from '@sentry/nextjs';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

interface UseErrorRecoveryReturn {
  retry: () => Promise<void>;
  reset: () => void;
  isRetrying: boolean;
  retryCount: number;
  lastError: Error | null;
}

/**
 * Hook for handling error recovery with exponential backoff
 */
export function useErrorRecovery(
  fn: () => Promise<void>,
  options: RetryOptions = {}
): UseErrorRecoveryReturn {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    onRetry,
    onSuccess,
    onFailure,
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const calculateDelay = useCallback((attempt: number) => {
    const delay = initialDelay * Math.pow(backoffFactor, attempt - 1);
    return Math.min(delay, maxDelay);
  }, [initialDelay, backoffFactor, maxDelay]);

  const retry = useCallback(async () => {
    if (isRetrying) {
      console.warn('Retry already in progress');
      return;
    }

    setIsRetrying(true);
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      
      try {
        // Create abort controller for this attempt
        abortControllerRef.current = new AbortController();
        
        // Log retry attempt
        Sentry.addBreadcrumb({
          category: 'error-recovery',
          message: `Retry attempt ${attempt}/${maxRetries}`,
          level: 'info',
          data: {
            attempt,
            maxRetries,
            delay: attempt > 1 ? calculateDelay(attempt - 1) : 0,
          },
        });

        // Call the retry callback if provided
        if (onRetry) {
          onRetry(attempt, lastError!);
        }

        // Wait before retrying (except for first attempt)
        if (attempt > 1) {
          const delay = calculateDelay(attempt - 1);
          await new Promise(resolve => 
            setTimeout(resolve, delay)
          );
        }

        // Check if aborted
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Retry aborted');
        }

        // Attempt the function
        await fn();
        
        // Success!
        setRetryCount(attempt);
        setLastError(null);
        setIsRetrying(false);
        
        // Log success
        Sentry.addBreadcrumb({
          category: 'error-recovery',
          message: `Retry successful after ${attempt} attempt(s)`,
          level: 'info',
        });

        if (onSuccess) {
          onSuccess();
        }
        
        return;
      } catch (error) {
        const err = error as Error;
        setLastError(err);
        setRetryCount(attempt);
        
        // Log failed attempt
        Sentry.addBreadcrumb({
          category: 'error-recovery',
          message: `Retry attempt ${attempt} failed`,
          level: 'warning',
          data: {
            error: err.message,
            attempt,
            maxRetries,
          },
        });

        // If this was the last attempt, handle failure
        if (attempt >= maxRetries) {
          setIsRetrying(false);
          
          // Log final failure
          Sentry.captureException(err, {
            tags: {
              recovery: 'failed',
              attempts: attempt,
            },
            contexts: {
              retry: {
                maxRetries,
                finalAttempt: attempt,
                backoffFactor,
              },
            },
          });

          if (onFailure) {
            onFailure(err);
          }
          
          throw err;
        }
      }
    }
    
    setIsRetrying(false);
  }, [fn, isRetrying, lastError, maxRetries, calculateDelay, onRetry, onSuccess, onFailure]);

  const reset = useCallback(() => {
    // Abort any ongoing retry
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsRetrying(false);
    setRetryCount(0);
    setLastError(null);
  }, []);

  return {
    retry,
    reset,
    isRetrying,
    retryCount,
    lastError,
  };
}

/**
 * Hook for network-aware error recovery
 */
export function useNetworkRecovery(
  fn: () => Promise<void>,
  options: RetryOptions = {}
) {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  // Monitor network status
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      Sentry.addBreadcrumb({
        category: 'network',
        message: 'Network connection restored',
        level: 'info',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      Sentry.addBreadcrumb({
        category: 'network',
        message: 'Network connection lost',
        level: 'warning',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Wrap the function to check network status
  const networkAwareFn = useCallback(async () => {
    if (!isOnline) {
      throw new Error('No network connection');
    }
    return fn();
  }, [fn, isOnline]);

  const recovery = useErrorRecovery(networkAwareFn, {
    ...options,
    onRetry: (attempt, error) => {
      // Check if it's a network error
      if (error.message.includes('network') || error.message.includes('fetch')) {
        console.log('Network error detected, waiting for connection...');
      }
      options.onRetry?.(attempt, error);
    },
  });

  return {
    ...recovery,
    isOnline,
  };
}

/**
 * Hook for circuit breaker pattern
 */
export function useCircuitBreaker(
  fn: () => Promise<void>,
  options: {
    threshold?: number;
    timeout?: number;
    onOpen?: () => void;
    onClose?: () => void;
    onHalfOpen?: () => void;
  } = {}
) {
  const {
    threshold = 5,
    timeout = 60000,
    onOpen,
    onClose,
    onHalfOpen,
  } = options;

  const [state, setState] = useState<'closed' | 'open' | 'half-open'>('closed');
  const [failures, setFailures] = useState(0);
  const [lastFailureTime, setLastFailureTime] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(async () => {
    // Check circuit breaker state
    if (state === 'open') {
      const now = Date.now();
      if (lastFailureTime && now - lastFailureTime > timeout) {
        // Try half-open
        setState('half-open');
        if (onHalfOpen) onHalfOpen();
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      await fn();
      
      // Success - reset failures
      if (state === 'half-open') {
        setState('closed');
        if (onClose) onClose();
      }
      setFailures(0);
      
    } catch (error) {
      const newFailures = failures + 1;
      setFailures(newFailures);
      setLastFailureTime(Date.now());
      
      if (newFailures >= threshold && state !== 'open') {
        setState('open');
        if (onOpen) onOpen();
        
        // Schedule automatic half-open attempt
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setState('half-open');
          if (onHalfOpen) onHalfOpen();
        }, timeout);
        
        // Log circuit breaker opening
        Sentry.captureMessage('Circuit breaker opened', {
          level: 'warning',
          tags: {
            circuitBreaker: 'open',
            failures: newFailures,
            threshold,
          },
        });
      }
      
      throw error;
    }
  }, [fn, state, failures, lastFailureTime, threshold, timeout, onOpen, onClose, onHalfOpen]);

  const reset = useCallback(() => {
    setState('closed');
    setFailures(0);
    setLastFailureTime(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    execute,
    reset,
    state,
    failures,
    isOpen: state === 'open',
    isHalfOpen: state === 'half-open',
  };
}