import { notFound } from "next/navigation"

import { PagesView } from "@/components/pages-view"
import { getCurrentUser } from "@/lib/auth"
import { listWebsites } from "@/lib/website-store"

export default async function PagesPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const user = await getCurrentUser()
  if (!user) notFound()

  const { sites } = await listWebsites(user)
  const site = sites.find((s) => s.id === siteId)

  if (!site) notFound()

  return <PagesView pages={site.pages} />
}