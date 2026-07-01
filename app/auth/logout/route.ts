import { NextResponse } from "next/server"

import { clearSessionCookie } from "@/lib/auth"

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL("/auth/login", request.url), {
    status: 303,
  })
  res.headers.set("Set-Cookie", await clearSessionCookie())
  return res
}