import { redirect } from "next/navigation"

import { AuthForm } from "@/components/auth-form"
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server"

export default async function LoginPage() {
  const supabase = await createSupabaseAuthServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/")
  }

  return <AuthForm />
}
