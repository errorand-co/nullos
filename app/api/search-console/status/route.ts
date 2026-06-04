import { NextResponse } from "next/server"

import { hasSearchConsoleCredentials } from "@/lib/search-console"

export function GET() {
  return NextResponse.json({
    configured: hasSearchConsoleCredentials(),
  })
}
