import { notFound } from "next/navigation"

import { CountriesDevicesView } from "@/components/countries-devices-view"
import { getCurrentUser } from "@/lib/auth"
import { listWebsites } from "@/lib/website-store"

export default async function CountriesPage({
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

  return <CountriesDevicesView countries={site.countries} devices={site.devices} />
}