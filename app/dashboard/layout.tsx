import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { getCurrentUser } from "@/lib/auth"
import { listGscSites } from "@/lib/gsc-store"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { sites, demo, configured } = await listGscSites(user)

  return (
    <DashboardShell
      userEmail={user.email || "Signed in"}
      sites={sites}
      demo={demo}
      configured={configured}
    >
      {children}
    </DashboardShell>
  )
}