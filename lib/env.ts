/**
 * Centralised env access. Fails fast with a clear message at the call site
 * rather than producing a cryptic Supabase URL error deep in a request.
 */
function required(name: string, fallback?: string): string {
  const value = process.env[name] || fallback
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Set it in .env.local or your deployment platform.`,
    )
  }
  return value
}

export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return required("NEXT_PUBLIC_SUPABASE_URL")
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  },
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
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}