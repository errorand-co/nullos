import { NextResponse } from "next/server"

import { requireAuthenticatedUser } from "@/lib/auth-guard"
import { hasSearchConsoleCredentials } from "@/lib/search-console"

export async function GET() {
  const auth = await requireAuthenticatedUser()
  if (auth.error) return auth.error

  return NextResponse.json({
    configured: hasSearchConsoleCredentials(),
  })
}
