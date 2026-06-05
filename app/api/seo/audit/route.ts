import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

import { requireAuthenticatedUser } from "@/lib/auth-guard"
import { getOfflineAudit } from "@/lib/seo-ai"
import type { GscMetrics, GscPage, GscQuery } from "@/lib/seo-types"

type AuditRequest = {
  siteName: string
  metrics: GscMetrics
  topKeywords: GscQuery[]
  topPages: GscPage[]
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser()
  if (auth.error) return auth.error

  const body = (await request.json()) as AuditRequest

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ result: getOfflineAudit(body.siteName, body.metrics), source: "offline" })
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Analyze this Google Search Console SEO snapshot for "${body.siteName}".

Metrics:
${JSON.stringify(body.metrics, null, 2)}

Top keywords:
${JSON.stringify(body.topKeywords, null, 2)}

Top landing pages:
${JSON.stringify(body.topPages, null, 2)}

Return an actionable SEO audit with executive summary, opportunities, technical audit, content strategy, and SWOT.`,
    config: {
      systemInstruction:
        "You are a senior SEO consultant specializing in Google Search Console analysis and growth strategy.",
      temperature: 0.7,
    },
  })

  return NextResponse.json({ result: response.text, source: "gemini" })
}
