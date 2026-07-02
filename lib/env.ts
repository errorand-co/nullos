/**
 * Centralised env access. Fails fast with a clear message at the call site
 * rather than producing a cryptic Supabase URL error deep in a request.
 *
 * IMPORTANT: NEXT_PUBLIC_ vars must be referenced directly (not via a dynamic
 * lookup) so Next.js can statically inline them into the client bundle.
 */

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  get GEMINI_API_KEY() {
    return process.env.GEMINI_API_KEY
  },
  get GOOGLE_CLIENT_ID() {
    return process.env.GOOGLE_CLIENT_ID
  },
  get GOOGLE_CLIENT_SECRET() {
    return process.env.GOOGLE_CLIENT_SECRET
  },
  get GOOGLE_REFRESH_TOKEN() {
    return process.env.GOOGLE_REFRESH_TOKEN
  },
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Fail fast on server-side if required public vars are missing.
function validateServerEnv() {
  if (typeof window === "undefined") {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error(
        "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL. Set it in .env.local or your deployment platform.",
      )
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error(
        "Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY. Set it in .env.local or your deployment platform.",
      )
    }
  }
}

validateServerEnv()