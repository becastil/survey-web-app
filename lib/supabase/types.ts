/**
 * Mock Supabase client types for development mode
 */

export interface MockSupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export interface MockSupabaseAuthResponse {
  data: {
    user: MockSupabaseUser | null;
  };
  error: Error | null;
}

export interface MockSupabaseDataResponse<T = unknown> {
  data: T | null;
  error: Error | null;
}

export interface MockSupabaseQueryBuilder<T = unknown> {
  select: (columns?: string) => Promise<MockSupabaseDataResponse<T[]>>;
  insert: (data: Partial<T> | Partial<T>[]) => Promise<MockSupabaseDataResponse<T>>;
  update: (data: Partial<T>) => Promise<MockSupabaseDataResponse<T>>;
  delete: () => Promise<MockSupabaseDataResponse<null>>;
  eq: (column: string, value: unknown) => MockSupabaseQueryBuilder<T>;
  single: () => Promise<MockSupabaseDataResponse<T>>;
}

export interface MockSupabaseAuth {
  getUser: () => Promise<MockSupabaseAuthResponse>;
  exchangeCodeForSession: (code: string) => Promise<MockSupabaseDataResponse<unknown>>;
  signInWithPassword: (credentials: { 
    email: string; 
    password: string; 
  }) => Promise<MockSupabaseDataResponse<unknown>>;
  signUp: (credentials: { 
    email: string; 
    password: string; 
  }) => Promise<MockSupabaseDataResponse<unknown>>;
  signOut: () => Promise<{ error: Error | null }>;
}

export interface MockSupabaseClient {
  auth: MockSupabaseAuth;
  from: <T = unknown>(table: string) => MockSupabaseQueryBuilder<T>;
}

// Type guard to check if we're using mock client
export function isMockClient(client: unknown): client is MockSupabaseClient {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || 
         !process.env.NEXT_PUBLIC_SUPABASE_URL;
}