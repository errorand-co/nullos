import { NextResponse } from "next/server"

import { requireAuthenticatedUser } from "@/lib/auth-guard"
import { hasSearchConsoleCredentials, listSearchConsoleSites } from "@/lib/search-console"

export async function GET() {
  const auth = await requireAuthenticatedUser()
  if (auth.error) return auth.error

  if (!hasSearchConsoleCredentials()) {
    return NextResponse.json({
      configured: false,
      sites: [],
    })
  }

  const sites = await listSearchConsoleSites()

  return NextResponse.json({
    configured: true,
    sites,
  })
}
