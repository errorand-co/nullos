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

export type TrendMetric = "clicks" | "impressions" | "ctr" | "position"

const metricConfig: Record<TrendMetric, { label: string; color: string; format: (v: number) => string }> = {
  clicks: { label: "Clicks", color: "var(--primary)", format: (v) => v.toLocaleString() },
  impressions: { label: "Impressions", color: "#3b82f6", format: (v) => v.toLocaleString() },
  ctr: { label: "CTR", color: "#10b981", format: (v) => `${v.toFixed(2)}%` },
  position: { label: "Avg Position", color: "#f59e0b", format: (v) => v.toFixed(1) },
}

export function TrendChart({ trends, metric }: { trends: GscTrendPoint[]; metric: TrendMetric }) {
  const [chartReady, setChartReady] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setChartReady(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  if (!chartReady) {
    return <div className="h-64 rounded-md bg-muted" />
  }

  // Show only every Nth date label to avoid crowding
  const tickInterval = Math.max(1, Math.floor(trends.length / 10))
  const config = metricConfig[metric]

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trends} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            type="category"
            className="text-muted-foreground"
            fontSize={10}
            interval={tickInterval - 1}
            tickFormatter={(value: string) => value?.slice(5) || value}
          />
          <YAxis
            className="text-muted-foreground"
            fontSize={10}
            tickFormatter={(v: number) =>
              metric === "ctr" ? `${v.toFixed(1)}%` : metric === "position" ? v.toFixed(0) : v.toLocaleString()
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value) => [config.format(Number(value)), config.label]}
          />
          <Line
            type="monotone"
            dataKey={metric}
            stroke={config.color}
            strokeWidth={2}
            dot={false}
            name={config.label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
