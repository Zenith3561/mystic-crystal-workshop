import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Anon-key client. Read-only in practice: row level security only lets it
 * see the catalogue. Safe to build on the server or in the browser.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}
