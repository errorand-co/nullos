import { NextResponse } from "next/server"

import { isSupabaseConfigured } from "@/lib/env"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

/** Get the authenticated user, or null if not signed in / Supabase not configured. */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** Require a user for API route handlers. Returns 401 if unauthenticated. */
export async function requireUser(): Promise<{
  error: Response | null
  user: User | null
}> {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
      user: null,
    }
  }

  return { error: null, user }
}