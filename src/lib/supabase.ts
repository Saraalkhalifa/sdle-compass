import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Only the public anon key belongs here — NEVER the service role key.
// Fallback values are safe to commit: anon key is a public-facing credential
// protected by Supabase Row Level Security.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
  || 'https://bzyamwzrzpabsmrfbapv.supabase.co';
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()
  || 'sb_publishable_05z12T9Id-u_v3ZsxAQI_w__pHeiwIS';

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
