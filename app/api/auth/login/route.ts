import { NextResponse } from "next/server"

import { checkCredentials, setSessionCookie } from "@/lib/auth"

export async function POST(request: Request) {
  let body: { username?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const username = (body.username ?? "").trim()
  const password = body.password ?? ""

  if (!checkCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 })
  }

  await setSessionCookie(username)
  return NextResponse.json({ ok: true })
}