import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"

export default async function Home() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Redirect to the first dashboard route.
  // After the dashboard pages exist, this goes to /dashboard.
  redirect("/dashboard")
}