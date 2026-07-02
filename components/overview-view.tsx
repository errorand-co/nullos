"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"

import { DataTable } from "@/components/data-table"
import { MetricCards } from "@/components/metric-cards"
import { TrendChart } from "@/components/trend-chart"
import type {
  GscCountry,
  GscDevice,
  GscMetrics,
  GscPage,
  GscQuery,
  GscTrendPoint,
} from "@/lib/seo-types"

type Tab = "all" | "indexing" | "traffic" | "engagement"

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "all", label: "All" },
  { id: "indexing", label: "Indexing" },
  { id: "traffic", label: "Traffic" },
  { id: "engagement", label: "Engagement" },
]

const comparisonOptions = [
  { value: "previous", label: "vs Previous period" },
  { value: "year", label: "vs Same period last year" },
  { value: "none", label: "No comparison" },
] as const

const aggregateOptions = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
] as const

const rangeOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "28d", label: "Last 28 days" },
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "12m", label: "Last 12 months" },
  { value: "16m", label: "All time" },
] as const

export function OverviewView({
  metrics,
  trends,
  previousTrends,
  queries,
  pages,
  countries,
  devices,
  range,
  tab,
  agg,
  compare,
  siteId,
}: {
  metrics: GscMetrics
  trends: GscTrendPoint[]
  previousTrends: GscTrendPoint[]
  queries: GscQuery[]
  pages: GscPage[]
  countries: GscCountry[]
  devices: GscDevice[]
  range: string
  tab: string
  agg: string
  compare: string
  siteId: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== getDefault(key)) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const currentTab = (tabs.find((t) => t.id === tab)?.id ?? "all") as Tab

  return (
    <div className="grid gap-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex h-8 rounded-md border bg-card p-0.5 text-xs">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => updateParam("tab", t.id)}
              className={`h-7 rounded-sm px-3 font-medium transition ${
                currentTab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <PillSelect<typeof comparisonOptions[number]["value"]>
            options={comparisonOptions}
            value={compare as typeof comparisonOptions[number]["value"]}
            onChange={(v) => updateParam("compare", v)}
            getLabel={(o) => o.label}
          />
          <PillSelect<typeof aggregateOptions[number]["value"]>
            options={aggregateOptions}
            value={agg as typeof aggregateOptions[number]["value"]}
            onChange={(v) => updateParam("agg", v)}
            getLabel={(o) => o.label}
          />
          <PillSelect<typeof rangeOptions[number]["value"]>
            options={rangeOptions}
            value={range as typeof rangeOptions[number]["value"]}
            onChange={(v) => updateParam("range", v)}
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

      {/* Data Table (referrers/pages/devices/events) */}
      <DataTable
        queries={queries}
        pages={pages}
        countries={countries}
        devices={devices}
      />
    </div>
  )
}

function getDefault(key: string): string {
  return (
    {
      range: "28d",
      tab: "all",
      agg: "day",
      compare: "previous",
    }[key] ?? ""
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