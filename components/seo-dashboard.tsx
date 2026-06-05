"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  Globe,
  Layers,
  LineChart,
  Menu,
  Monitor,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Smartphone,
  Sun,
  Target,
  Trash2,
  X,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { sandboxSites } from "@/lib/seo-data"
import type { GscQuery, SandboxSite, TrackedKeyword } from "@/lib/seo-types"

type MetricKey = "clicks" | "impressions" | "ctr" | "position"
type DateRange = "7d" | "28d" | "3m" | "6m"
type SubTab = "queries" | "pages" | "countries" | "devices" | "month-comparison" | "keyword-tracking"
type SearchConsoleProperty = {
  permissionLevel: string
  siteUrl: string
}

const navItems: Array<{ tab: SubTab; label: string; icon: typeof Search }> = [
  { tab: "queries", label: "Performance", icon: Search },
  { tab: "pages", label: "Landing Pages", icon: FileText },
  { tab: "countries", label: "Geographics", icon: Globe },
  { tab: "devices", label: "Device Traffic", icon: Smartphone },
  { tab: "month-comparison", label: "Month Compare", icon: RefreshCw },
  { tab: "keyword-tracking", label: "Keyword Tracker", icon: Target },
]

const initialTrackedKeywords: Record<string, TrackedKeyword[]> = {
  "saas-pulse": [
    {
      id: "sp-1",
      query: "saas metrics dashboard",
      siteId: "saas-pulse",
      currentPosition: 1.4,
      previousPosition: 2.1,
      targetPosition: 1,
      volume: 1500,
      difficulty: "Easy",
      status: "On Track",
      dateAdded: "2026-05-01",
    },
    {
      id: "sp-2",
      query: "b2b churn rate calculator",
      siteId: "saas-pulse",
      currentPosition: 12.6,
      previousPosition: 15.1,
      targetPosition: 5,
      volume: 3400,
      difficulty: "Medium",
      status: "Needs Attention",
      dateAdded: "2026-05-15",
    },
    {
      id: "sp-3",
      query: "how to design user dashboards",
      siteId: "saas-pulse",
      currentPosition: 15.2,
      previousPosition: 12,
      targetPosition: 3,
      volume: 8200,
      difficulty: "Hard",
      status: "Critical",
      dateAdded: "2026-05-20",
    },
  ],
  "glowstore-shoes": [
    {
      id: "gs-1",
      query: "buy minimalist running shoes",
      siteId: "glowstore-shoes",
      currentPosition: 3.8,
      previousPosition: 5.2,
      targetPosition: 1,
      volume: 12000,
      difficulty: "Hard",
      status: "On Track",
      dateAdded: "2026-05-01",
    },
    {
      id: "gs-2",
      query: "best shoes for trail runner safety",
      siteId: "glowstore-shoes",
      currentPosition: 8.2,
      previousPosition: 7.9,
      targetPosition: 3,
      volume: 2400,
      difficulty: "Medium",
      status: "Needs Attention",
      dateAdded: "2026-05-10",
    },
  ],
  "dev-insights": [
    {
      id: "di-1",
      query: "react 19 state managers",
      siteId: "dev-insights",
      currentPosition: 4.5,
      previousPosition: 7.2,
      targetPosition: 1,
      volume: 14000,
      difficulty: "Hard",
      status: "On Track",
      dateAdded: "2026-05-05",
    },
    {
      id: "di-2",
      query: "how to avoid hydration errors in nextjs",
      siteId: "dev-insights",
      currentPosition: 16.8,
      previousPosition: 14.1,
      targetPosition: 5,
      volume: 9800,
      difficulty: "Hard",
      status: "Critical",
      dateAdded: "2026-05-18",
    },
  ],
}

export function SeoDashboard({ userEmail }: { userEmail: string }) {
  const [chartReady, setChartReady] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sites, setSites] = useState<SandboxSite[]>(sandboxSites)
  const [activeSite, setActiveSite] = useState<SandboxSite>(sandboxSites[0])
  const [manageWebsitesOpen, setManageWebsitesOpen] = useState(false)
  const [websiteName, setWebsiteName] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [gscConfigured, setGscConfigured] = useState(false)
  const [gscLoading, setGscLoading] = useState(false)
  const [gscProperties, setGscProperties] = useState<SearchConsoleProperty[]>([])
  const [gscMessage, setGscMessage] = useState("")
  const [websiteStoreMessage, setWebsiteStoreMessage] = useState("")
  const [activeMetric, setActiveMetric] = useState<MetricKey>("clicks")
  const [dateRange, setDateRange] = useState<DateRange>("28d")
  const [subTab, setSubTab] = useState<SubTab>("queries")
  const [query, setQuery] = useState("")
  const [intentFilter, setIntentFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [monthA, setMonthA] = useState("M 06")
  const [monthB, setMonthB] = useState("M 07")
  const [tracked, setTracked] = useState(initialTrackedKeywords)
  const [keywordLoading, setKeywordLoading] = useState(false)
  const [keywordStoreMessage, setKeywordStoreMessage] = useState("")
  const [newKeyword, setNewKeyword] = useState("")
  const [newTarget, setNewTarget] = useState(3)
  const [newVolume, setNewVolume] = useState(1000)
  const [newDifficulty, setNewDifficulty] = useState<TrackedKeyword["difficulty"]>("Medium")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setChartReady(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    fetch("/api/search-console/status")
      .then((response) => response.json())
      .then((data: { configured: boolean }) => setGscConfigured(data.configured))
      .catch(() => setGscConfigured(false))
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadInitialWebsites() {
      try {
        const response = await fetch("/api/websites")
        const data = (await response.json()) as {
          configured: boolean
          missingGrant?: boolean
          missingTable?: boolean
          sites: SandboxSite[]
        }

        if (ignore) return

        setSites(data.sites)
        setActiveSite((currentSite) => data.sites.find((site) => site.id === currentSite.id) || data.sites[0] || sandboxSites[0])
        setWebsiteStoreMessage(
          data.missingTable
            ? "Run supabase/schema.sql to persist websites in Supabase."
            : data.missingGrant
              ? "Run the latest supabase/schema.sql grants so the service role can manage websites."
              : ""
        )
      } catch {
        if (!ignore) {
          setWebsiteStoreMessage("Could not load saved websites. Using local sandbox data.")
        }
      }
    }

    loadInitialWebsites()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadTrackedKeywords() {
      setKeywordLoading(true)

      try {
        const response = await fetch(`/api/tracked-keywords?siteId=${encodeURIComponent(activeSite.id)}`)
        const data = (await response.json()) as {
          configured: boolean
          keywords: TrackedKeyword[]
          missingGrant?: boolean
          missingTable?: boolean
        }

        if (ignore) return

        if (!data.configured) {
          setKeywordStoreMessage("Keyword tracking is local until Supabase is configured.")
          return
        }

        if (data.missingTable) {
          setKeywordStoreMessage("Run the latest supabase/schema.sql to create tracked_keywords.")
          return
        }

        if (data.missingGrant) {
          setKeywordStoreMessage("Run the latest supabase/schema.sql grants so keywords can persist.")
          return
        }

        setTracked((currentTracked) => ({ ...currentTracked, [activeSite.id]: data.keywords }))
        setKeywordStoreMessage("")
      } catch {
        if (!ignore) {
          setKeywordStoreMessage("Could not load saved keyword tracking.")
        }
      } finally {
        if (!ignore) setKeywordLoading(false)
      }
    }

    loadTrackedKeywords()

    return () => {
      ignore = true
    }
  }, [activeSite.id])

  const trends = buildRangeTrends(activeSite, dateRange)
  const metrics = buildRangeMetrics(activeSite, trends)
  const scale = metrics.impressions && activeSite.metrics.impressions ? metrics.impressions / activeSite.metrics.impressions : 1

  const filteredQueries = activeSite.queries.filter((item) => {
    const matchesQuery = item.query.toLowerCase().includes(query.toLowerCase())
    const matchesIntent = intentFilter === "all" || item.intent === intentFilter
    const matchesPosition =
      positionFilter === "all" ||
      (positionFilter === "top3" && item.position <= 3) ||
      (positionFilter === "top10" && item.position <= 10) ||
      (positionFilter === "page2" && item.position > 10 && item.position <= 20)

    return matchesQuery && matchesIntent && matchesPosition
  })

  const filteredPages = activeSite.pages.filter(
    (page) =>
      page.url.toLowerCase().includes(query.toLowerCase()) ||
      page.primaryKeyword.toLowerCase().includes(query.toLowerCase())
  )

  const activeTracked = tracked[activeSite.id] || []
  const avgTrackedPosition =
    activeTracked.length === 0
      ? "0.0"
      : (activeTracked.reduce((sum, item) => sum + item.currentPosition, 0) / activeTracked.length).toFixed(1)

  const trendA = activeSite.trends.find((item) => item.date === monthA) || activeSite.trends[0] || emptyTrendPoint("M 06")
  const trendB = activeSite.trends.find((item) => item.date === monthB) || activeSite.trends.at(-1) || activeSite.trends[0] || emptyTrendPoint("M 07")

  const queryComparisons = useMemo(
    () =>
      activeSite.queries.map((item) => {
        const clickChange = item.clicks - item.previousClicks
        const positionSeed = item.query.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
        const posChange = Number(((positionSeed % 7) - 3.2).toFixed(1))
        return {
          ...item,
          clickChange,
          clickChangePct: item.previousClicks > 0 ? (clickChange / item.previousClicks) * 100 : 0,
          previousPosition: Number((item.position - posChange).toFixed(1)),
        }
      }),
    [activeSite]
  )

  const winners = [...queryComparisons].sort((a, b) => b.clickChange - a.clickChange).slice(0, 3)
  const losers = [...queryComparisons].sort((a, b) => a.clickChange - b.clickChange).slice(0, 3)

  function changeSite(siteId: string) {
    const nextSite = sites.find((site) => site.id === siteId)
    if (!nextSite) return
    setActiveSite(nextSite)
    setQuery("")
  }

  async function addSite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = websiteName.trim()
    const trimmedUrl = websiteUrl.trim()

    if (!trimmedName || !trimmedUrl) {
      setWebsiteStoreMessage("Website name and URL are required.")
      return
    }

    try {
      const response = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, url: trimmedUrl }),
      })

      if (!response.ok) {
        const error = (await response.json()) as { error?: string }
        throw new Error(error.error || "Could not save website.")
      }

      const data = (await response.json()) as { site: SandboxSite }
      setSites((currentSites) => [...currentSites.filter((site) => site.url !== data.site.url), data.site])
      setActiveSite(data.site)
      setWebsiteName("")
      setWebsiteUrl("")
      setWebsiteStoreMessage("")
      setQuery("")
    } catch (error) {
      setWebsiteStoreMessage(error instanceof Error ? error.message : "Could not save website.")
    }
  }

  async function deleteSite(siteId: string) {
    if (sites.length <= 1) return

    try {
      const response = await fetch(`/api/websites/${encodeURIComponent(siteId)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = (await response.json()) as { error?: string }
        throw new Error(error.error || "Could not delete website.")
      }
    } catch (error) {
      setWebsiteStoreMessage(error instanceof Error ? error.message : "Could not delete website.")
      return
    }

    const nextSites = sites.filter((site) => site.id !== siteId)
    setSites(nextSites)
    setTracked((currentTracked) => {
      const remainingTracked = { ...currentTracked }
      delete remainingTracked[siteId]
      return remainingTracked
    })

    if (activeSite.id === siteId) {
      setActiveSite(nextSites[0])
      setQuery("")
    }
  }

  async function loadSearchConsoleProperties() {
    setGscLoading(true)
    setGscMessage("")

    try {
      const response = await fetch("/api/search-console/sites")
      const data = (await response.json()) as {
        configured: boolean
        sites: SearchConsoleProperty[]
      }

      setGscConfigured(data.configured)
      setGscProperties(data.sites)
      setGscMessage(data.configured ? "" : "Add Google OAuth credentials to enable Search Console import.")
    } catch {
      setGscMessage("Could not load Search Console properties.")
    } finally {
      setGscLoading(false)
    }
  }

  async function importSearchConsoleProperty(siteUrl: string) {
    setGscLoading(true)
    setGscMessage("")

    try {
      const response = await fetch("/api/search-console/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl }),
      })

      if (!response.ok) {
        const error = (await response.json()) as { error?: string }
        throw new Error(error.error || "Could not import Search Console property.")
      }

      const data = (await response.json()) as {
        persisted?: boolean
        persistenceError?: string
        site: SandboxSite
      }
      setSites((currentSites) => {
        const withoutDuplicate = currentSites.filter((site) => site.url !== data.site.url)
        return [...withoutDuplicate, data.site]
      })
      setActiveSite(data.site)
      setGscMessage(
        data.persisted === false
          ? `Imported ${data.site.name} for this session. Supabase did not save it: ${data.persistenceError}`
          : `Imported ${data.site.name}.`
      )
      setWebsiteStoreMessage(data.persisted === false ? "Run the latest supabase/schema.sql grants so imports persist after refresh." : "")
    } catch (error) {
      setGscMessage(error instanceof Error ? error.message : "Could not import Search Console property.")
    } finally {
      setGscLoading(false)
    }
  }

  async function addTrackedKeyword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedKeyword = newKeyword.trim()
    if (!trimmedKeyword) return

    setKeywordLoading(true)
    setKeywordStoreMessage("")

    try {
      const response = await fetch("/api/tracked-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty: newDifficulty,
          query: trimmedKeyword,
          siteId: activeSite.id,
          targetPosition: newTarget,
          volume: newVolume,
        }),
      })

      if (!response.ok) {
        const error = (await response.json()) as { error?: string }
        throw new Error(error.error || "Could not save keyword tracking.")
      }

      const data = (await response.json()) as { keyword: TrackedKeyword }
      setTracked((prev) => ({ ...prev, [activeSite.id]: [data.keyword, ...(prev[activeSite.id] || [])] }))
      setNewKeyword("")
      setNewTarget(3)
      setNewVolume(1000)
      setNewDifficulty("Medium")
    } catch (error) {
      setKeywordStoreMessage(error instanceof Error ? error.message : "Could not save keyword tracking.")
    } finally {
      setKeywordLoading(false)
    }
  }

  async function removeTrackedKeyword(id: string) {
    setKeywordLoading(true)
    setKeywordStoreMessage("")

    try {
      const response = await fetch(`/api/tracked-keywords/${encodeURIComponent(id)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = (await response.json()) as { error?: string }
        throw new Error(error.error || "Could not delete keyword tracking.")
      }

      setTracked((prev) => ({ ...prev, [activeSite.id]: (prev[activeSite.id] || []).filter((item) => item.id !== id) }))
    } catch (error) {
      setKeywordStoreMessage(error instanceof Error ? error.message : "Could not delete keyword tracking.")
    } finally {
      setKeywordLoading(false)
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <main className="h-svh overflow-hidden bg-background text-foreground">
        <div className="flex h-svh flex-col overflow-hidden md:flex-row">
          <aside className="hidden h-svh w-64 shrink-0 overflow-hidden border-r bg-card md:flex md:flex-col md:justify-between">
            <div className="p-4">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Zap className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">SEO Insight</div>
                  <div className="text-xs text-muted-foreground">GSC command center</div>
                </div>
              </div>

              <label className="mb-2 block text-[0.6875rem] font-medium uppercase text-muted-foreground">
                Connected Site
              </label>
              <select
                value={activeSite.id}
                onChange={(event) => changeSite(event.target.value)}
                className="mb-2 h-8 w-full rounded-md border bg-background px-2 text-xs outline-none"
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
              <div className="mb-6 truncate font-mono text-[0.6875rem] text-muted-foreground">{activeSite.url}</div>

              <nav className="grid gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => setSubTab(item.tab)}
                    className={`flex h-9 items-center gap-2 rounded-md px-3 text-left text-xs font-medium transition ${
                      subTab === item.tab
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div>
              <div className="p-4 pb-3">
                <Button className="w-full justify-start" variant="outline" onClick={() => setManageWebsitesOpen(true)}>
                  <Globe />
                  Manage Websites
                </Button>
              </div>
              <div className="border-t p-4">
                <div className="text-xs font-medium">User</div>
                <div className="truncate text-[0.6875rem] text-muted-foreground">{userEmail}</div>
                <form action="/auth/logout" method="post" className="mt-3">
                  <Button className="w-full justify-start" variant="outline" size="sm" type="submit">
                    Sign Out
                  </Button>
                </form>
              </div>
            </div>
          </aside>

          {manageWebsitesOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
              <div className="w-full max-w-xl rounded-md border bg-card shadow-lg">
                <div className="flex items-center justify-between border-b p-4">
                  <div>
                    <h2 className="text-sm font-semibold">Manage Websites</h2>
                    <p className="text-xs text-muted-foreground">Add or remove websites shown in the Connected Site dropdown.</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setManageWebsitesOpen(false)} aria-label="Close">
                    <X />
                  </Button>
                </div>

                <div className="grid gap-4 p-4">
                  <div className="rounded-md border bg-background p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-xs font-medium">Google Search Console</div>
                        <div className="text-[0.6875rem] text-muted-foreground">
                          {gscConfigured ? "OAuth credentials detected." : "Not connected. Using local sandbox data."}
                        </div>
                      </div>
                      <Button type="button" variant="outline" onClick={loadSearchConsoleProperties} disabled={gscLoading}>
                        <RefreshCw className={gscLoading ? "animate-spin" : ""} />
                        Load GSC Sites
                      </Button>
                      {!gscConfigured && (
                        <Button asChild type="button">
                          <a href="/api/auth/google/start">
                            <Globe />
                            Connect Google
                          </a>
                        </Button>
                      )}
                    </div>

                    {gscMessage && <div className="mt-3 text-xs text-muted-foreground">{gscMessage}</div>}
                    {websiteStoreMessage && <div className="mt-2 text-xs text-muted-foreground">{websiteStoreMessage}</div>}

                    {gscProperties.length > 0 && (
                      <div className="mt-3 grid gap-2">
                        {gscProperties.map((property) => (
                          <div key={property.siteUrl} className="flex items-center justify-between gap-3 rounded-md border bg-card p-2">
                            <div className="min-w-0">
                              <div className="truncate font-mono text-xs">{property.siteUrl}</div>
                              <div className="text-[0.6875rem] text-muted-foreground">{property.permissionLevel}</div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => importSearchConsoleProperty(property.siteUrl)}
                              disabled={gscLoading}
                            >
                              Import
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <form onSubmit={addSite} className="grid gap-3 rounded-md border bg-background p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={websiteName}
                        onChange={(event) => setWebsiteName(event.target.value)}
                        placeholder="Website name"
                        className="h-8 rounded-md border bg-card px-3 text-xs outline-none"
                      />
                      <input
                        value={websiteUrl}
                        onChange={(event) => setWebsiteUrl(event.target.value)}
                        placeholder="https://example.com"
                        className="h-8 rounded-md border bg-card px-3 text-xs outline-none"
                      />
                    </div>
                    <Button type="submit" className="w-full justify-center sm:w-fit">
                      <Plus />
                      Add Website
                    </Button>
                  </form>

                  <div className="max-h-72 overflow-y-auto rounded-md border">
                    {sites.map((site) => (
                      <div key={site.id} className="flex items-center justify-between gap-3 border-b p-3 last:border-b-0">
                        <button
                          type="button"
                          onClick={() => changeSite(site.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="truncate text-xs font-medium">{site.name}</div>
                          <div className="truncate font-mono text-[0.6875rem] text-muted-foreground">{site.url}</div>
                        </button>
                        <div className="flex items-center gap-2">
                          {activeSite.id === site.id && (
                            <span className="rounded-sm bg-primary px-2 py-1 text-[0.625rem] font-medium text-primary-foreground">
                              Active
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => deleteSite(site.id)}
                            disabled={sites.length <= 1}
                            aria-label={`Delete ${site.name}`}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:hidden">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Zap className="size-4 text-primary" />
              SEO Insight
            </div>
            <Button variant="outline" size="icon" onClick={() => setMobileOpen((value) => !value)}>
              {mobileOpen ? <X /> : <Menu />}
            </Button>
          </header>

          {mobileOpen && (
            <div className="fixed inset-x-0 top-14 z-20 border-b bg-background p-4 md:hidden">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.tab}
                    variant={subTab === item.tab ? "default" : "outline"}
                    onClick={() => {
                      setSubTab(item.tab)
                      setMobileOpen(false)
                    }}
                  >
                    <item.icon />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <section className="min-h-0 min-w-0 flex-1 overflow-y-auto">
            <Header
              activeSite={activeSite}
              dateRange={dateRange}
              theme={theme}
              onTheme={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
              onExport={() => copyText(JSON.stringify({ site: activeSite.name, metrics, queries: activeSite.queries }, null, 2))}
            />

            <div className="grid gap-4 p-4 sm:p-6">
              <div className="rounded-md border bg-card p-3 sm:flex sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-base font-semibold">Search Console Insights</h1>
                  <p className="text-xs text-muted-foreground">{activeSite.sector}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1 sm:mt-0">
                  {(["7d", "28d", "3m", "6m"] as const).map((range) => (
                    <Button
                      key={range}
                      variant={dateRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDateRange(range)}
                    >
                      {range === "7d" ? "7 Days" : range === "28d" ? "28 Days" : range === "3m" ? "3 Months" : "6 Months"}
                    </Button>
                  ))}
                </div>
              </div>

              <MetricCards metrics={metrics} activeMetric={activeMetric} onMetric={setActiveMetric} />

              <section className="grid gap-4">
                <TrendChart activeMetric={activeMetric} trends={trends} dateRange={dateRange} chartReady={chartReady} />
              </section>

              <section className="overflow-hidden rounded-md border bg-card">
                <TabHeader subTab={subTab} setSubTab={setSubTab} counts={{ queries: filteredQueries.length, pages: filteredPages.length, tracked: activeTracked.length }} />

                {subTab !== "month-comparison" && subTab !== "keyword-tracking" && (
                  <FilterBar
                    query={query}
                    subTab={subTab}
                    setQuery={setQuery}
                    intentFilter={intentFilter}
                    setIntentFilter={setIntentFilter}
                    positionFilter={positionFilter}
                    setPositionFilter={setPositionFilter}
                  />
                )}

                <div className="bg-muted/30 p-2 sm:p-4">
                  {subTab === "queries" && <QueriesTable queries={filteredQueries} scale={scale} copied={copied} onCopy={copyText} />}
                  {subTab === "pages" && <PagesTable pages={filteredPages} scale={scale} />}
                  {subTab === "countries" && <CountriesView activeSite={activeSite} scale={scale} />}
                  {subTab === "devices" && <DevicesView activeSite={activeSite} scale={scale} chartReady={chartReady} />}
                  {subTab === "month-comparison" && (
                    <MonthComparison
                      activeSite={activeSite}
                      monthA={monthA}
                      monthB={monthB}
                      setMonthA={setMonthA}
                      setMonthB={setMonthB}
                      trendA={trendA}
                      trendB={trendB}
                      winners={winners}
                      losers={losers}
                      chartReady={chartReady}
                    />
                  )}
                  {subTab === "keyword-tracking" && (
                    <KeywordTracker
                      tracked={activeTracked}
                      avgPosition={avgTrackedPosition}
                      loading={keywordLoading}
                      storeMessage={keywordStoreMessage}
                      newKeyword={newKeyword}
                      setNewKeyword={setNewKeyword}
                      newTarget={newTarget}
                      setNewTarget={setNewTarget}
                      newVolume={newVolume}
                      setNewVolume={setNewVolume}
                      newDifficulty={newDifficulty}
                      setNewDifficulty={setNewDifficulty}
                      onAdd={addTrackedKeyword}
                      onDelete={removeTrackedKeyword}
                    />
                  )}
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function Header({
  activeSite,
  dateRange,
  theme,
  onTheme,
  onExport,
}: {
  activeSite: SandboxSite
  dateRange: DateRange
  theme: "dark" | "light"
  onTheme: () => void
  onExport: () => void
}) {
  return (
    <div className="hidden h-16 items-center justify-between border-b bg-background px-6 md:flex">
      <div className="text-sm text-muted-foreground">
        Properties / <span className="font-semibold text-foreground">{activeSite.name}</span>
        <span className="ml-3 rounded-md border bg-card px-2 py-1 text-xs">{dateRange}</span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={onTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
        <Button variant="outline" onClick={onExport}>
          <Copy />
          Export Data
        </Button>
      </div>
    </div>
  )
}

function MetricCards({
  metrics,
  activeMetric,
  onMetric,
}: {
  metrics: SandboxSite["metrics"]
  activeMetric: MetricKey
  onMetric: (metric: MetricKey) => void
}) {
  const cards = [
    { key: "clicks" as const, label: "Total Clicks", value: metrics.clicks.toLocaleString(), change: metrics.clicksChange },
    {
      key: "impressions" as const,
      label: "Impressions",
      value: metrics.impressions >= 1000000 ? `${(metrics.impressions / 1000000).toFixed(2)}M` : metrics.impressions.toLocaleString(),
      change: metrics.impressionsChange,
    },
    { key: "ctr" as const, label: "Avg. CTR", value: `${metrics.ctr.toFixed(2)}%`, change: metrics.ctrChange },
    { key: "position" as const, label: "Avg. Position", value: metrics.position.toFixed(1), change: metrics.positionChange * -1 },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.key}
          onClick={() => onMetric(card.key)}
          className={`rounded-md border bg-card p-4 text-left transition hover:bg-muted/50 ${
            activeMetric === card.key ? "border-primary ring-2 ring-primary/20" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-muted-foreground">{card.label}</span>
            <span className={`flex items-center gap-1 text-xs font-semibold ${card.change >= 0 ? "text-emerald-600" : "text-destructive"}`}>
              {card.change >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(card.change).toFixed(1)}%
            </span>
          </div>
          <div className="mt-3 text-2xl font-semibold">{card.value}</div>
        </button>
      ))}
    </section>
  )
}

function TrendChart({
  activeMetric,
  trends,
  dateRange,
  chartReady,
}: {
  activeMetric: MetricKey
  trends: SandboxSite["trends"]
  dateRange: DateRange
  chartReady: boolean
}) {
  const metricSeries: Array<{ key: MetricKey; label: string; color: string }> = [
    { key: "clicks", label: "Clicks", color: "#60a5fa" },
    { key: "impressions", label: "Impressions", color: "#a78bfa" },
    { key: "ctr", label: "CTR", color: "#34d399" },
    { key: "position", label: "Avg. position", color: "#fb7185" },
  ]
  const rangeLabel =
    dateRange === "7d" ? "Last 7 days" : dateRange === "28d" ? "Last 28 days" : dateRange === "3m" ? "Last 3 months" : "Last 6 months"

  const normalizedTrends = trends.map((point) => {
    const normalizedPoint: Record<string, number | string> = { date: point.date }

    metricSeries.forEach((series) => {
      const values = trends.map((trend) => trend[series.key])
      const min = Math.min(...values)
      const max = Math.max(...values)
      const raw = point[series.key]
      const normalized = max === min ? 50 : ((raw - min) / (max - min)) * 100

      normalizedPoint[series.key] = series.key === "position" ? 100 - normalized : normalized
    })

    return normalizedPoint
  })

  return (
    <div className="rounded-md border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Console Graph Analytics</h2>
          <p className="text-xs text-muted-foreground">{rangeLabel} normalized comparison across core GSC metrics</p>
        </div>
        <div className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground">
          <LineChart className="size-3" />
          Focus: {metricSeries.find((series) => series.key === activeMetric)?.label}
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {metricSeries.map((series) => (
          <div
            key={series.key}
            className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[0.6875rem] ${
              activeMetric === series.key ? "bg-muted text-foreground" : "text-muted-foreground"
            }`}
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: series.color }} />
            {series.label}
          </div>
        ))}
      </div>
      <div className="h-72">
        {chartReady ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={normalizedTrends} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                domain={[0, 100]}
                fontSize={11}
                tickFormatter={(value) => `${value}%`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value, name) => {
                  const series = metricSeries.find((item) => item.key === name)
                  return [`${Number(value).toFixed(1)}% normalized`, series?.label || name]
                }}
              />
              {metricSeries.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  stroke={series.color}
                  strokeWidth={activeMetric === series.key ? 3 : 2}
                  dot={false}
                  opacity={activeMetric === series.key ? 1 : 0.55}
                  activeDot={{ r: 5 }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        ) : (
          <ChartPlaceholder />
        )}
      </div>
    </div>
  )
}

function buildRangeTrends(activeSite: SandboxSite, dateRange: DateRange): SandboxSite["trends"] {
  if (dateRange === "7d") {
    return buildInterpolatedTrends(activeSite, 7, 0.25, (index) => `D ${index + 1}`, 0.08)
  }

  if (dateRange === "28d") {
    return buildInterpolatedTrends(activeSite, 28, 1, (index) => `D ${String(index + 1).padStart(2, "0")}`, 0.13)
  }

  if (dateRange === "3m") {
    return buildInterpolatedTrends(activeSite, 12, 3.1, (index) => `W ${String(index + 1).padStart(2, "0")}`, 0.18)
  }

  const sixMonthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  return buildInterpolatedTrends(activeSite, 6, 6.2, (index) => sixMonthLabels[index] || `M ${index + 1}`, 0.22)
}

function buildRangeMetrics(activeSite: SandboxSite, trends: SandboxSite["trends"]): SandboxSite["metrics"] {
  const totals = trends.reduce(
    (acc, point) => ({
      clicks: acc.clicks + point.clicks,
      impressions: acc.impressions + point.impressions,
      positionNumerator: acc.positionNumerator + point.position * point.impressions,
    }),
    { clicks: 0, impressions: 0, positionNumerator: 0 }
  )

  if (!trends.length || totals.impressions === 0) {
    return {
      ...activeSite.metrics,
      clicks: totals.clicks,
      ctr: 0,
      impressions: totals.impressions,
      position: 0,
    }
  }

  return {
    ...activeSite.metrics,
    clicks: Math.round(totals.clicks),
    ctr: (totals.clicks / totals.impressions) * 100,
    impressions: Math.round(totals.impressions),
    position: totals.positionNumerator / totals.impressions,
  }
}

function buildInterpolatedTrends(
  activeSite: SandboxSite,
  pointCount: number,
  scale: number,
  labelForIndex: (index: number) => string,
  variance: number
): SandboxSite["trends"] {
  const source = activeSite.trends.length ? activeSite.trends : [emptyTrendPoint("Start"), emptyTrendPoint("End")]

  return Array.from({ length: pointCount }, (_, index) => {
    const position = pointCount === 1 ? 0 : (index / (pointCount - 1)) * (source.length - 1)
    const lowerIndex = Math.floor(position)
    const upperIndex = Math.min(source.length - 1, lowerIndex + 1)
    const lower = source[lowerIndex]
    const upper = source[upperIndex]
    const progress = position - lowerIndex
    const wave = Math.sin((index + 1) * 1.7 + activeSite.id.length) * variance
    const inverseWave = Math.cos((index + 2) * 1.35 + activeSite.name.length) * variance

    const clicks = interpolate(lower.clicks, upper.clicks, progress) * scale * (1 + wave)
    const impressions = interpolate(lower.impressions, upper.impressions, progress) * scale * (1 + inverseWave)
    const ctr = interpolate(lower.ctr, upper.ctr, progress) * (1 + wave * 0.18)
    const avgPosition = interpolate(lower.position, upper.position, progress) * (1 - inverseWave * 0.08)

    return {
      date: labelForIndex(index),
      clicks: Math.max(0, Math.round(clicks)),
      impressions: Math.max(0, Math.round(impressions)),
      ctr: Number(Math.max(0.01, ctr).toFixed(2)),
      position: Number(Math.max(1, avgPosition).toFixed(1)),
    }
  })
}

function emptyTrendPoint(date: string) {
  return {
    clicks: 0,
    ctr: 0,
    date,
    impressions: 0,
    position: 0,
  }
}

function interpolate(start: number, end: number, progress: number) {
  return start + (end - start) * progress
}

function TabHeader({
  subTab,
  setSubTab,
  counts,
}: {
  subTab: SubTab
  setSubTab: (tab: SubTab) => void
  counts: { queries: number; pages: number; tracked: number }
}) {
  return (
    <div className="flex overflow-x-auto border-b bg-card">
      {navItems.map((item) => {
        const count = item.tab === "queries" ? counts.queries : item.tab === "pages" ? counts.pages : item.tab === "keyword-tracking" ? counts.tracked : null
        return (
          <button
            key={item.tab}
            onClick={() => setSubTab(item.tab)}
            className={`relative h-12 shrink-0 px-4 text-xs font-semibold uppercase tracking-wide ${
              subTab === item.tab ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {item.label}
            {count !== null ? ` (${count})` : ""}
            {subTab === item.tab && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
          </button>
        )
      })}
    </div>
  )
}

function FilterBar({
  query,
  subTab,
  setQuery,
  intentFilter,
  setIntentFilter,
  positionFilter,
  setPositionFilter,
}: {
  query: string
  subTab: SubTab
  setQuery: (query: string) => void
  intentFilter: string
  setIntentFilter: (filter: string) => void
  positionFilter: string
  setPositionFilter: (filter: string) => void
}) {
  return (
    <div className="flex flex-col gap-2 border-b bg-card/70 p-4 md:flex-row md:items-center md:justify-between">
      <label className="flex h-8 items-center gap-2 rounded-md border bg-background px-3 text-xs text-muted-foreground md:w-80">
        <Search className="size-4" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={subTab === "queries" ? "Search keys..." : "Search urls..."}
          className="min-w-0 flex-1 bg-transparent text-foreground outline-none"
        />
      </label>
      {subTab === "queries" && (
        <div className="flex flex-wrap gap-2">
          <select value={intentFilter} onChange={(event) => setIntentFilter(event.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs">
            <option value="all">Intents: All</option>
            <option value="Informational">Informational</option>
            <option value="Transactional">Transactional</option>
            <option value="Commercial">Commercial</option>
          </select>
          <select value={positionFilter} onChange={(event) => setPositionFilter(event.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs">
            <option value="all">Positions: All</option>
            <option value="top3">Top 3</option>
            <option value="top10">Top 10</option>
            <option value="page2">Position 11-20</option>
          </select>
        </div>
      )}
    </div>
  )
}

function QueriesTable({
  queries,
  scale,
  copied,
  onCopy,
}: {
  queries: GscQuery[]
  scale: number
  copied: boolean
  onCopy: (text: string) => void
}) {
  return (
    <DataTable
      headers={["Search term", "Clicks", "Impressions", "CTR", "Position", "Intent", "Actions"]}
      rows={queries.map((item) => [
        <div key="query">
          <div className="font-semibold">{item.query}</div>
          <div className="mt-1 text-[0.6875rem] text-muted-foreground">Score: {item.opportunityScore}</div>
        </div>,
        Math.round(item.clicks * scale).toLocaleString(),
        Math.round(item.impressions * scale).toLocaleString(),
        `${item.ctr.toFixed(2)}%`,
        item.position.toFixed(1),
        item.intent,
        <div key="actions" className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => onCopy(`Title: Best ${item.query} Guide`)}>
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>,
      ])}
    />
  )
}

function PagesTable({
  pages,
  scale,
}: {
  pages: SandboxSite["pages"]
  scale: number
}) {
  return (
    <DataTable
      headers={["Landing Page", "Clicks", "Impressions", "CTR", "Position", "Keyword"]}
      rows={pages.map((item) => [
        <span key="url" className="font-mono text-primary">{item.url}</span>,
        Math.round(item.clicks * scale).toLocaleString(),
        Math.round(item.impressions * scale).toLocaleString(),
        `${item.ctr.toFixed(2)}%`,
        item.position.toFixed(1),
        item.primaryKeyword,
      ])}
    />
  )
}

function CountriesView({ activeSite, scale }: { activeSite: SandboxSite; scale: number }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <DataTable
        headers={["Country", "Clicks", "Impressions", "CTR", "Position"]}
        rows={activeSite.countries.map((item) => [
          `${item.name} (${item.code})`,
          Math.round(item.clicks * scale).toLocaleString(),
          Math.round(item.impressions * scale).toLocaleString(),
          `${item.ctr.toFixed(2)}%`,
          item.position.toFixed(1),
        ])}
      />
      <div className="rounded-md border bg-card p-4">
        <h3 className="text-sm font-semibold">Geographic Insights</h3>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {activeSite.countries[0]?.name} is the dominant organic region. Localized metadata and intent-matched title variants are the strongest next step.
        </p>
      </div>
    </div>
  )
}

function DevicesView({ activeSite, scale, chartReady }: { activeSite: SandboxSite; scale: number; chartReady: boolean }) {
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <DataTable
        headers={["Device", "Clicks", "Impressions", "CTR"]}
        rows={activeSite.devices.map((item) => [
          <span key="device" className="flex items-center gap-2">
            {item.device === "Desktop" ? <Monitor className="size-4" /> : item.device === "Mobile" ? <Smartphone className="size-4" /> : <Layers className="size-4" />}
            {item.device}
          </span>,
          Math.round(item.clicks * scale).toLocaleString(),
          Math.round(item.impressions * scale).toLocaleString(),
          `${item.ctr.toFixed(2)}%`,
        ])}
      />
      <div className="h-72 rounded-md border bg-card p-4">
        {chartReady ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={activeSite.devices.map((item) => ({ name: item.device, value: item.clicks }))} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100}>
                {activeSite.devices.map((item, index) => (
                  <Cell key={item.device} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ChartPlaceholder />
        )}
      </div>
    </div>
  )
}

function MonthComparison({
  activeSite,
  monthA,
  monthB,
  setMonthA,
  setMonthB,
  trendA,
  trendB,
  winners,
  losers,
  chartReady,
}: {
  activeSite: SandboxSite
  monthA: string
  monthB: string
  setMonthA: (month: string) => void
  setMonthB: (month: string) => void
  trendA: SandboxSite["trends"][number]
  trendB: SandboxSite["trends"][number]
  winners: Array<GscQuery & { clickChange: number; clickChangePct: number; previousPosition: number }>
  losers: Array<GscQuery & { clickChange: number; clickChangePct: number; previousPosition: number }>
  chartReady: boolean
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-md border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">Compare Monthly GSC Profiles</h3>
          <p className="text-xs text-muted-foreground">Trace organic shifts, CTR deltas, and keyword position changes.</p>
        </div>
        <div className="flex gap-2">
          <select value={monthA} onChange={(event) => setMonthA(event.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs">
            {activeSite.trends.map((item) => (
              <option key={item.date} value={item.date}>{item.date}</option>
            ))}
          </select>
          <select value={monthB} onChange={(event) => setMonthB(event.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs">
            {activeSite.trends.map((item) => (
              <option key={item.date} value={item.date}>{item.date}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CompareCard label="Clicks" current={trendB.clicks.toLocaleString()} previous={trendA.clicks.toLocaleString()} delta={trendB.clicks - trendA.clicks} />
        <CompareCard label="Impressions" current={trendB.impressions.toLocaleString()} previous={trendA.impressions.toLocaleString()} delta={trendB.impressions - trendA.impressions} />
        <CompareCard label="CTR" current={`${trendB.ctr.toFixed(2)}%`} previous={`${trendA.ctr.toFixed(2)}%`} delta={trendB.ctr - trendA.ctr} />
        <CompareCard label="Position" current={trendB.position.toFixed(1)} previous={trendA.position.toFixed(1)} delta={(trendB.position - trendA.position) * -1} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 rounded-md border bg-card p-4">
          {chartReady ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: monthA, clicks: trendA.clicks }, { name: monthB, clicks: trendB.clicks }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="clicks" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder />
          )}
        </div>
        <WinnersLosers winners={winners} losers={losers} />
      </div>
    </div>
  )
}

function ChartPlaceholder() {
  return <div className="h-full rounded-md bg-muted" />
}

function CompareCard({ label, current, previous, delta }: { label: string; current: string; previous: string; delta: number }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="text-lg font-semibold">{current}</div>
        <div className="text-xs text-muted-foreground">vs {previous}</div>
      </div>
      <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${delta >= 0 ? "text-emerald-600" : "text-destructive"}`}>
        {delta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
        {delta >= 0 ? "+" : ""}{delta.toFixed(label === "CTR" || label === "Position" ? 2 : 0)}
      </div>
    </div>
  )
}

function WinnersLosers({
  winners,
  losers,
}: {
  winners: Array<GscQuery & { clickChange: number; clickChangePct: number; previousPosition: number }>
  losers: Array<GscQuery & { clickChange: number; clickChangePct: number; previousPosition: number }>
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[["Traffic Winners", winners], ["Traffic Declines", losers]].map(([title, items]) => (
        <div key={title as string} className="rounded-md border bg-card p-4">
          <h3 className="text-sm font-semibold">{title as string}</h3>
          <div className="mt-3 grid gap-3">
            {(items as typeof winners).map((item) => (
              <div key={item.query} className="flex justify-between gap-3 border-t pt-3 text-xs">
                <div className="min-w-0">
                  <div className="truncate font-medium">{item.query}</div>
                  <div className="text-muted-foreground">Rank {item.position.toFixed(1)} from {item.previousPosition.toFixed(1)}</div>
                </div>
                <div className={item.clickChange >= 0 ? "text-emerald-600" : "text-destructive"}>{item.clickChange}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function KeywordTracker({
  tracked,
  avgPosition,
  loading,
  storeMessage,
  newKeyword,
  setNewKeyword,
  newTarget,
  setNewTarget,
  newVolume,
  setNewVolume,
  newDifficulty,
  setNewDifficulty,
  onAdd,
  onDelete,
}: {
  tracked: TrackedKeyword[]
  avgPosition: string
  loading: boolean
  storeMessage: string
  newKeyword: string
  setNewKeyword: (value: string) => void
  newTarget: number
  setNewTarget: (value: number) => void
  newVolume: number
  setNewVolume: (value: number) => void
  newDifficulty: TrackedKeyword["difficulty"]
  setNewDifficulty: (value: TrackedKeyword["difficulty"]) => void
  onAdd: (event: React.FormEvent<HTMLFormElement>) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="grid gap-4">
      {storeMessage && (
        <div className="rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">{storeMessage}</div>
      )}
      <div className="grid gap-4 sm:grid-cols-4">
        <TrackerStat label="Average Position" value={`#${avgPosition}`} />
        <TrackerStat label="In Top 3" value={`${tracked.filter((item) => item.currentPosition <= 3).length}`} />
        <TrackerStat label="In Top 10" value={`${tracked.filter((item) => item.currentPosition <= 10).length}`} />
        <TrackerStat label="Total Volume" value={tracked.reduce((sum, item) => sum + item.volume, 0).toLocaleString()} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <DataTable
          headers={["Keyword", "Difficulty", "Volume", "Target", "Rank", "Status", "Action"]}
          rows={tracked.map((item) => [
            item.query,
            item.difficulty,
            item.volume.toLocaleString(),
            `#${item.targetPosition}`,
            `#${item.currentPosition.toFixed(1)}`,
            item.status,
            <div key="actions" className="flex justify-end gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => onDelete(item.id)} disabled={loading}><Trash2 /></Button>
            </div>,
          ])}
        />
        <form onSubmit={onAdd} className="rounded-md border bg-card p-4">
          <h3 className="text-sm font-semibold">Monitor New Keyword</h3>
          <div className="mt-4 grid gap-3">
            <input value={newKeyword} onChange={(event) => setNewKeyword(event.target.value)} placeholder="e.g. b2b growth strategy" className="h-8 rounded-md border bg-background px-3 text-xs outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <select value={newTarget} onChange={(event) => setNewTarget(Number(event.target.value))} className="h-8 rounded-md border bg-background px-2 text-xs">
                <option value={1}>#1</option>
                <option value={3}>#3</option>
                <option value={5}>#5</option>
                <option value={10}>#10</option>
              </select>
              <select value={newDifficulty} onChange={(event) => setNewDifficulty(event.target.value as TrackedKeyword["difficulty"])} className="h-8 rounded-md border bg-background px-2 text-xs">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <input type="number" value={newVolume} onChange={(event) => setNewVolume(Number(event.target.value))} className="h-8 rounded-md border bg-background px-3 text-xs outline-none" />
            <Button type="submit" disabled={loading}>
              {loading ? <RefreshCw className="animate-spin" /> : <Plus />}
              Add keyword tracking
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TrackerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <table className="w-full min-w-[760px] text-left text-xs">
        <thead className="bg-muted/70 text-muted-foreground">
          <tr>
            {headers.map((header, index) => (
              <th key={header} className={`px-3 py-3 font-medium ${index > 0 ? "text-right" : ""}`}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={`px-3 py-3 align-middle ${cellIndex > 0 ? "text-right" : ""}`}>{cell}</td>
              ))}
            </tr>
          )) : (
            <tr><td colSpan={headers.length} className="px-3 py-8 text-center text-muted-foreground">No records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
