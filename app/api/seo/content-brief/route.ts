import { NextResponse } from "next/server"

import { requireUser } from "@/lib/auth"
import { getOfflineBrief } from "@/lib/seo-ai"

export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth.error) return auth.error

  const body = (await request.json()) as { keyword: string; position: number; ctr: number }

  // Content brief is deterministic (no AI needed) — uses the offline template.
  return NextResponse.json({
    result: getOfflineBrief(body.keyword, body.position, body.ctr),
    source: "offline",
  })
}