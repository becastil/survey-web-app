'use client';

import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface FeatureErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  featureName: string;
  compact?: boolean;
}

function FeatureErrorFallback({ 
  error, 
  resetErrorBoundary, 
  featureName, 
  compact = false 
}: FeatureErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  if (compact) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Feature Unavailable</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{featureName} is temporarily unavailable.</p>
          <Button 
            onClick={resetErrorBoundary} 
            size="sm" 
            variant="outline"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border border-dashed border-gray-300 dark:border-gray-700",
      "bg-gray-50 dark:bg-gray-900 p-6"
    )}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold">
              {featureName} is not available
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              This feature encountered an error and has been disabled to prevent further issues.
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={resetErrorBoundary}
              size="sm"
              variant="default"
            >
              Try to Restore
            </Button>
            <Button
              onClick={() => setShowDetails(!showDetails)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              {showDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>

          {showDetails && (
            <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
              <p className="text-red-600 dark:text-red-400">
                {error.message}
              </p>
              {process.env.NODE_ENV === 'development' && error.stack && (
                <pre className="mt-2 text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-auto max-h-40">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  featureName: string;
  fallback?: React.ComponentType<FeatureErrorFallbackProps>;
  onError?: (error: Error) => void;
  onReset?: () => void;
  compact?: boolean;
  isolate?: boolean; // If true, errors won't bubble up
}

export function FeatureErrorBoundary({
  children,
  featureName,
  fallback,
  onError,
  onReset,
  compact = false,
  isolate = true,
}: FeatureErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    // Log feature-specific error
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', 'feature');
      scope.setTag('feature', featureName);
      scope.setLevel('warning'); // Feature errors are warnings, not critical
      scope.setContext('feature', {
        name: featureName,
        compact,
        isolate,
      });
      Sentry.captureException(error);
    });

    console.warn(`Feature "${featureName}" error:`, error);
    
    if (onError) {
      onError(error);
    }

    // If not isolated, re-throw to let parent boundaries handle it
    if (!isolate) {
      throw error;
    }
  };

  const handleReset = () => {
    console.log(`Attempting to reset feature: ${featureName}`);
    
    Sentry.addBreadcrumb({
      category: 'feature-recovery',
      message: `Feature "${featureName}" reset attempted`,
      level: 'info',
    });

    if (onReset) {
      onReset();
    }
  };

  const FallbackComponent = fallback || ((props: any) => (
    <FeatureErrorFallback 
      {...props} 
      featureName={featureName} 
      compact={compact}
    />
  ));

  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
}

// Higher-order component for easy feature wrapping
export function withFeatureErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  featureName: string,
  options?: Omit<FeatureErrorBoundaryProps, 'children' | 'featureName'>
) {
  return React.forwardRef<any, P>((props, ref) => (
    <FeatureErrorBoundary featureName={featureName} {...options}>
      <Component {...props} ref={ref} />
    </FeatureErrorBoundary>
  ));
}