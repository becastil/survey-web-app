/**
 * Environment variable validation and type safety
 */

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value && !defaultValue) {
    console.warn(`Missing environment variable: ${key}`);
  }
  return value || '';
};

export const env = {
  // App Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_APP_NAME: getEnvVar('NEXT_PUBLIC_APP_NAME', 'Healthcare Survey Dashboard'),
  NEXT_PUBLIC_USE_MOCK_DATA: getEnvVar('NEXT_PUBLIC_USE_MOCK_DATA', 'true'),
  
  // Supabase Configuration (optional in mock mode)
  NEXT_PUBLIC_SUPABASE_URL: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', ''),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', ''),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', ''),
  
  // Vercel Configuration
  VERCEL_ENV: getEnvVar('VERCEL_ENV', 'development'),
  VERCEL_URL: getEnvVar('VERCEL_URL', ''),
  
  // Build Configuration
  SKIP_ENV_VALIDATION: getEnvVar('SKIP_ENV_VALIDATION', 'false'),
} as const;

// Type-safe environment variables
export type Env = typeof env;

// Validate required environment variables
export const validateEnv = () => {
  const useMockData = env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  
  if (!useMockData) {
    // In production mode, Supabase credentials are required
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error(
        'Supabase credentials are required when NEXT_PUBLIC_USE_MOCK_DATA is false. ' +
        'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }
  }
  
  return true;
};

// Skip validation during build if explicitly requested
if (env.SKIP_ENV_VALIDATION !== 'true' && typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    console.error('Environment validation failed:', error);
    if (env.NODE_ENV === 'production' && env.VERCEL_ENV === 'production') {
      throw error;
    }
  }
}