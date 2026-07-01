import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth"

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
      user: null as null | { username: string },
    }
  }

  return {
    error: null,
    user,
  }
}