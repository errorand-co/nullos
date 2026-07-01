import { notFound } from "next/navigation"

import { MetricCards } from "@/components/metric-cards"
import { TrendChart } from "@/components/trend-chart"
import { listWebsites } from "@/lib/website-store"
import { getCurrentUser } from "@/lib/auth"
import type { SandboxSite } from "@/lib/seo-types"
import type { GscMetrics } from "@/lib/seo-types"

export default async function SiteOverviewPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const user = await getCurrentUser()
  if (!user) notFound()

  const { sites } = await listWebsites(user)
  const site = sites.find((s) => s.id === siteId)

  if (!site) notFound()

  const metrics: GscMetrics = site.metrics

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{site.name}</h1>
          <p className="text-xs text-muted-foreground">{site.sector} · {site.audience}</p>
        </div>
      </div>

      <MetricCards metrics={metrics} />

      <div className="rounded-md border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Performance Trend</h2>
        <TrendChart trends={site.trends} />
      </div>
    </div>
  )
}