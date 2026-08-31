import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Anon-key client for reading the catalogue. Row level security is what
 * keeps it read-only.
 *
 * The variables are deliberately NOT named NEXT_PUBLIC_*: nothing in the
 * browser bundle uses them, and a NEXT_PUBLIC_ name would be frozen into
 * the build, which happens in Docker before the server's environment
 * exists. Plain names are read at runtime instead.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}
