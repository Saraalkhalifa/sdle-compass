import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Only the public anon key belongs here — NEVER the service role key.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const isSupabaseConfigured = !!(url && key);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
