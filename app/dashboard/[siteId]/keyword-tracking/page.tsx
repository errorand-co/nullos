import { notFound } from "next/navigation"

import { KeywordTracker } from "@/components/keyword-tracker"
import { getCurrentUser } from "@/lib/auth"
import { listTrackedKeywords } from "@/lib/keyword-store"
import { listGscSites } from "@/lib/gsc-store"

export default async function KeywordTrackingPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const user = await getCurrentUser()
  if (!user) notFound()

  const { sites } = await listGscSites(user)
  const site = sites.find((s) => s.id === siteId)

  if (!site) notFound()

  const { keywords, configured, demo } = await listTrackedKeywords(user, siteId)

  return (
    <KeywordTracker
      siteId={siteId}
      initialKeywords={keywords}
      configured={configured}
      demo={demo}
    />
  )
}