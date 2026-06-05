"use client"

import { useMemo, useState } from "react"
import { ArrowRight, LogIn, Mail, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase-client"

export function AuthForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    window.location.href = "/"
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
            Email
            <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3">
              <Mail className="size-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
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
              minLength={6}
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
