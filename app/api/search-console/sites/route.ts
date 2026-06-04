import { NextResponse } from "next/server"

import { hasSearchConsoleCredentials, listSearchConsoleSites } from "@/lib/search-console"

export async function GET() {
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
