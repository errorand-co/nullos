"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-4 text-foreground">
      <section className="grid w-full max-w-sm gap-4 rounded-md border bg-card p-6">
        <h1 className="text-base font-semibold">This page couldn’t load</h1>
        <p className="text-xs text-muted-foreground">
          {error.message || "An unexpected error occurred while rendering this page."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="h-9 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground"
        >
          Try again
        </button>
      </section>
    </main>
  )
}