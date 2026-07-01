import { NextResponse } from "next/server"

import { requireUser } from "@/lib/auth"
import { hasSearchConsoleCredentials } from "@/lib/search-console"

export async function GET() {
  const auth = await requireUser()
  if (auth.error) return auth.error

  return NextResponse.json({ configured: hasSearchConsoleCredentials() })
}