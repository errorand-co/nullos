"use client"

import { useEffect, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { GscTrendPoint } from "@/lib/seo-types"

export function TrendChart({ trends }: { trends: GscTrendPoint[] }) {
  const [chartReady, setChartReady] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setChartReady(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  if (!chartReady) {
    return <div className="h-64 rounded-md bg-muted" />
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trends}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" className="text-muted-foreground" fontSize={10} />
          <YAxis className="text-muted-foreground" fontSize={10} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
          />
          <Line type="monotone" dataKey="clicks" className="stroke-primary" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}