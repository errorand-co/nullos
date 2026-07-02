"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import type { GscCountry, GscDevice, GscPage, GscQuery } from "@/lib/seo-types"

type DataTab = "referrers" | "pages" | "devices" | "events"

type DataRow = {
  label: string
  icon?: string
  views: number
  sessions: number
}

const tabs: Array<{ id: DataTab; label: string }> = [
  { id: "referrers", label: "Referrers" },
  { id: "pages", label: "Pages" },
  { id: "devices", label: "Devices" },
  { id: "events", label: "Events" },
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
  const [tab, setTab] = useState<DataTab>("referrers")
  const [search, setSearch] = useState("")

  const rows: DataRow[] = useMemo(() => {
    switch (tab) {
      case "referrers":
        return queries.map((q) => ({
          label: q.query,
          icon: "🔍",
          views: q.impressions,
          sessions: q.clicks,
        }))
      case "pages":
        return pages.map((p) => ({
          label: p.url,
          icon: "🔗",
          views: p.impressions,
          sessions: p.clicks,
        }))
      case "devices":
        return devices.map((d) => ({
          label: d.device,
          icon: deviceIcon(d.device),
          views: d.impressions,
          sessions: d.clicks,
        }))
      case "events":
        return countries.map((c) => ({
          label: c.name,
          icon: countryFlag(c.code),
          views: c.impressions,
          sessions: c.clicks,
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
            placeholder={`Search ${tab}...`}
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-left">
            <th className="px-3 py-2 font-medium text-muted-foreground">
              {tab === "referrers"
                ? "Referrer"
                : tab === "pages"
                  ? "Path"
                  : tab === "devices"
                    ? "Device"
                    : "Country"}
            </th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Views</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Sessions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                No {tab} found
              </td>
            </tr>
          ) : (
            filtered.map((r, i) => (
              <tr key={`${r.label}-${i}`} className="border-b last:border-0">
                <td className="max-w-0 truncate px-3 py-2">
                  {r.icon && <span className="mr-1.5">{r.icon}</span>}
                  {r.label}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{r.views.toLocaleString()}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.sessions.toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}