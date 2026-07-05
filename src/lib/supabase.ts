import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client using the secret key: bypasses RLS, so it can read
// windows (whose opens_at must never reach the browser) and perform writes.
// Never import this from client components.
export function supabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY env vars"
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
