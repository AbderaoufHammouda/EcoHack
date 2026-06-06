import { createClient } from "@supabase/supabase-js";

// Trim trailing slash — Supabase appends /auth/v1/... internally,
// a stray "/" causes "Invalid path specified in request URL" on Vercel.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string)?.replace(/^["']|["']$/g, '').trim().replace(/\/+$/, "");
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.replace(/^["']|["']$/g, '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
