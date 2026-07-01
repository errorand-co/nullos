import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "crypto"

/**
 * Fixed-credential auth. Accounts are configured via a JSON env var so the
 * list scales beyond a single user without code changes:
 *
 *   AUTH_ACCOUNTS='[{"username":"alice","password":"..."},{"username":"bob","password":"..."}]'
 *
 * Backward compatible: if AUTH_ACCOUNTS is unset, falls back to the single
 * AUTH_USERNAME / AUTH_PASSWORD pair. Session is an HMAC-signed cookie.
 */

export const SESSION_COOKIE = "nullos_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

type Account = { username: string; password: string }

const getAuthSecret = (): string => {
  // Dedicated signing key if provided; otherwise derive from the credentials
  // so a single env var set is enough.
  const secret = process.env.AUTH_SECRET
  if (secret) return secret
  return `nullos::${JSON.stringify(getAccounts())}`
}

let cachedAccounts: Account[] | null = null
function getAccounts(): Account[] {
  if (cachedAccounts) return cachedAccounts
  const fromJson = (): Account[] => {
    const raw = process.env.AUTH_ACCOUNTS
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) return []
      return parsed.filter(
        (a): a is Account =>
          typeof a === "object" && a !== null &&
          typeof (a as Account).username === "string" && typeof (a as Account).password === "string"
      )
    } catch {
      return []
    }
  }
  const accounts = fromJson()
  // Fall back to the single-credential form for backward compatibility.
  if (accounts.length === 0 && process.env.AUTH_USERNAME && process.env.AUTH_PASSWORD) {
    cachedAccounts = [{ username: process.env.AUTH_USERNAME, password: process.env.AUTH_PASSWORD }]
  } else {
    cachedAccounts = accounts
  }
  return cachedAccounts
}

export function hasAuthCredentials(): boolean {
  return getAccounts().length > 0
}

function sign(payload: string): string {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("hex")
}

/** Build the `username:expiry` token + its signature. */
export function createSessionToken(username: string): string {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  const payload = `${username}:${expires}`
  return `${payload}.${sign(payload)}`
}
export function verifySessionToken(token: string | undefined): { username: string } | null {
  if (!token) return null
  const lastDot = token.lastIndexOf(".")
  if (lastDot === -1) return null
  const payload = token.slice(0, lastDot)
  const signature = token.slice(lastDot + 1)

  // Constant-time signature comparison.
  const expected = sign(payload)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  const colon = payload.lastIndexOf(":")
  if (colon === -1) return null
  const expires = Number(payload.slice(colon + 1))
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return null

  return { username: payload.slice(0, colon) }
}

function constantTimeEqualString(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) {
    // still do a compare to keep timing roughly constant
    timingSafeEqual(ab, ab)
    return false
  }
  return timingSafeEqual(ab, bb)
}

export function checkCredentials(username: string, password: string): boolean {
  const accounts = getAccounts()
  if (accounts.length === 0) return false
  // Compare against each account; constant-time per comparison. The number of
  // accounts leaks via timing, which is acceptable for a small fixed list.
  return accounts.some((account) => {
    return (
      constantTimeEqualString(username, account.username) &&
      constantTimeEqualString(password, account.password)
    )
  })
}

export async function getCurrentUser(): Promise<{ username: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  return verifySessionToken(token)
}

/** Set the signed session cookie via the Next.js cookies() API. */
export async function setSessionCookie(username: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, createSessionToken(username), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

/** Clear the session cookie via the Next.js cookies() API. */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}