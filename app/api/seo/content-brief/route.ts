import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

import { requireAuthenticatedUser } from "@/lib/auth-guard"
import { getOfflineBrief } from "@/lib/seo-ai"

type BriefRequest = {
  keyword: string
  currentPosition: number
  currentCTR: number
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser()
  if (auth.error) return auth.error

  const body = (await request.json()) as BriefRequest

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      result: getOfflineBrief(body.keyword, body.currentPosition, body.currentCTR),
      source: "offline",
    })
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Generate an SEO content brief for "${body.keyword}".
Current position: ${body.currentPosition}
Current CTR: ${body.currentCTR}%

Include H1, audience, outline, featured snippet target, and competitor gap wins.`,
    config: {
      systemInstruction: "You are a semantic SEO content architect.",
      temperature: 0.7,
    },
  })

  return NextResponse.json({ result: response.text, source: "gemini" })
}
