/**
 * GSC Daily Pipeline Script
 *
 * Run this via n8n (Execute Command node) or as a cron job.
 * It fetches yesterday's GSC data for each property and writes to Supabase,
 * duplicated for each user ID so both accounts see the data under RLS.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=<service-role-key> \
 *   GSC_USER_IDS=uuid1,uuid2 \
 *   GOOGLE_CLIENT_ID=xxx \
 *   GOOGLE_CLIENT_SECRET=xxx \
 *   GOOGLE_REFRESH_TOKEN=xxx \
 *   node gsc-daily-pipeline.mjs
 */

import { google } from "googleapis"

const SITE_URLS = [
  "https://highsostore.com",
  "https://uptowntrading.co.th",
]

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const USER_IDS = (process.env.GSC_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean)

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN

// --- Validation ---
for (const [name, val] of [
  ["SUPABASE_URL", SUPABASE_URL],
  ["SUPABASE_SERVICE_KEY", SUPABASE_SERVICE_KEY],
  ["GSC_USER_IDS", USER_IDS.length > 0 ? "set" : ""],
  ["GOOGLE_CLIENT_ID", CLIENT_ID],
  ["GOOGLE_CLIENT_SECRET", CLIENT_SECRET],
  ["GOOGLE_REFRESH_TOKEN", REFRESH_TOKEN],
]) {
  if (!val) {
    console.error(`Missing env: ${name}`)
    process.exit(1)
  }
}

// --- GSC Client ---
function getGscClient() {
  const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET)
  auth.setCredentials({ refresh_token: REFRESH_TOKEN })
  return google.searchconsole({ auth, version: "v1" })
}

// --- Date helpers ---
function dateStr(d) {
  return d.toISOString().slice(0, 10)
}
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// --- Supabase writer ---
async function upsertBatch(rows) {
  if (rows.length === 0) return
  const res = await fetch(`${SUPABASE_URL}/rest/v1/gsc_daily_data`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error(`Supabase insert failed: ${res.status} ${text}`)
  }
}

// --- Main pipeline ---
async function run() {
  const gsc = getGscClient()
  const endDate = dateStr(daysAgo(1)) // yesterday
  const startDate = dateStr(daysAgo(3)) // 3-day window for late data

  for (const siteUrl of SITE_URLS) {
    console.log(`\nFetching ${siteUrl} for ${startDate} → ${endDate}`)

    // 1. Totals (no dimensions)
    await fetchAndStore(gsc, siteUrl, startDate, endDate, [], "totals")

    // 2. Queries
    await fetchAndStore(gsc, siteUrl, startDate, endDate, ["query"], "query")

    // 3. Pages
    await fetchAndStore(gsc, siteUrl, startDate, endDate, ["page"], "page")

    // 4. Countries
    await fetchAndStore(gsc, siteUrl, startDate, endDate, ["country"], "country")

    // 5. Devices
    await fetchAndStore(gsc, siteUrl, startDate, endDate, ["device"], "device")
  }

  console.log("\n✅ Pipeline complete")
}

async function fetchAndStore(gsc, siteUrl, startDate, endDate, dimensions, dimType) {
  try {
    const res = await gsc.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions,
        rowLimit: dimensions.length === 0 ? 1 : 1000,
      },
    })

    const rows = res.data.rows || []
    if (rows.length === 0) {
      console.log(`  ${dimType}: 0 rows`)
      return
    }

    // GSC returns one row per date-range aggregate. We store the aggregate
    // under the end date. For daily breakdown, query per-day separately.
    const records = []
    for (const row of rows) {
      const dimKey = row.keys ? row.keys.join("|") : ""
      // Duplicate for each user so RLS lets both accounts see the data.
      for (const userId of USER_IDS) {
        records.push({
          user_id: userId,
          site_url: siteUrl,
          date: endDate,
          dimension_type: dimType,
          dimension_key: dimKey,
          clicks: Math.round(row.clicks || 0),
          impressions: Math.round(row.impressions || 0),
          ctr: Number((row.ctr || 0).toFixed(4)),
          position: Number((row.position || 0).toFixed(2)),
        })
      }
    }

    await upsertBatch(records)
    console.log(`  ${dimType}: ${rows.length} GSC rows → ${records.length} DB rows (${USER_IDS.length} users)`)
  } catch (err) {
    console.error(`  ${dimType} error: ${err.message}`)
  }
}

run().catch((err) => {
  console.error("Pipeline failed:", err)
  process.exit(1)
})