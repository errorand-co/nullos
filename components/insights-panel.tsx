"use client"

import { useState } from "react"
import { Copy, Check, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { GscMetrics, GscPage, GscQuery } from "@/lib/seo-types"

type Tab = "audit" | "strategy" | "brief"

export function InsightsPanel({
  siteName,
  metrics,
  topKeywords,
  topPages,
}: {
  siteName: string
  metrics: GscMetrics
  topKeywords: GscQuery[]
  topPages: GscPage[]
}) {
  const [tab, setTab] = useState<Tab>("audit")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setError("")
    setResult("")

    try {
      const body =
        tab === "audit"
          ? { siteName, metrics, topKeywords, topPages }
          : tab === "strategy"
            ? { queries: topKeywords }
            : { keyword: topKeywords[0]?.query || "", position: topKeywords[0]?.position || 0, ctr: topKeywords[0]?.ctr || 0 }

      const res = await fetch(`/api/seo/${tab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed" }))
        throw new Error(data.error || "Could not generate insights.")
      }

      const data = (await res.json()) as { result: string }
      setResult(data.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate insights.")
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "audit", label: "SEO Audit" },
    { id: "strategy", label: "Keyword Strategy" },
    { id: "brief", label: "Content Brief" },
  ]

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">AI Insights</h1>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id)
              setResult("")
              setError("")
            }}
            className={`flex h-9 items-center rounded-md px-3 text-xs font-medium transition ${
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "border text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Button onClick={generate} disabled={loading} size="sm" className="w-fit">
        <Zap />
        {loading ? "Generating..." : `Generate ${tabs.find((t) => t.id === tab)?.label}`}
      </Button>

      {error && <div className="rounded-md border bg-background px-3 py-2 text-xs text-red-500">{error}</div>}

      {result && (
        <div className="relative rounded-md border bg-card p-4">
          <button
            onClick={copy}
            className="absolute right-3 top-3 rounded-md border p-1.5 text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
          <pre className="whitespace-pre-wrap text-xs">{result}</pre>
        </div>
      )}
    </div>
  )
}