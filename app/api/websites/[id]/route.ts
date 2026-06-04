import { NextResponse } from "next/server"

import { deleteWebsite } from "@/lib/website-store"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message)
  }
  return "Unknown error."
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    await deleteWebsite(id)
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error),
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
