import { notFound } from "next/navigation"

import { InsightsPanel } from "@/components/insights-panel"
import { getCurrentUser } from "@/lib/auth"
import { listGscSites } from "@/lib/gsc-store"

export default async function InsightsPage({
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

  return (
    <InsightsPanel
      siteName={site.name}
      metrics={site.metrics}
      topKeywords={site.queries.slice(0, 10)}
      topPages={site.pages.slice(0, 5)}
    />
  )
}