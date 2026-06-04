import { NextResponse } from "next/server"

import { fetchSearchConsoleSite, hasSearchConsoleCredentials } from "@/lib/search-console"
import { upsertWebsite } from "@/lib/website-store"

type SiteRequest = {
  siteUrl: string
}

export async function POST(request: Request) {
  try {
    if (!hasSearchConsoleCredentials()) {
      return NextResponse.json(
        {
          error: "Google Search Console credentials are not configured.",
        },
        { status: 400 }
      )
    }

    const body = (await request.json()) as SiteRequest

    if (!body.siteUrl) {
      return NextResponse.json({ error: "siteUrl is required." }, { status: 400 })
    }

    const site = await fetchSearchConsoleSite(body.siteUrl)

    try {
      await upsertWebsite(site, "gsc")
      return NextResponse.json({ persisted: true, site })
    } catch (error) {
      return NextResponse.json({
        persistenceError: getErrorMessage(error),
        persisted: false,
        site,
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error),
      },
      { status: 500 }
    )
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message)
  }
  return "Unknown error."
}
