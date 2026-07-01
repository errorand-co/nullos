import { NextResponse } from "next/server"

import { requireUser } from "@/lib/auth"
import { listTrackedKeywords, createTrackedKeyword } from "@/lib/keyword-store"
import type { TrackedKeyword } from "@/lib/seo-types"

export async function GET(request: Request) {
  const auth = await requireUser()
  if (auth.error) return auth.error

  const url = new URL(request.url)
  const siteId = url.searchParams.get("siteId") || undefined

  try {
    const result = await listTrackedKeywords(auth.user!, siteId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth.error) return auth.error

  const body = (await request.json()) as {
    query?: string
    siteId?: string
    targetPosition?: number
    volume?: number
    difficulty?: TrackedKeyword["difficulty"]
  }

  const query = body.query?.trim()
  const siteId = body.siteId?.trim()

  if (!query || !siteId) {
    return NextResponse.json({ error: "query and siteId are required." }, { status: 400 })
  }

  const keyword: TrackedKeyword = {
    currentPosition: 0,
    dateAdded: new Date().toISOString().slice(0, 10),
    difficulty: body.difficulty || "Medium",
    id: `kw-${Date.now()}`,
    previousPosition: 0,
    query,
    siteId,
    status: "On Track",
    targetPosition: body.targetPosition || 3,
    volume: body.volume || 0,
  }

  try {
    const saved = await createTrackedKeyword(keyword, auth.user!.id)
    return NextResponse.json({ keyword: saved })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}