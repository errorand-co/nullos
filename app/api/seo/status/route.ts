import { NextResponse } from "next/server"

import { requireAuthenticatedUser } from "@/lib/auth-guard"

export async function GET() {
  const auth = await requireAuthenticatedUser()
  if (auth.error) return auth.error

  return NextResponse.json({ hasApiKey: Boolean(process.env.GEMINI_API_KEY) })
}
