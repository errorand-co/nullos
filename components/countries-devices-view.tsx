"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { GscCountry, GscDevice } from "@/lib/seo-types"

function formatNumber(value: number): string {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

function Chart({ data, labelKey, valueKey }: { data: Array<Record<string, string | number>>; labelKey: string; valueKey: string }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const f = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(f)
  }, [])
  if (!ready) return <div className="h-48 rounded-md bg-muted" />
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey={labelKey} className="text-muted-foreground" fontSize={10} />
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
          <Bar dataKey={valueKey} className="fill-primary" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CountriesDevicesView({ countries, devices }: { countries: GscCountry[]; devices: GscDevice[] }) {
  const countryData = countries.map((c) => ({ name: c.name, clicks: c.clicks }))
  const deviceData = devices.map((d) => ({ name: d.device, clicks: d.clicks }))

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">Countries &amp; Devices</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Clicks by Country</h2>
          <Chart data={countryData} labelKey="name" valueKey="clicks" />
          <table className="mt-3 w-full text-xs">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-2 font-medium">Country</th>
                <th className="pb-2 text-right font-medium">Clicks</th>
                <th className="pb-2 text-right font-medium">CTR</th>
                <th className="pb-2 text-right font-medium">Position</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{c.name}</td>
                  <td className="py-2 text-right">{formatNumber(c.clicks)}</td>
                  <td className="py-2 text-right">{c.ctr.toFixed(2)}%</td>
                  <td className="py-2 text-right">{c.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-md border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Clicks by Device</h2>
          <Chart data={deviceData} labelKey="name" valueKey="clicks" />
          <table className="mt-3 w-full text-xs">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-2 font-medium">Device</th>
                <th className="pb-2 text-right font-medium">Clicks</th>
                <th className="pb-2 text-right font-medium">CTR</th>
                <th className="pb-2 text-right font-medium">Position</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{d.device}</td>
                  <td className="py-2 text-right">{formatNumber(d.clicks)}</td>
                  <td className="py-2 text-right">{d.ctr.toFixed(2)}%</td>
                  <td className="py-2 text-right">{d.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}