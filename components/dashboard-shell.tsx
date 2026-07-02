"use client"

import { useState } from "react"
import {
  BarChart3,
  Calendar,
  ChevronDown,
  FileText,
  Globe,
  ListChecks,
  LogOut,
  Moon,
  Search,
  Sun,
  Target,
  Zap,
} from "lucide-react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SandboxSite } from "@/lib/seo-types"

const navSections = [
  {
    label: "Sites",
    items: [
      { segment: "", label: "Overview", icon: BarChart3 },
      { segment: "/queries", label: "Queries", icon: Search },
      { segment: "/pages", label: "Pages", icon: FileText },
      { segment: "/countries", label: "Countries", icon: Globe },
      { segment: "/keyword-tracking", label: "Keywords", icon: Target },
      { segment: "/insights", label: "Insights", icon: ListChecks },
    ],
  },
]

export const dateRangeOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "28d", label: "Last 28 days" },
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "12m", label: "Last 12 months" },
  { value: "16m", label: "All time" },
]

export const aggregateOptions = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
] as const

export const comparisonOptions = [
  { value: "previous", label: "vs Previous period" },
  { value: "year", label: "vs Same period last year" },
  { value: "none", label: "No comparison" },
] as const

export function DashboardShell({
  userEmail,
  sites,
  demo,
  configured,
  children,
}: {
  userEmail: string
  sites: SandboxSite[]
  demo: boolean
  configured: boolean
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const pathname = usePathname()

  const pathParts = pathname.split("/").filter(Boolean)
  const activeSiteId = pathParts[1] || sites[0]?.id || ""
  const activeSite = sites.find((s) => s.id === activeSiteId) || sites[0]
  const siteBase = `/dashboard/${activeSiteId}`

  const activeNavItem = navSections[0].items.find(
    (item) => pathname === `${siteBase}${item.segment}` || (item.segment === "" && pathname === siteBase),
  )
  const pageLabel = activeNavItem?.label || "Overview"

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <main className="h-svh overflow-hidden bg-background text-foreground">
        <div className="flex h-svh flex-col overflow-hidden md:flex-row">
          {/* Sidebar */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-60 transform border-r bg-card transition-transform md:static md:flex md:h-svh md:translate-x-0 md:flex-col",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="flex h-14 items-center gap-2 border-b px-4">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Zap className="size-3.5" />
              </div>
              <span className="text-sm font-semibold">SEO Insight</span>
            </div>

            <div className="border-b p-4">
              <div className="mb-2 flex items-center gap-2">
                <Globe className="size-3.5 text-muted-foreground" />
                <span className="text-[0.6875rem] font-medium uppercase text-muted-foreground">
                  Connected Site
                </span>
              </div>
              <select
                value={activeSiteId}
                onChange={(event) => {
                  const newId = event.target.value
                  if (newId) window.location.href = `/dashboard/${newId}`
                }}
                className="mb-1 h-8 w-full rounded-md border bg-background px-2 text-xs outline-none"
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
              <div className="truncate font-mono text-[0.6875rem] text-muted-foreground">
                {activeSite?.url}
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
              {navSections.map((section) => (
                <div key={section.label} className="mb-4">
                  <div className="mb-1 px-2 text-[0.6875rem] font-medium uppercase text-muted-foreground">
                    {section.label}
                  </div>
                  <div className="grid gap-0.5">
                    {section.items.map((item) => {
                      const href = `${siteBase}${item.segment}`
                      const isActive =
                        pathname === href || (item.segment === "" && pathname === siteBase)
                      return (
                        <a
                          key={item.segment}
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex h-8 items-center gap-2 rounded-md px-2 text-xs font-medium transition",
                            isActive
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                          )}
                        >
                          <item.icon className="size-3.5" />
                          {item.label}
                        </a>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t p-3">
              <div className="mb-2 px-2 text-[0.6875rem] font-medium uppercase text-muted-foreground">
                Account
              </div>
              <div className="mb-2 truncate px-2 text-xs text-muted-foreground">{userEmail}</div>
              <form action="/auth/logout" method="post">
                <Button variant="outline" size="sm" type="submit" className="w-full justify-start">
                  <LogOut />
                  Sign Out
                </Button>
              </form>
            </div>
          </aside>

          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-background/80 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}

          <div className="flex h-svh flex-1 flex-col overflow-hidden">
            {/* Top bar */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">{activeSite?.name || "—"}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground">{pageLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Date range picker */}
                <SelectPill
                  icon={<Calendar className="size-3.5" />}
                  options={dateRangeOptions}
                  defaultValue="28d"
                />

                {/* Theme toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label="Toggle theme"
                  className="size-7"
                >
                  {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                </Button>

                <div className="flex size-7 items-center justify-center rounded-full bg-primary text-[0.6875rem] font-medium text-primary-foreground">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SelectPill({
  icon,
  options,
  defaultValue,
}: {
  icon?: React.ReactNode
  options: Array<{ value: string; label: string }>
  defaultValue: string
}) {
  return (
    <div className="relative">
      <select
        defaultValue={defaultValue}
        className="h-8 appearance-none rounded-md border bg-background pl-7 pr-7 text-xs outline-none cursor-pointer hover:bg-muted/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {icon && (
        <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}