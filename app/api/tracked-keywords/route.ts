import { NextResponse } from "next/server"

import { requireAuthenticatedUser } from "@/lib/auth-guard"
import { createTrackedKeyword, listTrackedKeywords } from "@/lib/tracked-keyword-store"
import type { TrackedKeyword } from "@/lib/seo-types"

type CreateRequest = {
  difficulty: TrackedKeyword["difficulty"]
  query: string
  siteId: string
  targetPosition: number
  volume: number
}

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser()
  if (auth.error) return auth.error

  const url = new URL(request.url)
  const siteId = url.searchParams.get("siteId") || undefined

  try {
    const result = await listTrackedKeywords(siteId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser()
  if (auth.error) return auth.error

  const body = (await request.json()) as CreateRequest

  if (!body.query?.trim() || !body.siteId) {
    return NextResponse.json({ error: "query and siteId are required." }, { status: 400 })
  }

  const currentPosition = Number((1.5 + Math.random() * 20).toFixed(1))
  const previousPosition = Number((currentPosition + Math.random() * 4 - 2).toFixed(1))
  const status =
    currentPosition <= body.targetPosition
      ? "On Track"
      : currentPosition > body.targetPosition + 10
        ? "Critical"
        : "Needs Attention"
  const keyword: TrackedKeyword = {
    currentPosition,
    dateAdded: new Date().toISOString().slice(0, 10),
    difficulty: body.difficulty,
    id: `${body.siteId}-${Date.now()}`,
    previousPosition,
    query: body.query.trim(),
    siteId: body.siteId,
    status,
    targetPosition: body.targetPosition,
    volume: body.volume,
  }

  try {
    const savedKeyword = await createTrackedKeyword(keyword)
    return NextResponse.json({ keyword: savedKeyword })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message)
  }
  return "Unknown error."
}
