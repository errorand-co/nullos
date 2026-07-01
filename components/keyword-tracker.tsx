"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import type { TrackedKeyword } from "@/lib/seo-types"

const difficultyOptions = ["Easy", "Medium", "Hard"] as const

export function KeywordTracker({
  siteId,
  initialKeywords,
  configured,
  demo,
}: {
  siteId: string
  initialKeywords: TrackedKeyword[]
  configured: boolean
  demo: boolean
}) {
  const [keywords, setKeywords] = useState(initialKeywords)
  const [newKeyword, setNewKeyword] = useState("")
  const [newTarget, setNewTarget] = useState(3)
  const [newVolume, setNewVolume] = useState(1000)
  const [newDifficulty, setNewDifficulty] = useState<TrackedKeyword["difficulty"]>("Medium")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  async function addKeyword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = newKeyword.trim()
    if (!trimmed) return

    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/tracked-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty: newDifficulty,
          query: trimmed,
          siteId,
          targetPosition: newTarget,
          volume: newVolume,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed" }))
        throw new Error(data.error || "Could not save keyword.")
      }

      const data = (await res.json()) as { keyword: TrackedKeyword }
      setKeywords((prev) => [data.keyword, ...prev])
      setNewKeyword("")
      setNewTarget(3)
      setNewVolume(1000)
      setNewDifficulty("Medium")
      router.refresh()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save keyword.")
    } finally {
      setLoading(false)
    }
  }

  async function removeKeyword(id: string) {
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch(`/api/tracked-keywords/${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed" }))
        throw new Error(data.error || "Could not delete keyword.")
      }
      setKeywords((prev) => prev.filter((k) => k.id !== id))
      router.refresh()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not delete keyword.")
    } finally {
      setLoading(false)
    }
  }

  const avgPosition =
    keywords.length === 0
      ? "0.0"
      : (keywords.reduce((sum, k) => sum + k.currentPosition, 0) / keywords.length).toFixed(1)

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Keyword Tracking</h1>
        <div className="text-xs text-muted-foreground">
          {keywords.length} tracked · avg position {avgPosition}
        </div>
      </div>

      {demo && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
          {configured
            ? "Run supabase/schema.sql to persist keywords."
            : "Demo mode — keywords won't persist until Supabase is configured."}
        </div>
      )}

      {message && <div className="rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">{message}</div>}

      <form onSubmit={addKeyword} className="grid gap-3 rounded-md border bg-card p-4">
        <h2 className="text-sm font-semibold">Add Keyword</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <label className="grid gap-1 text-xs font-medium">
            Keyword
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              required
              className="h-9 rounded-md border bg-background px-3 text-xs outline-none"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium">
            Target Position
            <input
              type="number"
              value={newTarget}
              onChange={(e) => setNewTarget(Number(e.target.value))}
              min={1}
              className="h-9 rounded-md border bg-background px-3 text-xs outline-none"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium">
            Volume
            <input
              type="number"
              value={newVolume}
              onChange={(e) => setNewVolume(Number(e.target.value))}
              min={0}
              className="h-9 rounded-md border bg-background px-3 text-xs outline-none"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium">
            Difficulty
            <select
              value={newDifficulty}
              onChange={(e) => setNewDifficulty(e.target.value as TrackedKeyword["difficulty"])}
              className="h-9 rounded-md border bg-background px-2 text-xs outline-none"
            >
              {difficultyOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button type="submit" disabled={loading} size="sm" className="w-fit">
          <Plus />
          {loading ? "Saving..." : "Add Keyword"}
        </Button>
      </form>

      <div className="rounded-md border">
        <table className="w-full text-xs">
          <thead className="border-b bg-muted/50">
            <tr className="text-left">
              <th className="p-3 font-medium">Keyword</th>
              <th className="p-3 text-right font-medium">Current</th>
              <th className="p-3 text-right font-medium">Previous</th>
              <th className="p-3 text-right font-medium">Target</th>
              <th className="p-3 text-right font-medium">Volume</th>
              <th className="p-3 font-medium">Difficulty</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((k) => (
              <tr key={k.id} className="border-b last:border-0">
                <td className="p-3">{k.query}</td>
                <td className="p-3 text-right">{k.currentPosition.toFixed(1)}</td>
                <td className="p-3 text-right">{k.previousPosition.toFixed(1)}</td>
                <td className="p-3 text-right">{k.targetPosition}</td>
                <td className="p-3 text-right">{k.volume.toLocaleString()}</td>
                <td className="p-3 text-muted-foreground">{k.difficulty}</td>
                <td className="p-3">
                  <span
                    className={
                      k.status === "On Track"
                        ? "text-emerald-500"
                        : k.status === "Needs Attention"
                          ? "text-amber-500"
                          : "text-red-500"
                    }
                  >
                    {k.status}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => removeKeyword(k.id)}
                    disabled={loading}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {keywords.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-muted-foreground">
                  No tracked keywords yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}