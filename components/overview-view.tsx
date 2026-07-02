"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Calendar, X } from "lucide-react"

import { DataTable } from "@/components/data-table"
import { MetricCards } from "@/components/metric-cards"
import { TrendChart } from "@/components/trend-chart"
import { cn } from "@/lib/utils"
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

const rangePresets = [
  { value: "7d", label: "Last 7 days" },
  { value: "28d", label: "Last 28 days" },
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "12m", label: "Last 12 months" },
  { value: "16m", label: "All time" },
] as const

function formatRangeLabel(start: string, end: string): string {
  const fmt = (s: string) => {
    const d = new Date(s + "T00:00:00Z")
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
  }
  return `${fmt(start)} → ${fmt(end)}`
}

export function OverviewView({
  metrics,
  trends,
  previousTrends,
  queries,
  pages,
  countries,
  devices,
  start,
  end,
  initialRange,
  initialFrom,
  initialTo,
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
  start: string
  end: string
  initialRange: string
  initialFrom: string | null
  initialTo: string | null
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

  function applyPreset(preset: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (preset && preset !== "28d") {
      params.set("range", preset)
    } else {
      params.delete("range")
    }
    params.delete("from")
    params.delete("to")
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function applyCustom(from: string, to: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("range")
    if (from) params.set("from", from)
    else params.delete("from")
    if (to) params.set("to", to)
    else params.delete("to")
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const currentTab = (tabs.find((t) => t.id === tab)?.id ?? "all") as Tab

  const isCustom = Boolean(initialFrom && initialTo)
  const rangeLabel = isCustom
    ? formatRangeLabel(initialFrom!, initialTo!)
    : (rangePresets.find((r) => r.value === initialRange)?.label ?? "Last 28 days")

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
          <DateRangePicker
            label={rangeLabel}
            isCustom={isCustom}
            initialFrom={initialFrom ?? ""}
            initialTo={initialTo ?? ""}
            onApplyPreset={applyPreset}
            onApplyCustom={applyCustom}
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

function DateRangePicker({
  label,
  isCustom,
  initialFrom,
  initialTo,
  onApplyPreset,
  onApplyCustom,
}: {
  label: string
  isCustom: boolean
  initialFrom: string
  initialTo: string
  onApplyPreset: (preset: string) => void
  onApplyCustom: (from: string, to: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Sync local state when URL params change externally
  useEffect(() => {
    setFrom(initialFrom)
    setTo(initialTo)
  }, [initialFrom, initialTo])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  function handleCustomApply() {
    if (from && to && from <= to) {
      onApplyCustom(from, to)
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs outline-none transition",
          isCustom
            ? "border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10"
            : "border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10",
        )}
      >
        <Calendar className="size-3.5 text-muted-foreground" />
        <span className="font-medium">{label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-72 rounded-md border bg-popover p-3 shadow-lg">
          <div className="mb-2 text-[0.6875rem] font-medium uppercase text-muted-foreground">
            Preset
          </div>
          <div className="mb-3 grid grid-cols-2 gap-1">
            {rangePresets.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  onApplyPreset(p.value)
                  setOpen(false)
                }}
                className="rounded-sm border bg-background px-2 py-1.5 text-left text-xs hover:bg-muted"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mb-2 flex items-center justify-between">
            <div className="text-[0.6875rem] font-medium uppercase text-muted-foreground">
              Custom
            </div>
            {(from || to) && (
              <button
                type="button"
                onClick={() => {
                  setFrom("")
                  setTo("")
                }}
                className="inline-flex items-center gap-0.5 text-[0.6875rem] text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[0.6875rem] text-muted-foreground">From</label>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
                className="h-8 w-full rounded-md border bg-background px-2 text-xs outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[0.6875rem] text-muted-foreground">To</label>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                className="h-8 w-full rounded-md border bg-background px-2 text-xs outline-none"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleCustomApply}
            disabled={!from || !to || from > to}
            className="mt-3 h-8 w-full rounded-md bg-primary text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            Apply custom range
          </button>
        </div>
      )}
    </div>
  )
}
