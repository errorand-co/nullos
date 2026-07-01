import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { env } from "@/lib/env"

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Cookie-based session — the user's JWT is read from the request cookies.
 * RLS enforces per-user data isolation; no service-role key needed.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Components can't set cookies. Route Handlers and Server Actions can.
        }
      },
    },
  })
}