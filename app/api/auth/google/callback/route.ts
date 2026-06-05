import { google } from "googleapis"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")

  if (error) {
    return htmlResponse("Google OAuth Cancelled", `<p>Google returned: <code>${escapeHtml(error)}</code></p>`)
  }

  if (!code) {
    return htmlResponse("Missing OAuth Code", "<p>No authorization code was returned by Google.</p>")
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return htmlResponse(
      "Missing Server Credentials",
      "<p>Set <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code>, then restart the app.</p>"
    )
  }

  const redirectUri = `${url.origin}/api/auth/google/callback`
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  )
  const { tokens } = await oauth2Client.getToken(code)
  const refreshToken = tokens.refresh_token

  if (!refreshToken) {
    return htmlResponse(
      "No Refresh Token Returned",
      `<p>Google did not return a refresh token. Remove this app from your Google account permissions, then try again.</p>
       <p>The OAuth route uses <code>prompt=consent</code> and <code>access_type=offline</code>, but Google may skip refresh tokens for repeat grants.</p>`
    )
  }

  return htmlResponse(
    "Google Search Console Connected",
    `<p>Add this value to <code>.env.local</code>, then restart the app:</p>
     <pre>GOOGLE_REFRESH_TOKEN=${escapeHtml(refreshToken)}</pre>
     <p>After restart, open <strong>Manage Websites</strong> and click <strong>Load GSC Sites</strong>.</p>
     <p><a href="/">Return to dashboard</a></p>`
  )
}

function htmlResponse(title: string, body: string) {
  return new NextResponse(
    `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; margin: 0; background: #0a0a0a; color: #fafafa; }
          main { max-width: 760px; margin: 0 auto; padding: 48px 20px; }
          code, pre { background: #18181b; border: 1px solid #27272a; border-radius: 6px; }
          code { padding: 2px 5px; }
          pre { padding: 16px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
          a { color: #84cc16; }
          p { color: #d4d4d8; line-height: 1.7; }
        </style>
      </head>
      <body>
        <main>
          <h1>${escapeHtml(title)}</h1>
          ${body}
        </main>
      </body>
    </html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    }
  )
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
