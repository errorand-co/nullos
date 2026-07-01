"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import type { GscPage } from "@/lib/seo-types"

function formatNumber(value: number): string {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

export function PagesView({ pages }: { pages: GscPage[] }) {
  const [query, setQuery] = useState("")

  const filtered = pages.filter(
    (page) =>
      page.url.toLowerCase().includes(query.toLowerCase()) ||
      page.primaryKeyword.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">Pages</h1>

      <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by URL or keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-48 bg-transparent text-xs outline-none"
        />
      </div>

      <div className="rounded-md border">
        <table className="w-full text-xs">
          <thead className="border-b bg-muted/50">
            <tr className="text-left">
              <th className="p-3 font-medium">URL</th>
              <th className="p-3 text-right font-medium">Clicks</th>
              <th className="p-3 text-right font-medium">Impressions</th>
              <th className="p-3 text-right font-medium">CTR</th>
              <th className="p-3 text-right font-medium">Position</th>
              <th className="p-3 font-medium">Primary Keyword</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((page, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="max-w-64 truncate p-3 text-muted-foreground">{page.url}</td>
                <td className="p-3 text-right">{formatNumber(page.clicks)}</td>
                <td className="p-3 text-right">{formatNumber(page.impressions)}</td>
                <td className="p-3 text-right">{page.ctr.toFixed(2)}%</td>
                <td className="p-3 text-right">{page.position.toFixed(1)}</td>
                <td className="p-3">{page.primaryKeyword}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground">{filtered.length} pages</div>
    </div>
  )
}