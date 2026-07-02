import { notFound } from "next/navigation"

import { OverviewView } from "@/components/overview-view"
import { listGscSites } from "@/lib/gsc-store"
import { getCurrentUser } from "@/lib/auth"

export default async function SiteOverviewPage({
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
    <OverviewView
      metrics={site.metrics}
      trends={site.trends}
      queries={site.queries}
      pages={site.pages}
      countries={site.countries}
      devices={site.devices}
    />
  )
}