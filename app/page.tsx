import { redirect } from "next/navigation"

import { SeoDashboard } from "@/components/seo-dashboard"
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server"

export default async function Page() {
  const supabase = await createSupabaseAuthServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <SeoDashboard userEmail={user.email || "Signed in"} />
}
