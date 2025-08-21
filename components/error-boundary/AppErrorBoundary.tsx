'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Send error to Sentry
    const errorId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        component: 'AppErrorBoundary',
        retryCount: this.state.retryCount.toString(),
      },
    });

    this.setState({
      errorInfo,
      errorId: typeof errorId === 'string' ? errorId : null,
    });
  }

  handleReset = () => {
    const { onReset } = this.props;
    
    // Track retry attempt
    if (this.state.error) {
      Sentry.addBreadcrumb({
        category: 'error-recovery',
        message: 'User attempted error recovery',
        level: 'info',
        data: {
          errorMessage: this.state.error.message,
          retryCount: this.state.retryCount + 1,
        },
      });
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: this.state.retryCount + 1,
    });

    if (onReset) {
      onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportIssue = () => {
    const subject = encodeURIComponent('Error Report');
    const body = encodeURIComponent(
      `Error ID: ${this.state.errorId || 'Unknown'}\n\nPlease describe what you were doing when the error occurred:\n\n`
    );
    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
  };

  render() {
    if (this.state.hasError) {
      const { fallback, showDetails = false } = this.props;
      const { error, errorInfo, errorId, retryCount } = this.state;

      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle>Something went wrong</CardTitle>
                  <CardDescription>
                    We've encountered an unexpected error. The issue has been reported to our team.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {errorId && (
                <Alert>
                  <AlertDescription>
                    <strong>Error ID:</strong> {errorId}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      Please reference this ID if you contact support
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              {retryCount > 2 && (
                <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
                  <AlertDescription>
                    Multiple retry attempts have failed. Please try refreshing the page or contact support if the issue persists.
                  </AlertDescription>
                </Alert>
              )}

              {showDetails && error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-auto">
                    <p><strong>Error:</strong> {error.message}</p>
                    {errorInfo && (
                      <pre className="mt-2 whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </CardContent>

            <CardFooter className="flex gap-2 flex-wrap">
              <Button onClick={this.handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
              <Button onClick={this.handleReportIssue} variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Report Issue
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}