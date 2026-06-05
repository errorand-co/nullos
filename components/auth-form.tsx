"use client"

import { useMemo, useState } from "react"
import { ArrowRight, LogIn, Mail, UserPlus, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase-client"

type AuthMode = "signin" | "signup"

export function AuthForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [mode, setMode] = useState<AuthMode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage("")

    const redirectTo = `${window.location.origin}/auth/callback`
    const authRequest =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: redirectTo,
            },
          })

    const { error, data } = await authRequest

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    if (mode === "signup" && !data.session) {
      setMessage("Check your email to confirm your account.")
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

        <div className="grid grid-cols-2 gap-1 rounded-md border bg-background p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin")
              setMessage("")
            }}
            className={`h-8 rounded-sm text-xs font-medium transition ${
              mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup")
              setMessage("")
            }}
            className={`h-8 rounded-sm text-xs font-medium transition ${
              mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign Up
          </button>
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
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="h-9 rounded-md border bg-background px-3 text-xs outline-none"
            />
          </label>

          {message && <div className="rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">{message}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {mode === "signin" ? <LogIn /> : <UserPlus />}
            {loading ? "Please wait" : mode === "signin" ? "Sign In" : "Create Account"}
            <ArrowRight />
          </Button>
        </form>
      </section>
    </main>
  )
}
