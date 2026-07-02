import { notFound } from "next/navigation"

import { OverviewView } from "@/components/overview-view"
import { getCurrentUser } from "@/lib/auth"
import { aggregateByPeriod, listGscSites } from "@/lib/gsc-store"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{
  range?: string
  tab?: string
  agg?: string
  compare?: string
}>
export default async function SiteOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>
  searchParams: SearchParams
}) {
  const { siteId } = await params
  const { range = "28d", tab = "all", agg = "day", compare = "previous" } = await searchParams

  const user = await getCurrentUser()
  if (!user) notFound()

  const { sites } = await listGscSites(user)
  const site = sites.find((s) => s.id === siteId)
  if (!site) notFound()

  // Filter daily_totals by date range and aggregate by period
  const { start, end, previousStart, previousEnd } = getDateRange(range)

  const allRows = site.trends // all daily data points
  const filteredRows = allRows.filter((t) => t.date >= start && t.date <= end)
  const previousRows = allRows.filter(
    (t) => t.date >= previousStart && t.date <= previousEnd,
  )

  const filteredTrends = aggregateByPeriod(filteredRows, agg)
  const previousTrends = aggregateByPeriod(previousRows, agg)

  // Compute metrics from filtered data
  const metrics = computeMetrics(filteredRows, previousRows, compare)

  return (
    <OverviewView
      metrics={metrics}
      trends={filteredTrends}
      previousTrends={previousTrends}
      queries={site.queries}
      pages={site.pages}
      countries={site.countries}
      devices={site.devices}
      range={range}
      tab={tab}
      agg={agg}
      compare={compare}
      siteId={siteId}
    />
  )
}

function getDateRange(range: string): {
  start: string
  end: string
  previousStart: string
  previousEnd: string
} {
  // Always end at "today" — we use the most recent data date
  const end = new Date()
  const start = new Date(end)
  const days = range === "7d" ? 7 : range === "3m" ? 90 : range === "6m" ? 180 : range === "12m" ? 365 : range === "16m" ? 480 : 28
  start.setDate(start.getDate() - days + 1)

  const previousEnd = new Date(start)
  previousEnd.setDate(previousEnd.getDate() - 1)
  const previousStart = new Date(previousEnd)
  previousStart.setDate(previousStart.getDate() - days + 1)

  return {
    end: end.toISOString().slice(0, 10),
    start: start.toISOString().slice(0, 10),
    previousEnd: previousEnd.toISOString().slice(0, 10),
    previousStart: previousStart.toISOString().slice(0, 10),
  }
}

function computeMetrics(
  current: Array<{ date: string; clicks: number; impressions: number; ctr: number; position: number }>,
  previous: Array<{ date: string; clicks: number; impressions: number; ctr: number; position: number }>,
  compare: string,
) {
  const currentClicks = current.reduce((s, r) => s + r.clicks, 0)
  const currentImpressions = current.reduce((s, r) => s + r.impressions, 0)
  const currentCtr = currentImpressions > 0 ? (currentClicks / currentImpressions) * 100 : 0
  const currentPosition =
    current.length > 0 ? current.reduce((s, r) => s + r.position, 0) / current.length : 0

  if (compare === "none") {
    return {
      clicks: currentClicks,
      impressions: currentImpressions,
      ctr: Number(currentCtr.toFixed(2)),
      position: Number(currentPosition.toFixed(1)),
      clicksChange: 0,
      impressionsChange: 0,
      ctrChange: 0,
      positionChange: 0,
    }
  }

  const previousClicks = previous.reduce((s, r) => s + r.clicks, 0)
  const previousImpressions = previous.reduce((s, r) => s + r.impressions, 0)
  const previousCtr = previousImpressions > 0 ? (previousClicks / previousImpressions) * 100 : 0
  const previousPosition =
    previous.length > 0 ? previous.reduce((s, r) => s + r.position, 0) / previous.length : 0

  const pct = (a: number, b: number) => (b === 0 ? (a > 0 ? 100 : 0) : ((a - b) / b) * 100)

  return {
    clicks: currentClicks,
    impressions: currentImpressions,
    ctr: Number(currentCtr.toFixed(2)),
    position: Number(currentPosition.toFixed(1)),
    clicksChange: Number(pct(currentClicks, previousClicks).toFixed(1)),
    impressionsChange: Number(pct(currentImpressions, previousImpressions).toFixed(1)),
    ctrChange: Number((currentCtr - previousCtr).toFixed(2)),
    positionChange: Number((currentPosition - previousPosition).toFixed(1)),
  }
}