import type { User } from "@supabase/supabase-js"

import { isSupabaseConfigured } from "@/lib/env"
import { sandboxSites } from "@/lib/seo-data"
import type {
  GscCountry,
  GscDevice,
  GscMetrics,
  GscPage,
  GscQuery,
  GscTrendPoint,
  SandboxSite,
} from "@/lib/seo-types"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type GscDailyRow = {
  clicks: number
  ctr: number
  date: string
  dimension_key: string
  dimension_type: string
  impressions: number
  position: number
  site_url: string
}

export type GscDataResult = {
  configured: boolean
  demo: boolean
  sites: SandboxSite[]
  missingTable?: boolean
}

// --- Helpers ---

function slugify(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "").replace(/[^a-z0-9]+/gi, "-")
}

function siteName(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^sc-domain:/, "").replace(/\/$/, "").replace(/^www\./, "")
}

function inferIntent(query: string): GscQuery["intent"] {
  const q = query.toLowerCase()
  if (q.match(/buy|price|cost|discount|deal|cheap|order|shop/)) return "Transactional"
  if (q.match(/best|review|compare|vs|alternative|top/)) return "Commercial"
  if (q.match(/login|sign in|dashboard|app|account/)) return "Navigational"
  return "Informational"
}

function getOpportunityScore(position: number, ctr: number): number {
  // High opportunity = high impressions but low position (page 2+)
  const positionScore = position >= 5 && position <= 20 ? 100 - position * 4 : 0
  const ctrScore = ctr < 3 ? 30 : 0
  return Math.min(100, Math.round(positionScore + ctrScore))
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

// --- Main: build sites from GSC time-series data ---

export async function listGscSites(user: User): Promise<GscDataResult> {
  if (!isSupabaseConfigured()) {
    return { configured: false, demo: true, sites: sandboxSites }
  }

  const supabase = await createSupabaseServerClient()

  // Get all distinct site_urls the user has data for
  const { data: allRows, error } = await supabase
    .from("gsc_daily_data")
    .select("*")
    .order("date", { ascending: false })

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return { configured: true, demo: true, sites: sandboxSites, missingTable: true }
    }
    return { configured: true, demo: true, sites: sandboxSites }
  }

  if (!allRows || allRows.length === 0) {
    return { configured: true, demo: true, sites: sandboxSites }
  }

  const rows = allRows as GscDailyRow[]

  // Group by site_url
  const siteUrls = [...new Set(rows.map((r) => r.site_url))]
  const sites = siteUrls.map((url) => buildSiteFromRows(url, rows.filter((r) => r.site_url === url)))

  return { configured: true, demo: false, sites }
}

function buildSiteFromRows(siteUrl: string, rows: GscDailyRow[]): SandboxSite {
  // Get the two most recent dates for comparison
  const dates = [...new Set(rows.map((r) => r.date))].sort().reverse()
  const latestDate = dates[0]
  const previousDate = dates[1] || dates[0]

  const latestRows = rows.filter((r) => r.date === latestDate)
  const previousRows = rows.filter((r) => r.date === previousDate)

  // --- Totals ---
  const totals = latestRows.find((r) => r.dimension_type === "totals")
  const prevTotals = previousRows.find((r) => r.dimension_type === "totals") || totals

  const metrics: GscMetrics = {
    clicks: totals?.clicks || 0,
    impressions: totals?.impressions || 0,
    ctr: totals?.ctr || 0,
    position: totals?.position || 0,
    clicksChange: percentChange(totals?.clicks || 0, prevTotals?.clicks || 0),
    impressionsChange: percentChange(totals?.impressions || 0, prevTotals?.impressions || 0),
    ctrChange: Number(((totals?.ctr || 0) - (prevTotals?.ctr || 0)).toFixed(2)),
    positionChange: Number(((totals?.position || 0) - (prevTotals?.position || 0)).toFixed(1)),
  }

  // --- Queries ---
  const queryRows = latestRows
    .filter((r) => r.dimension_type === "query")
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 25)

  const prevQueryRows = previousRows.filter((r) => r.dimension_type === "query")
  const queries: GscQuery[] = queryRows.map((r) => {
    const prev = prevQueryRows.find((pr) => pr.dimension_key === r.dimension_key)
    return {
      query: r.dimension_key,
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
      previousClicks: prev?.clicks || 0,
      previousImpressions: prev?.impressions || 0,
      intent: inferIntent(r.dimension_key),
      opportunityScore: getOpportunityScore(r.position, r.ctr),
    }
  })

  // --- Pages ---
  const pageRows = latestRows
    .filter((r) => r.dimension_type === "page")
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 25)

  const pages: GscPage[] = pageRows.map((r) => ({
    url: r.dimension_key,
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
    primaryKeyword: r.dimension_key.split("/").pop() || r.dimension_key,
  }))

  // --- Countries ---
  const countryRows = latestRows
    .filter((r) => r.dimension_type === "country")
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 15)

  const countries: GscCountry[] = countryRows.map((r) => ({
    code: r.dimension_key,
    name: r.dimension_key,
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }))

  // --- Devices ---
  const deviceRows = latestRows
    .filter((r) => r.dimension_type === "device")
    .sort((a, b) => b.clicks - a.clicks)

  const devices: GscDevice[] = deviceRows.map((r) => ({
    device: r.dimension_key as GscDevice["device"],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }))

  // --- Trends (daily totals over time) ---
  const trendDates = dates.reverse().slice(-30) // last 30 days
  const trends: GscTrendPoint[] = trendDates.map((date) => {
    const dayTotals = rows.find((r) => r.date === date && r.dimension_type === "totals")
    return {
      date,
      clicks: dayTotals?.clicks || 0,
      impressions: dayTotals?.impressions || 0,
      ctr: dayTotals?.ctr || 0,
      position: dayTotals?.position || 0,
    }
  })

  return {
    id: slugify(siteUrl),
    name: siteName(siteUrl),
    url: siteUrl,
    sector: "Search Console",
    audience: "Organic Search",
    metrics,
    queries,
    pages,
    countries,
    devices,
    trends,
  }
}