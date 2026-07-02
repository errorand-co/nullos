"use client"

import { useState } from "react"

import { aggregateOptions, comparisonOptions, dateRangeOptions } from "@/components/dashboard-shell"
import { MetricCards } from "@/components/metric-cards"
import { TrendChart } from "@/components/trend-chart"
import type { GscMetrics, GscTrendPoint } from "@/lib/seo-types"

type Tab = "all" | "indexing" | "traffic" | "engagement"
type Comparison = (typeof comparisonOptions)[number]["value"]
type Aggregate = (typeof aggregateOptions)[number]["value"]
type Range = (typeof dateRangeOptions)[number]["value"]

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "all", label: "All" },
  { id: "indexing", label: "Indexing" },
  { id: "traffic", label: "Traffic" },
  { id: "engagement", label: "Engagement" },
]

export function OverviewView({
  metrics,
  trends,
}: {
  metrics: GscMetrics
  trends: GscTrendPoint[]
}) {
  const [tab, setTab] = useState<Tab>("all")
  const [comparison, setComparison] = useState<Comparison>("previous")
  const [aggregate, setAggregate] = useState<Aggregate>("day")
  const [range, setRange] = useState<Range>("28d")

  return (
    <div className="grid gap-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tab selector */}
        <div className="inline-flex h-8 rounded-md border bg-card p-0.5 text-xs">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`h-7 rounded-sm px-3 font-medium transition ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <PillSelect<Comparison>
            options={comparisonOptions}
            value={comparison}
            onChange={setComparison}
            getLabel={(o) => o.label}
          />
          <PillSelect<Aggregate>
            options={aggregateOptions}
            value={aggregate}
            onChange={setAggregate}
            getLabel={(o) => o.label}
          />
          <PillSelect<Range>
            options={dateRangeOptions}
            value={range}
            onChange={setRange}
            getLabel={(o) => o.label}
          />
        </div>
      </div>

      {/* Metric cards */}
      <MetricCards metrics={metrics} />

      {/* Performance Trend */}
      <div className="rounded-md border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Performance Trend</h2>
        <TrendChart trends={trends} />
      </div>
    </div>
  )
}

function PillSelect<T extends string>({
  options,
  value,
  onChange,
  getLabel,
}: {
  options: ReadonlyArray<{ value: T; label: string }>
  value: T
  onChange: (v: T) => void
  getLabel: (o: { value: T; label: string }) => string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-8 appearance-none rounded-md border border-blue-500/40 bg-blue-500/5 px-3 pr-7 text-xs outline-none cursor-pointer hover:bg-blue-500/10"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {getLabel(o)}
          </option>
        ))}
      </select>
    </div>
  )
}