"use client"

import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import type { GscMetrics } from "@/lib/seo-types"

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

function MetricCard({
  label,
  value,
  change,
  positiveIsGood = true,
}: {
  label: string
  value: string
  change: number
  positiveIsGood?: boolean
}) {
  const isPositive = change > 0
  const isGood = positiveIsGood ? isPositive : !isPositive

  return (
    <div className="rounded-md border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="mt-1 flex items-center gap-1 text-xs">
        {isPositive ? (
          <ArrowUpRight className={`size-3 ${isGood ? "text-emerald-500" : "text-red-500"}`} />
        ) : (
          <ArrowDownRight className={`size-3 ${isGood ? "text-emerald-500" : "text-red-500"}`} />
        )}
        <span className={isGood ? "text-emerald-500" : "text-red-500"}>
          {change > 0 ? "+" : ""}
          {change.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

export function MetricCards({ metrics }: { metrics: GscMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <MetricCard label="Clicks" value={formatNumber(metrics.clicks)} change={metrics.clicksChange} />
      <MetricCard label="Impressions" value={formatNumber(metrics.impressions)} change={metrics.impressionsChange} />
      <MetricCard label="CTR" value={`${metrics.ctr.toFixed(2)}%`} change={metrics.ctrChange} />
      <MetricCard
        label="Avg Position"
        value={metrics.position.toFixed(1)}
        change={metrics.positionChange}
        positiveIsGood={false}
      />
    </div>
  )
}