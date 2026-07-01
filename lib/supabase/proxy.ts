import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import { env } from "@/lib/env"

/**
 * Supabase client for proxy.ts. Operates on request/response cookies directly
 * so session refresh headers flow back to the browser in the response.
 */
export function createSupabaseProxyClient(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
            request.cookies.set(name, value)
          })
        },
      },
    },
  )

  return { supabase, response }
}