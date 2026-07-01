import { NextResponse } from "next/server"

import { requireUser } from "@/lib/auth"
import { sandboxSites } from "@/lib/seo-data"
import type { SandboxSite } from "@/lib/seo-types"
import { listWebsites, upsertWebsite } from "@/lib/website-store"

export async function GET() {
  const auth = await requireUser()
  if (auth.error) return auth.error

  try {
    const result = await listWebsites(auth.user!)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth.error) return auth.error

  const body = (await request.json()) as { name?: string; url?: string }
  const name = body.name?.trim()
  const url = body.url?.trim()

  if (!name || !url) {
    return NextResponse.json({ error: "name and url are required." }, { status: 400 })
  }

  const baseSite = sandboxSites[0]
  const site: SandboxSite = {
    ...baseSite,
    audience: "SEO Managers, Growth Teams",
    id: `website-${Date.now()}`,
    name,
    sector: "New Organic Search Property",
    url,
  }

  try {
    const saved = await upsertWebsite(site, auth.user!.id)
    return NextResponse.json({ site: saved })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}