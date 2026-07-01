import { type NextRequest, NextResponse } from "next/server"

import { isSupabaseConfigured } from "@/lib/env"
import { createSupabaseProxyClient } from "@/lib/supabase/proxy"

/**
 * Auth gate — runs on every matched request. Refreshes the Supabase session
 * cookie and redirects unauthenticated users to the login page.
 *
 * This replaces the deprecated `middleware.ts` convention in Next.js 16.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow auth routes through without a session.
  const isAuthRoute = pathname.startsWith("/auth")
  const isApiAuthRoute = pathname.startsWith("/api/auth")

  // If Supabase isn't configured, redirect everything except auth to login.
  // The login page will show, and the stores will serve demo data.
  if (!isSupabaseConfigured()) {
    if (isAuthRoute || isApiAuthRoute) {
      return NextResponse.next({ request })
    }
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/auth/login"
    return NextResponse.redirect(loginUrl)
  }

  const { supabase, response } = createSupabaseProxyClient(request)

  // Refresh the session — this updates the cookie if the token was rotated.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (isAuthRoute || isApiAuthRoute) {
    return response
  }

  // Redirect to login if no session.
  if (!session) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/auth/login"
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    // Match everything except static assets and Next internals.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)",
  ],
}