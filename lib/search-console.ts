import { google } from "googleapis"

import type {
  GscCountry,
  GscDevice,
  GscMetrics,
  GscPage,
  GscQuery,
  GscTrendPoint,
  SandboxSite,
} from "@/lib/seo-types"

type SearchAnalyticsRow = {
  keys?: string[] | null
  clicks?: number | null
  impressions?: number | null
  ctr?: number | null
  position?: number | null
}

type DateRange = {
  endDate: string
  startDate: string
}

export function hasSearchConsoleCredentials() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
  )
}

export async function listSearchConsoleSites() {
  const searchConsole = getSearchConsoleClient()
  const response = await searchConsole.sites.list()

  return (response.data.siteEntry || [])
    .filter((site) => site.siteUrl)
    .map((site) => ({
      permissionLevel: site.permissionLevel || "unknown",
      siteUrl: site.siteUrl as string,
    }))
}

export async function fetchSearchConsoleSite(siteUrl: string): Promise<SandboxSite> {
  const importWindow = await findImportWindow(siteUrl)
  const dateRange = getLastNDaysRange(importWindow)
  const previousRange = getPreviousNDaysRange(importWindow)
  const [currentTotals, previousTotals, queries, pages, countries, devices, trends] = await Promise.all([
    fetchRows(siteUrl, dateRange, []),
    fetchRows(siteUrl, previousRange, []),
    fetchRows(siteUrl, dateRange, ["query"], 25),
    fetchRows(siteUrl, dateRange, ["page"], 20),
    fetchRows(siteUrl, dateRange, ["country"], 20),
    fetchRows(siteUrl, dateRange, ["device"], 10),
    fetchRows(siteUrl, dateRange, ["date"], importWindow),
  ])

  const current = aggregateRows(currentTotals)
  const previous = aggregateRows(previousTotals)
  const metrics = toMetrics(current, previous)
  const hostname = siteUrl.replace(/^sc-domain:/, "").replace(/^https?:\/\//, "").replace(/\/$/, "")

  return {
    id: slugify(hostname),
    name: hostname,
    url: siteUrl,
    sector: `Google Search Console Property (${importWindow} days)`,
    audience: "Organic Search Users",
    metrics,
    queries: withFallback(queries.map(toQuery), []),
    pages: withFallback(pages.map(toPage), []),
    countries: withFallback(countries.map(toCountry), []),
    devices: withFallback(devices.map(toDevice), [
      { clicks: 0, ctr: 0, device: "Desktop", impressions: 0, position: 0 },
      { clicks: 0, ctr: 0, device: "Mobile", impressions: 0, position: 0 },
      { clicks: 0, ctr: 0, device: "Tablet", impressions: 0, position: 0 },
    ]),
    trends: withFallback(trends.map(toTrendPoint), [
      { clicks: 0, ctr: 0, date: "D 01", impressions: 0, position: 0 },
      { clicks: 0, ctr: 0, date: "D 28", impressions: 0, position: 0 },
    ]),
  }
}

async function findImportWindow(siteUrl: string) {
  for (const days of [28, 90, 180]) {
    const rows = await fetchRows(siteUrl, getLastNDaysRange(days), [], 1)
    if (rows.length) return days
  }

  return 28
}

function withFallback<T>(items: T[], fallback: T[]) {
  return items.length ? items : fallback
}

function getSearchConsoleClient() {
  if (!hasSearchConsoleCredentials()) {
    throw new Error("Missing Google Search Console OAuth credentials.")
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

  return google.searchconsole({ auth, version: "v1" })
}

async function fetchRows(siteUrl: string, range: DateRange, dimensions: string[], rowLimit = 1000) {
  const searchConsole = getSearchConsoleClient()
  const response = await searchConsole.searchanalytics.query({
    requestBody: {
      dimensions,
      endDate: range.endDate,
      rowLimit,
      startDate: range.startDate,
    },
    siteUrl,
  })

  return (response.data.rows || []) as SearchAnalyticsRow[]
}

function aggregateRows(rows: SearchAnalyticsRow[]) {
  const totals = rows.reduce<{
    clicks: number
    impressions: number
    positionNumerator: number
  }>(
    (acc, row) => ({
      clicks: acc.clicks + (row.clicks || 0),
      impressions: acc.impressions + (row.impressions || 0),
      positionNumerator: acc.positionNumerator + (row.position || 0) * (row.impressions || 0),
    }),
    { clicks: 0, impressions: 0, positionNumerator: 0 }
  )

  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
  const position = totals.impressions > 0 ? totals.positionNumerator / totals.impressions : 0

  return {
    clicks: totals.clicks,
    ctr,
    impressions: totals.impressions,
    position,
  }
}

function toMetrics(current: ReturnType<typeof aggregateRows>, previous: ReturnType<typeof aggregateRows>): GscMetrics {
  return {
    clicks: Math.round(current.clicks),
    clicksChange: percentChange(current.clicks, previous.clicks),
    ctr: current.ctr,
    ctrChange: current.ctr - previous.ctr,
    impressions: Math.round(current.impressions),
    impressionsChange: percentChange(current.impressions, previous.impressions),
    position: current.position,
    positionChange: current.position - previous.position,
  }
}

function toQuery(row: SearchAnalyticsRow): GscQuery {
  const clicks = Math.round(row.clicks || 0)
  const impressions = Math.round(row.impressions || 0)
  const position = row.position || 0

  return {
    clicks,
    ctr: (row.ctr || 0) * 100,
    impressions,
    intent: inferIntent(row.keys?.[0] || ""),
    opportunityScore: getOpportunityScore(position, row.ctr || 0),
    position,
    previousClicks: clicks,
    previousImpressions: impressions,
    query: row.keys?.[0] || "(not provided)",
  }
}

function toPage(row: SearchAnalyticsRow): GscPage {
  return {
    clicks: Math.round(row.clicks || 0),
    ctr: (row.ctr || 0) * 100,
    impressions: Math.round(row.impressions || 0),
    position: row.position || 0,
    primaryKeyword: "organic landing page",
    url: row.keys?.[0] || "",
  }
}

function toCountry(row: SearchAnalyticsRow): GscCountry {
  const code = (row.keys?.[0] || "unknown").toUpperCase()

  return {
    clicks: Math.round(row.clicks || 0),
    code,
    ctr: (row.ctr || 0) * 100,
    impressions: Math.round(row.impressions || 0),
    name: code,
    position: row.position || 0,
  }
}

function toDevice(row: SearchAnalyticsRow): GscDevice {
  const device = toDeviceName(row.keys?.[0] || "")

  return {
    clicks: Math.round(row.clicks || 0),
    ctr: (row.ctr || 0) * 100,
    device,
    impressions: Math.round(row.impressions || 0),
    position: row.position || 0,
  }
}

function toTrendPoint(row: SearchAnalyticsRow): GscTrendPoint {
  return {
    clicks: Math.round(row.clicks || 0),
    ctr: (row.ctr || 0) * 100,
    date: row.keys?.[0] || "",
    impressions: Math.round(row.impressions || 0),
    position: row.position || 0,
  }
}

function getLastNDaysRange(days: number): DateRange {
  const end = new Date()
  end.setDate(end.getDate() - 1)
  const start = new Date(end)
  start.setDate(start.getDate() - days + 1)

  return {
    endDate: toDateString(end),
    startDate: toDateString(start),
  }
}

function getPreviousNDaysRange(days: number): DateRange {
  const end = new Date()
  end.setDate(end.getDate() - days - 1)
  const start = new Date(end)
  start.setDate(start.getDate() - days + 1)

  return {
    endDate: toDateString(end),
    startDate: toDateString(start),
  }
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

function percentChange(current: number, previous: number) {
  if (!previous) return current ? 100 : 0
  return ((current - previous) / previous) * 100
}

function inferIntent(query: string): GscQuery["intent"] {
  const normalized = query.toLowerCase()
  if (/\b(buy|pricing|price|order|trial|demo)\b/.test(normalized)) return "Transactional"
  if (/\b(best|review|compare|vs|alternative)\b/.test(normalized)) return "Commercial"
  if (/\b(login|brand|support|contact)\b/.test(normalized)) return "Navigational"
  return "Informational"
}

function getOpportunityScore(position: number, ctr: number) {
  const positionScore = Math.max(0, Math.min(100, (20 - position) * 5))
  const ctrPenalty = Math.max(0, 20 - ctr * 100)
  return Math.round(Math.max(0, Math.min(100, positionScore + ctrPenalty)))
}

function toDeviceName(device: string): GscDevice["device"] {
  const normalized = device.toLowerCase()
  if (normalized.includes("mobile")) return "Mobile"
  if (normalized.includes("tablet")) return "Tablet"
  return "Desktop"
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}
