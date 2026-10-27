import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ [Supabase Config Error]: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing!\n' +
    'Check your .env file and ensure both keys start with VITE_ and Vite dev server is restarted.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  }
);

/**
 * Senior Diagnostic Health Check:
 * Run this in browser console via `window.testSupabase()` or on app mount
 * to immediately detect connection, latency, auth, or RLS table issues.
 */
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  authWorking: boolean;
  profilesTableAccessible: boolean;
  details: string;
}> {
  try {
    // 1. Check Auth service connectivity
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) {
      return {
        connected: false,
        authWorking: false,
        profilesTableAccessible: false,
        details: `Auth error: ${sessionErr.message}`,
      };
    }

    // 2. Check Database connectivity via profiles table
    const { error: dbErr } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (dbErr) {
      // 42P01 means table does not exist
      // 42501 means RLS blocked it (needs policy)
      return {
        connected: true,
        authWorking: true,
        profilesTableAccessible: false,
        details: `Database reachable, but profiles table error [${dbErr.code}]: ${dbErr.message}`,
      };
    }

    return {
      connected: true,
      authWorking: true,
      profilesTableAccessible: true,
      details: 'All systems operational: Auth & DB tables fully responding.',
    };
  } catch (err: any) {
    return {
      connected: false,
      authWorking: false,
      profilesTableAccessible: false,
      details: `Network/TLS failure: ${err?.message || err}`,
    };
  }
}

// Expose diagnostic tool to browser console for instant verification
if (typeof window !== 'undefined') {
  (window as any).testSupabase = async () => {
    console.log('🔍 Testing Supabase Connection...');
    const result = await checkSupabaseHealth();
    console.table(result);
    return result;
  };
}
