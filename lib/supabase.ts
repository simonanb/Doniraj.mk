import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Singleton — prevents multiple instances fighting over the auth lock
let instance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!instance) {
    instance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        // Bypass the cross-tab storage lock — it causes "lock was stolen" errors when
        // multiple requests fire concurrently in the same tab during startup.
        // Single-tab apps don't need cross-tab locking; token refresh is still safe.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lock: (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => fn(),
      },
    });
  }
  return instance;
}

export const supabase = getSupabase();
