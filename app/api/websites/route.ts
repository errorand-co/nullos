import { NextResponse } from "next/server"

import { requireUser } from "@/lib/auth"
import { listGscSites } from "@/lib/gsc-store"

export async function GET() {
  const auth = await requireUser()
  if (auth.error) return auth.error

  try {
    const result = await listGscSites(auth.user!)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}