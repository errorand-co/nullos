import { NextResponse } from "next/server"

import { sandboxSites } from "@/lib/seo-data"
import type { SandboxSite } from "@/lib/seo-types"
import { listWebsites, upsertWebsite } from "@/lib/website-store"

type WebsiteRequest = {
  name?: string
  url?: string
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message)
  }
  return "Unknown error."
}

export async function GET() {
  try {
    const result = await listWebsites()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as WebsiteRequest
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
    const savedSite = await upsertWebsite(site, "manual")

    return NextResponse.json({ site: savedSite })
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error),
      },
      { status: 500 }
    )
  }
}
