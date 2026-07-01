import { redirect } from "next/navigation"

import { SeoDashboard } from "@/components/seo-dashboard"
import { getCurrentUser } from "@/lib/auth"

export default async function Page() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <SeoDashboard userEmail={user.username} />
}