import { NextResponse } from "next/server"

import { requireUser } from "@/lib/auth"
import { fetchSearchConsoleSite } from "@/lib/search-console"
import { upsertWebsite } from "@/lib/website-store"

export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth.error) return auth.error

  const body = (await request.json()) as { siteUrl?: string }
  const siteUrl = body.siteUrl?.trim()

  if (!siteUrl) {
    return NextResponse.json({ error: "siteUrl is required." }, { status: 400 })
  }

  try {
    const site = await fetchSearchConsoleSite(siteUrl)

    try {
      await upsertWebsite(site, auth.user!.id, "gsc")
    } catch {
      // Persistence failure shouldn't block the import result.
    }

    return NextResponse.json({ site, persisted: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}