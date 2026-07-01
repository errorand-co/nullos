import { NextResponse } from "next/server"

import { requireUser } from "@/lib/auth"
import { deleteWebsite } from "@/lib/website-store"

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser()
  if (auth.error) return auth.error

  const { id } = await context.params

  try {
    await deleteWebsite(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}