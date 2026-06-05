import { getSupabaseServerClient, hasSupabaseCredentials } from "@/lib/supabase-server"
import type { TrackedKeyword } from "@/lib/seo-types"

type TrackedKeywordRow = {
  current_position: number
  date_added: string
  difficulty: TrackedKeyword["difficulty"]
  id: string
  previous_position: number
  query: string
  site_id: string
  status: TrackedKeyword["status"]
  target_position: number
  volume: number
}

export async function listTrackedKeywords(siteId?: string) {
  if (!hasSupabaseCredentials()) {
    return {
      configured: false,
      keywords: [],
    }
  }

  const supabase = getSupabaseServerClient()
  let query = supabase.from("tracked_keywords").select("*").order("created_at", { ascending: false })

  if (siteId) {
    query = query.eq("site_id", siteId)
  }

  const { data, error } = await query

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return {
        configured: true,
        keywords: [],
        missingTable: true,
      }
    }

    if (error.code === "42501") {
      return {
        configured: true,
        keywords: [],
        missingGrant: true,
      }
    }

    throw error
  }

  return {
    configured: true,
    keywords: data.map(fromRow),
  }
}

export async function createTrackedKeyword(keyword: TrackedKeyword) {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from("tracked_keywords").insert(toRow(keyword))

  if (error) throw error

  return keyword
}

export async function deleteTrackedKeyword(id: string) {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from("tracked_keywords").delete().eq("id", id)

  if (error) throw error
}

function toRow(keyword: TrackedKeyword): TrackedKeywordRow {
  return {
    current_position: keyword.currentPosition,
    date_added: keyword.dateAdded,
    difficulty: keyword.difficulty,
    id: keyword.id,
    previous_position: keyword.previousPosition,
    query: keyword.query,
    site_id: keyword.siteId,
    status: keyword.status,
    target_position: keyword.targetPosition,
    volume: keyword.volume,
  }
}

function fromRow(row: TrackedKeywordRow): TrackedKeyword {
  return {
    currentPosition: Number(row.current_position),
    dateAdded: row.date_added,
    difficulty: row.difficulty,
    id: row.id,
    previousPosition: Number(row.previous_position),
    query: row.query,
    siteId: row.site_id,
    status: row.status,
    targetPosition: row.target_position,
    volume: row.volume,
  }
}
