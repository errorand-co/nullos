"use client"

import { useState } from "react"
import { ArrowRight, LogIn, Lock, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"

export function AuthForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Sign in failed." }))
        setMessage(data.error || "Sign in failed.")
        setLoading(false)
        return
      }

      window.location.href = "/"
    } catch {
      setMessage("Network error. Please try again.")
      setLoading(false)
    }
  }

  return (
    <main className="dark flex min-h-svh items-center justify-center bg-background p-4 text-foreground">
      <section className="grid w-full max-w-sm gap-5 rounded-md border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold">SEO Insight</h1>
            <p className="text-xs text-muted-foreground">Sign in to your command center</p>
          </div>
        </div>

        <form onSubmit={submitAuth} className="grid gap-3">
          <label className="grid gap-1 text-xs font-medium">
            Username
            <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3">
              <Lock className="size-4 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoComplete="username"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none"
              />
            </div>
          </label>

          <label className="grid gap-1 text-xs font-medium">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={4}
              autoComplete="current-password"
              className="h-9 rounded-md border bg-background px-3 text-xs outline-none"
            />
          </label>

          {message && <div className="rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">{message}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn />
            {loading ? "Please wait" : "Sign In"}
            <ArrowRight />
          </Button>
        </form>
      </section>
    </main>
  )
}