import type { User } from "@supabase/supabase-js"

import { isSupabaseConfigured } from "@/lib/env"
import type { TrackedKeyword } from "@/lib/seo-types"
import { createSupabaseServerClient } from "@/lib/supabase/server"

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

export type TrackedKeywordListResult = {
  configured: boolean
  demo: boolean
  keywords: TrackedKeyword[]
  missingTable?: boolean
}

function toRow(keyword: TrackedKeyword, userId: string): TrackedKeywordRow & { user_id: string } {
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
    user_id: userId,
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

export async function listTrackedKeywords(user: User, siteId?: string): Promise<TrackedKeywordListResult> {
  if (!isSupabaseConfigured()) {
    return { configured: false, demo: true, keywords: [] }
  }

  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("tracked_keywords")
    .select("*")
    .order("created_at", { ascending: false })

  if (siteId) {
    query = query.eq("site_id", siteId)
  }

  const { data, error } = await query

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return { configured: true, demo: true, keywords: [], missingTable: true }
    }
    return { configured: true, demo: true, keywords: [] }
  }

  return {
    configured: true,
    demo: false,
    keywords: data.map(fromRow),
  }
}

export async function createTrackedKeyword(keyword: TrackedKeyword, userId: string): Promise<TrackedKeyword> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("tracked_keywords").insert(toRow(keyword, userId))

  if (error) throw error

  return keyword
}

export async function deleteTrackedKeyword(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("tracked_keywords").delete().eq("id", id)

  if (error) throw error
}