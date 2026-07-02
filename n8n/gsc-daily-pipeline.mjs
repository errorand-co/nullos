/**
 * GSC Daily Pipeline Script
 *
 * Run this via n8n (Execute Command node) or as a cron job.
 * Fetches GSC data for each property and writes to Supabase with per-day breakdown.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=<service-role-key> \
 *   GSC_USER_IDS=uuid1,uuid2 \
 *   GSC_START_DATE=2025-06-01 \  # optional, defaults to 16 months ago
 *   GOOGLE_CLIENT_ID=xxx \
 *   GOOGLE_CLIENT_SECRET=xxx \
 *   GOOGLE_REFRESH_TOKEN=xxx \
 *   node gsc-daily-pipeline.mjs
 */

import { google } from "googleapis"

const SITE_URLS = [
  "sc-domain:highsostore.com",
  "sc-domain:uptowntrading.co.th",
]

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const USER_IDS = (process.env.GSC_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean)
const START_DATE = process.env.GSC_START_DATE || (() => {
  const d = new Date()
  d.setMonth(d.getMonth() - 16)
  return d.toISOString().slice(0, 10)
})()

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
  const startDate = START_DATE

  console.log(`Date range: ${startDate} → ${endDate}`)

  for (const siteUrl of SITE_URLS) {
    console.log(`\nFetching ${siteUrl}`)

    // Fetch per-day totals with the "date" dimension
    await fetchAndStore(gsc, siteUrl, startDate, endDate, ["date"], "daily_totals")

    // Fetch queries for the full range (aggregated)
    await fetchAndStore(gsc, siteUrl, startDate, endDate, ["query"], "query")

    // Fetch pages
    await fetchAndStore(gsc, siteUrl, startDate, endDate, ["page"], "page")

    // Fetch countries
    await fetchAndStore(gsc, siteUrl, startDate, endDate, ["country"], "country")

    // Fetch devices
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
        rowLimit: 25000,
      },
    })

    const rows = res.data.rows || []
    if (rows.length === 0) {
      console.log(`  ${dimType}: 0 rows`)
      return
    }

    const records = []
    for (const row of rows) {
      // When using "date" dimension, keys[0] is the date string (YYYY-MM-DD)
      // When using other dimensions, keys[0] is the dimension value
      let date = endDate
      let dimKey = ""
      if (dimType === "daily_totals") {
        date = row.keys[0]
        dimKey = ""
      } else {
        dimKey = row.keys[0]
      }

      for (const userId of USER_IDS) {
        records.push({
          user_id: userId,
          site_url: siteUrl,
          date,
          dimension_type: dimType,
          dimension_key: dimKey,
          clicks: Math.round(row.clicks || 0),
          impressions: Math.round(row.impressions || 0),
          ctr: Number((row.ctr || 0).toFixed(4)),
          position: Number((row.position || 0).toFixed(2)),
        })
      }
    }

    // Insert in batches of 1000 to avoid Supabase limits
    for (let i = 0; i < records.length; i += 1000) {
      await upsertBatch(records.slice(i, i + 1000))
    }
    console.log(`  ${dimType}: ${rows.length} GSC rows → ${records.length} DB rows (${USER_IDS.length} users)`)
  } catch (err) {
    console.error(`  ${dimType} error: ${err.message}`)
  }
}

run().catch((err) => {
  console.error("Pipeline failed:", err)
  process.exit(1)
})