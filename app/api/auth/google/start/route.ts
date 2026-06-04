import { google } from "googleapis"
import { NextResponse } from "next/server"

const scopes = ["https://www.googleapis.com/auth/webmasters.readonly"]

export function GET(request: Request) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      {
        error: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set before starting OAuth.",
      },
      { status: 400 }
    )
  }

  const url = new URL(request.url)
  const redirectUri = `${url.origin}/api/auth/google/callback`
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  )
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    include_granted_scopes: true,
    prompt: "consent",
    scope: scopes,
  })

  return NextResponse.redirect(authUrl)
}
