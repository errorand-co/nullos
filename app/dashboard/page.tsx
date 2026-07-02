import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"
import { listGscSites } from "@/lib/gsc-store"

export default async function DashboardIndexPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const { sites } = await listGscSites(user)

  if (sites.length > 0) {
    redirect(`/dashboard/${sites[0].id}`)
  }

  redirect("/auth/login")
}