import { NextResponse } from "next/server"

import { requireAuthenticatedUser } from "@/lib/auth-guard"
import { deleteTrackedKeyword } from "@/lib/tracked-keyword-store"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuthenticatedUser()
  if (auth.error) return auth.error

  const { id } = await context.params

  try {
    await deleteTrackedKeyword(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message)
  }
  return "Unknown error."
}
