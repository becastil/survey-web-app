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
  
  // Edge-specific configuration
  integrations: [
    // Add edge-specific integrations here
  ],
  
  // Filtering
  ignoreErrors: [
    'Edge Function Timeout',
    'Edge Function Memory Limit',
  ],
  
  // Hooks
  beforeSend(event) {
    // Add edge context
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: 'edge',
      },
    };
    
    return event;
  },
});

// Export for use in other parts of the app
export { Sentry };