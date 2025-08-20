/**
 * @module ArchonConfig
 * @description Configuration for Archon KB and Agent services
 */

export const archonConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_ARCHON_API_URL || 'http://localhost:8000/api',
    wsUrl: process.env.NEXT_PUBLIC_ARCHON_WS_URL || 'ws://localhost:8000/ws',
    timeout: parseInt(process.env.AGENT_TIMEOUT_MS || '30000'),
    retries: parseInt(process.env.AGENT_MAX_RETRIES || '3'),
  },
  
  auth: {
    apiKey: process.env.NEXT_PUBLIC_ARCHON_API_KEY || process.env.ARCHON_API_KEY,
    serviceAccount: process.env.ARCHON_SERVICE_ACCOUNT,
    serviceSecret: process.env.ARCHON_SERVICE_SECRET,
  },
  
  cache: {
    enabled: process.env.NODE_ENV === 'production' || process.env.ENABLE_CACHE === 'true',
    ttl: parseInt(process.env.CACHE_TTL_SECONDS || '300'),
    redis: process.env.REDIS_URL,
    maxSize: parseInt(process.env.CACHE_MAX_SIZE_MB || '100'),
    strategy: (process.env.CACHE_STRATEGY || 'lru') as 'lru' | 'fifo',
  },
  
  deployment: {
    region: process.env.ARCHON_REGION || 'us-east-1',
    edge: process.env.VERCEL_EDGE === 'true',
    environment: process.env.NODE_ENV || 'development',
  },
  
  // Vercel Edge Function optimization
  edge: {
    // Minimize cold starts
    keepAlive: true,
    // Regional deployment
    regions: process.env.VERCEL_REGIONS?.split(',') || ['iad1', 'sfo1'],
  },
  
  // Agent-specific configuration
  agents: {
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_AGENTS || '5'),
    circuitBreaker: {
      threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5'),
      resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_MS || '60000'),
    },
  },
  
  // Healthcare-specific KB sources
  kbSources: {
    primary: 'file_2025_HC_Survey_FINAL_pdf_1755645523',
    compliance: 'file_2025_HC_Survey_FAQ_Cheat_Sheet_pdf_1755645746',
    analytics: 'file_Survey_Extract_data_8_19_2025_pdf_1755645739',
  },
  
  // Feature flags
  features: {
    streamingEnabled: process.env.ENABLE_STREAMING === 'true',
    agentInsights: process.env.ENABLE_AGENT_INSIGHTS !== 'false',
    kbSuggestions: process.env.ENABLE_KB_SUGGESTIONS !== 'false',
    complianceValidation: process.env.ENABLE_COMPLIANCE !== 'false',
  },
};

// Validate required configuration
export function validateConfig() {
  const errors: string[] = [];
  
  if (!archonConfig.api.baseUrl) {
    errors.push('ARCHON_API_URL is required');
  }
  
  if (!archonConfig.auth.apiKey && !archonConfig.auth.serviceAccount) {
    errors.push('Either ARCHON_API_KEY or ARCHON_SERVICE_ACCOUNT is required');
  }
  
  if (errors.length > 0) {
    console.error('Archon configuration errors:', errors);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid Archon configuration');
    }
  }
  
  return errors.length === 0;
}