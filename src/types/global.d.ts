/**
 * Global type declarations for development and testing
 */

declare global {
  interface Window {
    // Supabase test functions
    runSupabaseDataTestSuite?: () => void;
    runSupabaseIntegrationTestSuite?: () => void;
    testTypeMapping?: () => void;
    SupabaseDataAccess?: Record<string, unknown>;
    runSupabaseTestSuite?: () => void;
    runSupabaseQueryTest?: () => void;
    testSupabase?: () => void;
  }
}

export {};
