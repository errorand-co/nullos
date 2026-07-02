"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import type { GscCountry, GscDevice, GscPage, GscQuery } from "@/lib/seo-types"

type DataTab = "queries" | "pages" | "devices" | "countries"

type DataRow = {
  label: string
  icon?: string
  impressions: number
  clicks: number
  ctr: number
  position: number
}

const tabs: Array<{ id: DataTab; label: string }> = [
  { id: "queries", label: "Queries" },
  { id: "pages", label: "Pages" },
  { id: "devices", label: "Devices" },
  { id: "countries", label: "Countries" },
]

function deviceIcon(device: string): string {
  const d = device.toLowerCase()
  if (d.includes("desktop")) return "🖥"
  if (d.includes("mobile")) return "📱"
  if (d.includes("tablet")) return "💻"
  return "❓"
}

function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🌍"
  const base = 0x1f1e6
  const A = "A".charCodeAt(0)
  return String.fromCodePoint(base + code.charCodeAt(0) - A, base + code.charCodeAt(1) - A)
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

const singularTab: Record<DataTab, string> = {
  queries: "queries",
  pages: "pages",
  devices: "devices",
  countries: "countries",
}

const columnHeader: Record<DataTab, string> = {
  queries: "Query",
  pages: "Path",
  devices: "Device",
  countries: "Country",
}

export function DataTable({
  queries = [],
  pages = [],
  countries = [],
  devices = [],
}: {
  queries?: GscQuery[]
  pages?: GscPage[]
  countries?: GscCountry[]
  devices?: GscDevice[]
}) {
  const [tab, setTab] = useState<DataTab>("queries")
  const [search, setSearch] = useState("")

  const rows: DataRow[] = useMemo(() => {
    switch (tab) {
      case "queries":
        return queries.map((q) => ({
          label: q.query,
          icon: "🔍",
          impressions: q.impressions,
          clicks: q.clicks,
          ctr: q.ctr,
          position: q.position,
        }))
      case "pages":
        return pages.map((p) => ({
          label: p.url,
          icon: "🔗",
          impressions: p.impressions,
          clicks: p.clicks,
          ctr: p.ctr,
          position: p.position,
        }))
      case "devices":
        return devices.map((d) => ({
          label: titleCase(d.device),
          icon: deviceIcon(d.device),
          impressions: d.impressions,
          clicks: d.clicks,
          ctr: d.ctr,
          position: d.position,
        }))
      case "countries":
        return countries.map((c) => ({
          label: c.name,
          icon: countryFlag(c.code),
          impressions: c.impressions,
          clicks: c.clicks,
          ctr: c.ctr,
          position: c.position,
        }))
      default:
        return []
    }
  }, [tab, queries, pages, devices, countries])

  const filtered = rows.filter((r) => r.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="rounded-md border bg-card">
      {/* Tabs + search */}
      <div className="flex items-center gap-2 border-b px-3 py-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`h-7 rounded-md px-2.5 text-xs font-medium transition ${
              tab === t.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex h-7 w-48 items-center gap-2 rounded-md border bg-background px-2.5">
          <Search className="size-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${singularTab[tab]}...`}
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-left">
              <th className="px-3 py-2 font-medium text-muted-foreground">{columnHeader[tab]}</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Clicks</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Impr.</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">CTR</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Pos.</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  No {singularTab[tab]} found
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => (
                <tr key={`${r.label}-${i}`} className="border-b last:border-0">
                  <td className="max-w-0 truncate px-3 py-2">
                    {r.icon && <span className="mr-1.5">{r.icon}</span>}
                    {r.label}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.clicks.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.impressions.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.ctr.toFixed(2)}%</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.position.toFixed(1)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
