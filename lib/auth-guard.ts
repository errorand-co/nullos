import { NextResponse } from "next/server"

import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server"

export async function requireAuthenticatedUser() {
  const supabase = await createSupabaseAuthServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      error: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
      user: null,
    }
  }

  return {
    error: null,
    user,
  }
}
