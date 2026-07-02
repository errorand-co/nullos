# GSC Daily Pipeline Setup

This pipeline fetches Google Search Console data daily and stores it in Supabase as time-series data, powering real historical trends in the dashboard.

## Architecture

```
n8n (daily cron) → GSC API → Supabase gsc_daily_data table → Next.js dashboard
```

## Step 1: Create the Supabase table

Run `supabase/gsc-schema.sql` in the Supabase SQL Editor. This creates the `gsc_daily_data` table with RLS policies.

## Step 2: Get Google OAuth credentials

1. Go to https://console.cloud.google.com/
2. Create a project (or use existing)
3. Enable **Google Search Console API**:
   - APIs & Services → Library → search "Search Console API" → Enable
4. Create OAuth credentials:
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: **Web application**
   - Authorized redirect URIs: add `https://developers.google.com/oauthplayground`
   - Note the **Client ID** and **Client Secret**
5. Get a **Refresh Token**:
   - Go to https://developers.google.com/oauthplayground
   - Click the gear icon (top right) → check "Use your own OAuth credentials"
   - Enter your Client ID and Client Secret
   - In the left panel, scroll to "Search Console API v1" and authorize all scopes
   - Click "Authorize APIs" → sign in with the Google account that has GSC access
   - Click "Exchange authorization code for tokens"
   - Copy the **Refresh Token** (it starts with `1//`)

## Step 3: Find your Supabase user ID

1. Go to Supabase → Authentication → Users
2. Click on your user
3. Copy the **UID** (a UUID like `a1b2c3d4-...`)

## Step 4: Set up the n8n workflow

### Option A: Use the pipeline script (recommended)

In n8n, create a workflow with:
1. **Schedule Trigger** — runs daily (e.g., 6:00 AM)
2. **Execute Command node** — runs the pipeline script:

```
node /path/to/n8n/gsc-daily-pipeline.mjs
```

Set these environment variables in the Execute Command node (or n8n's global credentials):

```
SUPABASE_URL=https://uogfcvyvtlmbswjqgbah.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-key>
GSC_USER_IDS=<comma-separated-supabase-user-uids>
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
GOOGLE_REFRESH_TOKEN=<your-google-refresh-token>
```

### Option B: Build the workflow in n8n UI

Import `n8n/gsc-daily-pipeline.json` as a starting point, then add HTTP Request nodes for each dimension (queries, pages, countries, devices) and Supabase insert nodes.

## Step 5: Add GSC properties

Edit `n8n/gsc-daily-pipeline.mjs` and update the `SITE_URLS` array:

```js
const SITE_URLS = [
  "https://highsostore.com",
  "https://uptowntrading.co.th",
]
```

## Step 6: Test the pipeline

Run the script manually first:

```bash
SUPABASE_URL=... \
SUPABASE_SERVICE_KEY=... \
GSC_USER_IDS=... \
GOOGLE_CLIENT_ID=... \
GOOGLE_CLIENT_SECRET=... \
GOOGLE_REFRESH_TOKEN=... \
node n8n/gsc-daily-pipeline.mjs
```

You should see output like:
```
Fetching https://highsostore.com for 2026-06-30 → 2026-07-02
  totals: 1 rows stored
  query: 150 rows stored
  page: 80 rows stored
  country: 12 rows stored
  device: 3 rows stored

✅ Pipeline complete
```

Then refresh your dashboard — it should show real GSC data instead of demo data.

## Step 7: Schedule in n8n

Set the Schedule Trigger to run daily. GSC data has a ~2-day delay, so the script fetches data from 3 days ago to yesterday by default.

## Troubleshooting

- **"permission denied for table gsc_daily_data"** — run `GRANT ALL ON public.gsc_daily_data TO authenticated, anon;` in Supabase SQL Editor
- **"Invalid grant"** — make sure you ran `supabase/gsc-schema.sql` first
- **Google API errors** — verify the Search Console API is enabled and your OAuth credentials are correct
- **Empty dashboard** — check that the pipeline ran successfully and data exists in `gsc_daily_data`