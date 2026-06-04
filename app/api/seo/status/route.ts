import { NextResponse } from "next/server"

export function GET() {
  return NextResponse.json({ hasApiKey: Boolean(process.env.GEMINI_API_KEY) })
}
