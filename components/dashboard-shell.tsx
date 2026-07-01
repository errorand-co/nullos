"use client"

import { useState } from "react"
import { BarChart3, FileText, Globe, ListChecks, LogOut, Menu, Search, Target, Zap } from "lucide-react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SandboxSite } from "@/lib/seo-types"

const navItems = [
  { segment: "", label: "Overview", icon: BarChart3 },
  { segment: "/queries", label: "Queries", icon: Search },
  { segment: "/pages", label: "Pages", icon: FileText },
  { segment: "/countries", label: "Countries", icon: Globe },
  { segment: "/keyword-tracking", label: "Keywords", icon: Target },
  { segment: "/insights", label: "Insights", icon: ListChecks },
]

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
  const pathname = usePathname()

  // Derive the active site ID from the URL: /dashboard/[siteId]/...
  const pathParts = pathname.split("/").filter(Boolean)
  const activeSiteId = pathParts[1] || sites[0]?.id || ""
  const activeSite = sites.find((s) => s.id === activeSiteId) || sites[0]

  // Base path for this site: /dashboard/[siteId]
  const siteBase = `/dashboard/${activeSiteId}`

  return (
    <div className="dark">
      <main className="h-svh overflow-hidden bg-background text-foreground">
        <div className="flex h-svh flex-col overflow-hidden md:flex-row">
          {/* Mobile header */}
          <div className="flex items-center justify-between border-b p-3 md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Zap className="size-3.5" />
              </div>
              <span className="text-sm font-semibold">SEO Insight</span>
            </div>
            <button onClick={() => setMobileOpen((v) => !v)} className="rounded-md border p-1.5">
              <Menu className="size-4" />
            </button>
          </div>

          {/* Sidebar */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform md:static md:flex md:h-svh md:translate-x-0 md:flex-col md:justify-between",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
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
              <div className="mb-2 h-9 w-full rounded-md border bg-background px-3 text-xs leading-9">
                {activeSite?.name || "No site"}
              </div>
              <div className="mb-6 truncate font-mono text-[0.6875rem] text-muted-foreground">
                {activeSite?.url}
              </div>

              <nav className="grid gap-1">
                {navItems.map((item) => {
                  const href = `${siteBase}${item.segment}`
                  const isActive = pathname === href || (item.segment === "" && pathname === siteBase)
                  return (
                    <a
                      key={item.segment}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex h-9 items-center gap-2 rounded-md px-3 text-left text-xs font-medium transition",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </a>
                  )
                })}
              </nav>
            </div>

            <div>
              {demo && (
                <div className="mx-4 mb-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[0.6875rem] text-amber-600">
                  {configured
                    ? "Schema missing — run supabase/schema.sql. Showing demo data."
                    : "Demo mode — configure Supabase to persist data."}
                </div>
              )}
              <div className="border-t p-4">
                <div className="text-xs font-medium">User</div>
                <div className="truncate text-[0.6875rem] text-muted-foreground">{userEmail}</div>
                <form action="/auth/logout" method="post" className="mt-3">
                  <Button className="w-full justify-start" variant="outline" size="sm" type="submit">
                    <LogOut />
                    Sign Out
                  </Button>
                </form>
              </div>
            </div>
          </aside>

          {/* Mobile overlay */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-background/80 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}

          {/* Main content */}
          <div className="flex h-svh flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
          </div>
        </div>
      </main>
    </div>
  )
}