"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import type { GscQuery } from "@/lib/seo-types"

const intentOptions = ["all", "Informational", "Navigational", "Commercial", "Transactional"] as const
const positionOptions = ["all", "top3", "top10", "page2"] as const

function formatNumber(value: number): string {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

export function QueriesView({ queries }: { queries: GscQuery[] }) {
  const [query, setQuery] = useState("")
  const [intentFilter, setIntentFilter] = useState<string>("all")
  const [positionFilter, setPositionFilter] = useState<string>("all")

  const filtered = queries.filter((item) => {
    const matchesQuery = item.query.toLowerCase().includes(query.toLowerCase())
    const matchesIntent = intentFilter === "all" || item.intent === intentFilter
    const matchesPosition =
      positionFilter === "all" ||
      (positionFilter === "top3" && item.position <= 3) ||
      (positionFilter === "top10" && item.position <= 10) ||
      (positionFilter === "page2" && item.position > 10 && item.position <= 20)
    return matchesQuery && matchesIntent && matchesPosition
  })

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">Queries</h1>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search queries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-48 bg-transparent text-xs outline-none"
          />
        </div>
        <select
          value={intentFilter}
          onChange={(e) => setIntentFilter(e.target.value)}
          className="h-9 rounded-md border bg-background px-2 text-xs outline-none"
        >
          {intentOptions.map((o) => (
            <option key={o} value={o}>
              {o === "all" ? "All intents" : o}
            </option>
          ))}
        </select>
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="h-9 rounded-md border bg-background px-2 text-xs outline-none"
        >
          {positionOptions.map((o) => (
            <option key={o} value={o}>
              {o === "all" ? "All positions" : o}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-xs">
          <thead className="border-b bg-muted/50">
            <tr className="text-left">
              <th className="p-3 font-medium">Query</th>
              <th className="p-3 text-right font-medium">Clicks</th>
              <th className="p-3 text-right font-medium">Impressions</th>
              <th className="p-3 text-right font-medium">CTR</th>
              <th className="p-3 text-right font-medium">Position</th>
              <th className="p-3 font-medium">Intent</th>
              <th className="p-3 text-right font-medium">Opportunity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="p-3">{item.query}</td>
                <td className="p-3 text-right">{formatNumber(item.clicks)}</td>
                <td className="p-3 text-right">{formatNumber(item.impressions)}</td>
                <td className="p-3 text-right">{item.ctr.toFixed(2)}%</td>
                <td className="p-3 text-right">{item.position.toFixed(1)}</td>
                <td className="p-3 text-muted-foreground">{item.intent}</td>
                <td className="p-3 text-right">
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[0.625rem]">
                    {item.opportunityScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground">{filtered.length} queries</div>
    </div>
  )
}