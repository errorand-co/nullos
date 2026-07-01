# SEO Insight

An SEO analytics dashboard built with Next.js 16, Supabase, and shadcn/ui.

## Features

- **GSC command center** — visualize Google Search Console data per property: queries, pages, countries, devices, trend charts
- **Keyword tracking** — CRUD a keyword watchlist per site with target position, volume, difficulty
- **AI insights** — SEO audit, keyword strategy, and content briefs via Gemini (with offline fallbacks)
- **Search Console import** — import real GSC data via Google OAuth
- **Per-user data isolation** — Supabase RLS ensures each user only sees their own websites and keywords

## Architecture

- **Auth**: Supabase Auth via `@supabase/ssr` (cookie-based sessions). A `proxy.ts` gate (Next.js 16's replacement for `middleware.ts`) refreshes sessions and redirects unauthenticated users.
- **Data fetching**: Server Components fetch data server-side and pass as props. Client components handle mutations and on-demand actions only.
- **Database**: Supabase with per-user RLS policies (`auth.uid() = user_id`). No service-role key needed — all queries go through the user's session JWT.
- **Demo mode**: When Supabase isn't configured, the dashboard shows sandbox data with a labeled banner. No crashes on misconfiguration.

## Setup

### 1. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optional:
- `GEMINI_API_KEY` — enables real AI insights (falls back to offline templates)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` — enables GSC import

### 2. Database schema

Run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL editor. This creates the `websites` and `tracked_keywords` tables with per-user RLS policies.

### 3. Supabase Auth configuration

In the Supabase dashboard, add these redirect URLs under Auth → URL Configuration:

```
http://localhost:3000/auth/callback
https://your-vercel-domain/auth/callback
```

Create user accounts manually in Supabase Auth (no public registration).

### 4. Install and run

```bash
pnpm install
pnpm dev
```

## Project structure

```
proxy.ts                    Auth gate (session refresh + redirect)
lib/supabase/               Supabase clients (server, proxy, browser)
lib/auth.ts                 getCurrentUser() / requireUser() helpers
lib/website-store.ts        Website CRUD with RLS
lib/keyword-store.ts        Keyword CRUD with RLS
lib/search-console.ts       GSC API integration
lib/seo-ai.ts              Gemini insights + offline fallbacks
app/dashboard/[siteId]/    Dashboard routes (RSC — server-side data fetching)
app/api/                    API routes (client mutations + on-demand AI)
components/                 Decomposed UI (one component per tab)
```

## Scripts

- `pnpm dev` — development server
- `pnpm build` — production build (Turbopack)
- `pnpm start` — production server
- `pnpm typecheck` — TypeScript check
- `pnpm lint` — ESLint