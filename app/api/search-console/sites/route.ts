import { NextResponse } from "next/server"

import { requireUser } from "@/lib/auth"
import { hasSearchConsoleCredentials, listSearchConsoleSites } from "@/lib/search-console"

export async function GET() {
  const auth = await requireUser()
  if (auth.error) return auth.error

  if (!hasSearchConsoleCredentials()) {
    return NextResponse.json({ configured: false, sites: [] })
  }

  try {
    const sites = await listSearchConsoleSites()
    return NextResponse.json({ configured: true, sites })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}