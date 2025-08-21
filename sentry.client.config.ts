import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development';

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment configuration
  environment,
  enabled: environment !== 'development', // Disable in development
  
  // Performance Monitoring
  tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Integrations
  integrations: [
    // Replay integration for session replay
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
      maskAllInputs: true, // Mask sensitive input data
    }),
    
    // Browser tracing for performance monitoring
    Sentry.browserTracingIntegration(),
    
    // Console breadcrumbs
    Sentry.breadcrumbsIntegration({
      console: true,
      dom: true,
      fetch: true,
      history: true,
      xhr: true,
    }),
  ],
  
  // Filtering
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    
    // Network errors
    'Network request failed',
    'NetworkError',
    'Failed to fetch',
    
    // User actions
    'User cancelled',
    'User denied',
  ],
  
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    
    // Other browser extensions
    /^moz-extension:\/\//i,
    /^ms-browser-extension:\/\//i,
  ],
  
  // Hooks
  beforeSend(event, hint) {
    // Filter out certain errors in production
    if (environment === 'production') {
      // Don't send events without an error
      if (!hint.originalException) {
        return null;
      }
      
      // Add user context if available
      const user = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('user') || '{}')
        : null;
        
      if (user?.id) {
        event.user = {
          id: user.id,
          email: user.email,
        };
      }
    }
    
    // Add custom context
    event.extra = {
      ...event.extra,
      timestamp: new Date().toISOString(),
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight,
      } : null,
    };
    
    return event;
  },
  
  // Custom error processing
  beforeBreadcrumb(breadcrumb) {
    // Filter out sensitive data from breadcrumbs
    if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
      // Remove auth headers from breadcrumbs
      if (breadcrumb.data?.headers) {
        delete breadcrumb.data.headers.authorization;
        delete breadcrumb.data.headers.cookie;
      }
    }
    
    return breadcrumb;
  },
});

// Export for use in other parts of the app
export { Sentry };