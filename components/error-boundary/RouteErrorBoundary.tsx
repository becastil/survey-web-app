'use client';

import React from 'react';
import { ErrorBoundary, ErrorBoundaryPropsWithFallback } from 'react-error-boundary';
import * as Sentry from '@sentry/nextjs';
import { usePathname } from 'next/navigation';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RouteErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function RouteErrorFallback({ error, resetErrorBoundary }: RouteErrorFallbackProps) {
  const pathname = usePathname();
  
  React.useEffect(() => {
    // Log route-specific error context
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', 'route');
      scope.setContext('route', {
        pathname,
        timestamp: new Date().toISOString(),
      });
      Sentry.captureException(error);
    });
  }, [error, pathname]);

  const getRouteSpecificMessage = () => {
    if (pathname?.includes('/surveys')) {
      return 'There was a problem loading the survey data.';
    }
    if (pathname?.includes('/analytics')) {
      return 'There was a problem loading the analytics.';
    }
    if (pathname?.includes('/settings')) {
      return 'There was a problem loading your settings.';
    }
    return 'There was a problem loading this page.';
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Page Error</CardTitle>
              <CardDescription>{getRouteSpecificMessage()}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Error: {error.message}
            </p>
            
            <div className="flex gap-2">
              <Button 
                onClick={resetErrorBoundary}
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Try Again
              </Button>
              <Button 
                onClick={handleGoBack}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="h-3 w-3" />
                Go Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<RouteErrorFallbackProps>;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

export function RouteErrorBoundary({ 
  children, 
  fallback,
  onReset,
  onError 
}: RouteErrorBoundaryProps) {
  const pathname = usePathname();

  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    // Add route context to error
    console.error(`Route error at ${pathname}:`, error);
    
    if (onError) {
      onError(error, errorInfo);
    }
  };

  const handleReset = () => {
    // Clear any route-specific error state
    if (onReset) {
      onReset();
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={fallback || RouteErrorFallback}
      onError={handleError}
      onReset={handleReset}
      resetKeys={[pathname]} // Reset when route changes
    >
      {children}
    </ErrorBoundary>
  );
}