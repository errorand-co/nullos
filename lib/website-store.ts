import { sandboxSites } from "@/lib/seo-data"
import { getSupabaseServerClient, hasSupabaseCredentials } from "@/lib/supabase-server"
import type { SandboxSite } from "@/lib/seo-types"

type WebsiteRow = {
  audience: string
  data: SandboxSite
  id: string
  name: string
  sector: string
  source: string
  url: string
}

export function toWebsiteRow(site: SandboxSite, source = "manual") {
  return {
    audience: site.audience,
    data: site,
    id: site.id,
    name: site.name,
    sector: site.sector,
    source,
    url: site.url,
  }
}

export async function listWebsites() {
  if (!hasSupabaseCredentials()) {
    return {
      configured: false,
      sites: sandboxSites,
    }
  }

  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.from("websites").select("*").order("created_at", { ascending: true })

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return {
        configured: true,
        missingTable: true,
        sites: sandboxSites,
      }
    }

    if (error.code === "42501") {
      return {
        configured: true,
        missingGrant: true,
        sites: sandboxSites,
      }
    }

    throw error
  }

  return {
    configured: true,
    sites: data.length ? data.map(fromWebsiteRow) : sandboxSites,
  }
}

export async function upsertWebsite(site: SandboxSite, source = "manual") {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from("websites").upsert(toWebsiteRow(site, source), { onConflict: "url" })

  if (error) throw error

  return site
}

export async function deleteWebsite(siteId: string) {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from("websites").delete().eq("id", siteId)

  if (error) throw error
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
