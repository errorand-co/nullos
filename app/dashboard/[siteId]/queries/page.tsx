import { notFound } from "next/navigation"

import { QueriesView } from "@/components/queries-view"
import { getCurrentUser } from "@/lib/auth"
import { listGscSites } from "@/lib/gsc-store"

export default async function QueriesPage({
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

  return <QueriesView queries={site.queries} />
}