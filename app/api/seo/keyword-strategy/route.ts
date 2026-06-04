import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

import { getOfflineStrategy } from "@/lib/seo-ai"
import type { GscQuery } from "@/lib/seo-types"

type StrategyRequest = {
  keywords: GscQuery[]
}

export async function POST(request: Request) {
  const body = (await request.json()) as StrategyRequest

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ result: getOfflineStrategy(body.keywords), source: "offline" })
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Create a page-one pivot strategy for these GSC keywords:
${JSON.stringify(body.keywords, null, 2)}

For each keyword include intent, title, description, LSI terms, and one content modification tip.`,
    config: {
      systemInstruction: "You are a technical SEO copywriter focused on CTR and on-page ranking improvements.",
      temperature: 0.65,
    },
  })

  return NextResponse.json({ result: response.text, source: "gemini" })
}
