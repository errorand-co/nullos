import { NextResponse } from "next/server"

import { requireUser } from "@/lib/auth"
import { getOfflineStrategy } from "@/lib/seo-ai"
import type { GscQuery } from "@/lib/seo-types"

export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth.error) return auth.error

  const body = (await request.json()) as { queries: GscQuery[] }

  // Strategy is deterministic (no AI needed) — uses the offline template.
  return NextResponse.json({ result: getOfflineStrategy(body.queries), source: "offline" })
}