import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment configuration
  environment,
  enabled: environment !== 'development',
  
  // Performance Monitoring
  tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Server-specific integrations
  integrations: [
    // HTTP integration for automatic instrumentation
    Sentry.httpIntegration({
      tracing: true,
      breadcrumbs: true,
    }),
    
    // Prisma integration if using Prisma
    // Sentry.prismaIntegration(),
  ],
  
  // Filtering
  ignoreErrors: [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNRESET',
  ],
  
  // Hooks
  beforeSend(event, hint) {
    // Add server context
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: 'node',
        version: process.version,
      },
      server: {
        host: process.env.VERCEL_URL || 'localhost',
        region: process.env.VERCEL_REGION || 'local',
      },
    };
    
    // Filter out health check errors
    if (event.request?.url?.includes('/api/health')) {
      return null;
    }
    
    return event;
  },
  
  // Custom error processing
  beforeBreadcrumb(breadcrumb) {
    // Filter out sensitive server data
    if (breadcrumb.data?.headers) {
      delete breadcrumb.data.headers.authorization;
      delete breadcrumb.data.headers.cookie;
      delete breadcrumb.data.headers['x-api-key'];
    }
    
    return breadcrumb;
  },
});

// Export for use in other parts of the app
export { Sentry };