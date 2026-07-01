import type { User } from "@supabase/supabase-js"

import { isSupabaseConfigured } from "@/lib/env"
import { sandboxSites } from "@/lib/seo-data"
import type { SandboxSite } from "@/lib/seo-types"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type WebsiteRow = {
  audience: string
  data: SandboxSite
  id: string
  name: string
  sector: string
  source: string
  url: string
}

export type WebsiteListResult = {
  configured: boolean
  demo: boolean
  sites: SandboxSite[]
  missingTable?: boolean
}

function fromWebsiteRow(row: WebsiteRow): SandboxSite {
  return {
    ...row.data,
    audience: row.audience || row.data.audience,
    id: row.id,
    name: row.name,
    sector: row.sector || row.data.sector,
    url: row.url,
  }
}

function toWebsiteRow(site: SandboxSite, userId: string, source = "manual"): WebsiteRow & { user_id: string } {
  return {
    audience: site.audience,
    data: site,
    id: site.id,
    name: site.name,
    sector: site.sector,
    source,
    url: site.url,
    user_id: userId,
  }
}

export async function listWebsites(user: User): Promise<WebsiteListResult> {
  if (!isSupabaseConfigured()) {
    return { configured: false, demo: true, sites: sandboxSites }
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("websites")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) {
    // Table doesn't exist yet — fall back to demo data, flagged.
    if (error.code === "42P01" || error.code === "PGRST205") {
      return { configured: true, demo: true, sites: sandboxSites, missingTable: true }
    }
    // RLS or other error — don't throw, surface demo data.
    return { configured: true, demo: true, sites: sandboxSites }
  }

  return {
    configured: true,
    demo: false,
    sites: data.length ? data.map(fromWebsiteRow) : sandboxSites,
  }
}

export async function upsertWebsite(site: SandboxSite, userId: string, source = "manual"): Promise<SandboxSite> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("websites")
    .upsert(toWebsiteRow(site, userId, source), { onConflict: "user_id,url" })

  if (error) throw error

  return site
}

export async function deleteWebsite(siteId: string): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("websites").delete().eq("id", siteId)

  if (error) throw error
}