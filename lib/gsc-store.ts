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
  return url.replace(/^https?:\/\//, "").replace(/^sc-domain:/, "").replace(/\/$/, "").replace(/[^a-z0-9]+/gi, "-")
}

function siteName(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^sc-domain:/, "").replace(/\/$/, "").replace(/^www\./, "")
}

function dateMinusDays(dateStr: string, days: number): string {
  // Handle both "2026-06-29" and "2026-06-29T17:00:00.000Z" formats
  const dateOnly = dateStr.split("T")[0]
  const d = new Date(dateOnly + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}
function inferIntent(query: string): GscQuery["intent"] {
  const q = query.toLowerCase()
  if (q.match(/buy|price|cost|discount|deal|cheap|order|shop/)) return "Transactional"
  if (q.match(/best|review|compare|vs|alternative|top/)) return "Commercial"
  if (q.match(/login|sign in|dashboard|app|account/)) return "Navigational"
  return "Informational"
}

function getOpportunityScore(position: number, ctr: number): number {
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

  const siteUrls = [...new Set(rows.map((r) => r.site_url))]
  const sites = siteUrls.map((url) => buildSiteFromRows(url, rows.filter((r) => r.site_url === url)))

  return { configured: true, demo: false, sites }
}

function buildSiteFromRows(siteUrl: string, rows: GscDailyRow[]): SandboxSite {
  // Daily totals rows (one per date)
  const dailyRows = rows.filter((r) => r.dimension_type === "daily_totals")
  const dates = [...new Set(dailyRows.map((r) => r.date))].sort().reverse()
  const latestDate = dates[0]

  // Current period: last 28 days from latestDate (string comparison)
  const currentEnd = latestDate
  const currentStart = dateMinusDays(latestDate, 27)
  const previousEnd = dateMinusDays(currentStart, 1)
  const previousStart = dateMinusDays(previousEnd, 27)

  const inRange = (dateStr: string, start: string, end: string) => dateStr >= start && dateStr <= end

  const currentDaily = dailyRows.filter((r) => inRange(r.date, currentStart, currentEnd))
  const previousDaily = dailyRows.filter((r) => inRange(r.date, previousStart, previousEnd))

  // --- Metrics: sum current period vs previous period ---
  const currentClicks = currentDaily.reduce((s, r) => s + r.clicks, 0)
  const currentImpressions = currentDaily.reduce((s, r) => s + r.impressions, 0)
  const currentCtr = currentImpressions > 0 ? (currentClicks / currentImpressions) * 100 : 0
  const currentPosition =
    currentDaily.length > 0
      ? currentDaily.reduce((s, r) => s + r.position, 0) / currentDaily.length
      : 0

  const previousClicks = previousDaily.reduce((s, r) => s + r.clicks, 0)
  const previousImpressions = previousDaily.reduce((s, r) => s + r.impressions, 0)
  const previousCtr = previousImpressions > 0 ? (previousClicks / previousImpressions) * 100 : 0
  const previousPosition =
    previousDaily.length > 0
      ? previousDaily.reduce((s, r) => s + r.position, 0) / previousDaily.length
      : 0

  const metrics: GscMetrics = {
    clicks: currentClicks,
    impressions: currentImpressions,
    ctr: Number(currentCtr.toFixed(2)),
    position: Number(currentPosition.toFixed(1)),
    clicksChange: percentChange(currentClicks, previousClicks),
    impressionsChange: percentChange(currentImpressions, previousImpressions),
    ctrChange: Number((currentCtr - previousCtr).toFixed(2)),
    positionChange: Number((currentPosition - previousPosition).toFixed(1)),
  }

  // --- Queries: from current period, look up previous for comparison ---
  const queryRows = rows
    .filter((r) => r.dimension_type === "query" && inRange(r.date, currentStart, currentEnd))
    // Aggregate by dimension_key (sum across days in current period)
  const queryAgg = aggregateByDimension(queryRows)

  // For comparison, get queries from the previous period
  const prevQueryRows = rows.filter(
    (r) => r.dimension_type === "query" && inRange(r.date, previousStart, previousEnd),
  )
  const prevQueryAgg = aggregateByDimension(prevQueryRows)

  const queries: GscQuery[] = queryAgg
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 25)
    .map((q) => {
      const prev = prevQueryAgg.find((p) => p.dimension_key === q.dimension_key)
      return {
        query: q.dimension_key,
        clicks: q.clicks,
        impressions: q.impressions,
        ctr: q.impressions > 0 ? Number(((q.clicks / q.impressions) * 100).toFixed(2)) : 0,
        position: q.position,
        previousClicks: prev?.clicks || 0,
        previousImpressions: prev?.impressions || 0,
        intent: inferIntent(q.dimension_key),
        opportunityScore: getOpportunityScore(q.position, q.ctr),
      }
    })

  // --- Pages ---
  const pageRows = rows.filter(
    (r) => r.dimension_type === "page" && inRange(r.date, currentStart, currentEnd),
  )
  const pageAgg = aggregateByDimension(pageRows)

  const pages: GscPage[] = pageAgg
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 25)
    .map((p) => ({
      url: p.dimension_key,
      clicks: p.clicks,
      impressions: p.impressions,
      ctr: p.impressions > 0 ? Number(((p.clicks / p.impressions) * 100).toFixed(2)) : 0,
      position: p.position,
      primaryKeyword: p.dimension_key.split("/").pop() || p.dimension_key,
    }))

  // --- Countries ---
  const countryRows = rows.filter(
    (r) => r.dimension_type === "country" && inRange(r.date, currentStart, currentEnd),
  )
  const countryAgg = aggregateByDimension(countryRows)

  const countries: GscCountry[] = countryAgg
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 15)
    .map((c) => ({
      code: c.dimension_key,
      name: c.dimension_key,
      clicks: c.clicks,
      impressions: c.impressions,
      ctr: c.impressions > 0 ? Number(((c.clicks / c.impressions) * 100).toFixed(2)) : 0,
      position: c.position,
    }))

  // --- Devices ---
  const deviceRows = rows.filter(
    (r) => r.dimension_type === "device" && inRange(r.date, currentStart, currentEnd),
  )
  const deviceAgg = aggregateByDimension(deviceRows)

  const devices: GscDevice[] = deviceAgg
    .sort((a, b) => b.clicks - a.clicks)
    .map((d) => ({
      device: d.dimension_key as GscDevice["device"],
      clicks: d.clicks,
      impressions: d.impressions,
      ctr: d.impressions > 0 ? Number(((d.clicks / d.impressions) * 100).toFixed(2)) : 0,
      position: d.position,
    }))

  // --- Trends: all available days, daily clicks/impressions ---
  const trends: GscTrendPoint[] = dates
    .reverse()
    .map((date) => {
      const day = dailyRows.find((r) => r.date === date)
      return {
        date,
        clicks: day?.clicks || 0,
        impressions: day?.impressions || 0,
        ctr: day?.ctr || 0,
        position: day?.position || 0,
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

// Aggregate rows by dimension_key: sum clicks/impressions, weighted average position
function aggregateByDimension(rows: GscDailyRow[]) {
  const map = new Map<
    string,
    { dimension_key: string; clicks: number; impressions: number; position: number; ctr: number }
  >()
  for (const row of rows) {
    const existing = map.get(row.dimension_key)
    if (existing) {
      existing.clicks += row.clicks
      existing.impressions += row.impressions
      // Weighted average position by impressions
      const totalImpressions = existing.impressions
      existing.position =
        (existing.position * (totalImpressions - row.impressions) + row.position * row.impressions) /
        totalImpressions
    } else {
      map.set(row.dimension_key, {
        dimension_key: row.dimension_key,
        clicks: row.clicks,
        impressions: row.impressions,
        position: row.position,
        ctr: row.ctr,
      })
    }
  }
  return Array.from(map.values()).map((v) => ({
    ...v,
    position: Number(v.position.toFixed(2)),
  }))
}