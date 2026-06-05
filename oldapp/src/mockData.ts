import { SandboxSite } from "./types";

export const sandboxSites: SandboxSite[] = [
  {
    id: "saas-pulse",
    name: "SaaS Pulse Analytics",
    url: "https://saaspulse.com",
    sector: "Enterprise Software (B2B)",
    audience: "Product Managers, Growth Marketers, Data Analysts",
    metrics: {
      clicks: 14250,
      impressions: 385000,
      ctr: 3.70,
      position: 8.4,
      clicksChange: 12.8,
      impressionsChange: 8.4,
      ctrChange: 4.1,
      positionChange: -0.6 // negative is good (moved closer to 1st position)
    },
    queries: [
      { query: "saas metrics dashboard", clicks: 1250, impressions: 8400, ctr: 14.88, position: 1.4, previousClicks: 1100, previousImpressions: 8000, intent: "Transactional", opportunityScore: 20 },
      { query: "user onboarding flow templates", clicks: 840, impressions: 12500, ctr: 6.72, position: 4.2, previousClicks: 620, previousImpressions: 11000, intent: "Informational", opportunityScore: 65 },
      { query: "b2b churn rate calculator", clicks: 610, impressions: 18200, ctr: 3.35, position: 12.6, previousClicks: 520, previousImpressions: 17500, intent: "Commercial", opportunityScore: 82 },
      { query: "how to design user dashboards", clicks: 450, impressions: 32000, ctr: 1.41, position: 15.2, previousClicks: 430, previousImpressions: 29000, intent: "Informational", opportunityScore: 92 },
      { query: "open source product analytics", clicks: 420, impressions: 5600, ctr: 7.50, position: 2.8, previousClicks: 300, previousImpressions: 4800, intent: "Transactional", opportunityScore: 40 },
      { query: "funnel conversion optimizer", clicks: 280, impressions: 14500, ctr: 1.93, position: 11.4, previousClicks: 180, previousImpressions: 13000, intent: "Commercial", opportunityScore: 78 },
      { query: "product growth engine tools", clicks: 150, impressions: 9200, ctr: 1.63, position: 16.1, previousClicks: 140, previousImpressions: 8900, intent: "Commercial", opportunityScore: 85 },
      { query: "saaspulse pricing vs mixpanel", clicks: 110, impressions: 850, ctr: 12.94, position: 1.1, previousClicks: 90, previousImpressions: 720, intent: "Navigational", opportunityScore: 10 }
    ],
    pages: [
      { url: "https://saaspulse.com/", clicks: 5200, impressions: 120000, ctr: 4.33, position: 3.1, primaryKeyword: "saas analytics software" },
      { url: "https://saaspulse.com/onboarding-templates", clicks: 2800, impressions: 72000, ctr: 3.89, position: 5.6, primaryKeyword: "onboarding templates" },
      { url: "https://saaspulse.com/tools/churn-calculator", clicks: 2200, impressions: 95000, ctr: 2.32, position: 8.9, primaryKeyword: "churn rate calculator" },
      { url: "https://saaspulse.com/blog/dashboard-ux", clicks: 1800, impressions: 58000, ctr: 3.10, position: 11.2, primaryKeyword: "dashboard ux design" },
      { url: "https://saaspulse.com/pricing", clicks: 1250, impressions: 18000, ctr: 6.94, position: 2.3, primaryKeyword: "saaspulse pricing" },
      { url: "https://saaspulse.com/integrations", clicks: 1000, impressions: 22000, ctr: 4.55, position: 4.4, primaryKeyword: "analytics api integrations" }
    ],
    countries: [
      { code: "US", name: "United States", clicks: 6420, impressions: 152000, ctr: 4.22, position: 6.8 },
      { code: "GB", name: "United Kingdom", clicks: 1890, impressions: 45000, ctr: 4.20, position: 7.2 },
      { code: "DE", name: "Germany", clicks: 1250, impressions: 38000, ctr: 3.29, position: 8.1 },
      { code: "CA", name: "Canada", clicks: 1120, impressions: 29000, ctr: 3.86, position: 7.5 },
      { code: "IN", name: "India", clicks: 950, impressions: 52000, ctr: 1.83, position: 11.2 },
      { code: "AU", name: "Australia", clicks: 820, impressions: 24000, ctr: 3.42, position: 7.9 }
    ],
    devices: [
      { device: "Desktop", clicks: 11850, impressions: 294000, ctr: 4.03, position: 7.9 },
      { device: "Mobile", clicks: 2180, impressions: 83000, ctr: 2.63, position: 9.8 },
      { device: "Tablet", clicks: 220, impressions: 8000, ctr: 2.75, position: 10.3 }
    ],
    trends: [
      { date: "M 01", clicks: 420, impressions: 12000, ctr: 3.5, position: 8.9 },
      { date: "M 02", clicks: 450, impressions: 12500, ctr: 3.6, position: 8.8 },
      { date: "M 03", clicks: 430, impressions: 13000, ctr: 3.3, position: 8.9 },
      { date: "M 04", clicks: 480, impressions: 12800, ctr: 3.75, position: 8.7 },
      { date: "M 05", clicks: 490, impressions: 13100, ctr: 3.74, position: 8.6 },
      { date: "M 06", clicks: 510, impressions: 13500, ctr: 3.78, position: 8.5 },
      { date: "M 07", clicks: 508, impressions: 13720, ctr: 3.70, position: 8.4 }
    ]
  },
  {
    id: "glowstore-shoes",
    name: "GlowStore Apparel",
    url: "https://glowstore-apparel.com",
    sector: "Retail E-Commerce (B2C)",
    audience: "Athletes, Runners, Fashion-forward Shoppers",
    metrics: {
      clicks: 48250,
      impressions: 2450000,
      ctr: 1.97,
      position: 14.2,
      clicksChange: 24.1,
      impressionsChange: 18.2,
      ctrChange: 5.1,
      positionChange: -1.3
    },
    queries: [
      { query: "buy minimalist running shoes", clicks: 4200, impressions: 156000, ctr: 2.69, position: 3.8, previousClicks: 3100, previousImpressions: 140000, intent: "Transactional", opportunityScore: 50 },
      { query: "glowing sneakers workout", clicks: 3500, impressions: 88000, ctr: 3.98, position: 2.1, previousClicks: 2800, previousImpressions: 80000, intent: "Transactional", opportunityScore: 15 },
      { query: "best shoes for trail runner safety", clicks: 2100, impressions: 145000, ctr: 1.45, position: 8.2, previousClicks: 1500, previousImpressions: 125000, intent: "Informational", opportunityScore: 75 },
      { query: "slip resistant gym trainers review", clicks: 1800, impressions: 220000, ctr: 0.82, position: 15.6, previousClicks: 1600, previousImpressions: 210000, intent: "Commercial", opportunityScore: 94 },
      { query: "retro platform athletic shoes", clicks: 1250, impressions: 94000, ctr: 1.33, position: 12.1, previousClicks: 950, previousImpressions: 87000, intent: "Commercial", opportunityScore: 80 },
      { query: "eco friendly waterproof boots", clicks: 980, impressions: 115000, ctr: 0.85, position: 19.3, previousClicks: 700, previousImpressions: 108000, intent: "Transactional", opportunityScore: 88 },
      { query: "neon sports socks glow", clicks: 650, impressions: 41000, ctr: 1.59, position: 9.4, previousClicks: 520, previousImpressions: 38000, intent: "Transactional", opportunityScore: 68 }
    ],
    pages: [
      { url: "https://glowstore-apparel.com/", clicks: 18500, impressions: 910000, ctr: 2.03, position: 5.2, primaryKeyword: "neon sports apparel" },
      { url: "https://glowstore-apparel.com/shoes/runners", clicks: 12400, impressions: 580000, ctr: 2.14, position: 7.1, primaryKeyword: "minimalist running shoes" },
      { url: "https://glowstore-apparel.com/shoes/platform", clicks: 8200, impressions: 450000, ctr: 1.82, position: 9.9, primaryKeyword: "retro platform sneakers" },
      { url: "https://glowstore-apparel.com/collection/neon", clicks: 5100, impressions: 290000, ctr: 1.76, position: 11.4, primaryKeyword: "glow in the dark sneakers" },
      { url: "https://glowstore-apparel.com/shoes/waterproof", clicks: 4050, impressions: 220000, ctr: 1.84, position: 14.8, primaryKeyword: "waterproof boots" }
    ],
    countries: [
      { code: "US", name: "United States", clicks: 22400, impressions: 1150000, ctr: 1.95, position: 12.4 },
      { code: "CA", name: "Canada", clicks: 7600, impressions: 380000, ctr: 2.00, position: 13.9 },
      { code: "GB", name: "United Kingdom", clicks: 5400, impressions: 270000, ctr: 2.00, position: 14.2 },
      { code: "AU", name: "Australia", clicks: 4100, impressions: 195000, ctr: 2.10, position: 13.6 },
      { code: "JP", name: "Japan", clicks: 2200, impressions: 120000, ctr: 1.83, position: 15.1 },
      { code: "BR", name: "Brazil", clicks: 1800, impressions: 180000, ctr: 1.00, position: 19.8 }
    ],
    devices: [
      { device: "Mobile", clicks: 36200, impressions: 1850000, ctr: 1.96, position: 13.9 },
      { device: "Desktop", clicks: 10800, impressions: 520000, ctr: 2.08, position: 14.9 },
      { device: "Tablet", clicks: 1250, impressions: 80000, ctr: 1.56, position: 16.4 }
    ],
    trends: [
      { date: "M 01", clicks: 1250, impressions: 72000, ctr: 1.73, position: 15.8 },
      { date: "M 02", clicks: 1350, impressions: 75000, ctr: 1.80, position: 15.4 },
      { date: "M 03", clicks: 1420, impressions: 82000, ctr: 1.73, position: 15.0 },
      { date: "M 04", clicks: 1510, impressions: 84000, ctr: 1.79, position: 14.7 },
      { date: "M 05", clicks: 1640, impressions: 88000, ctr: 1.86, position: 14.5 },
      { date: "M 06", clicks: 1710, impressions: 87500, ctr: 1.95, position: 14.3 },
      { date: "M 07", clicks: 1723, impressions: 87400, ctr: 1.97, position: 14.2 }
    ]
  },
  {
    id: "dev-insights",
    name: "DevInsights Journal",
    url: "https://devinsights.io",
    sector: "Technology Publisher (Blog)",
    audience: "Software Engineers, Web Developers, Tech Leads",
    metrics: {
      clicks: 84300,
      impressions: 4850000,
      ctr: 1.74,
      position: 16.5,
      clicksChange: 52.4,
      impressionsChange: 38.6,
      ctrChange: 10.2,
      positionChange: -2.4
    },
    queries: [
      { query: "react 19 state managers", clicks: 8200, impressions: 240000, ctr: 3.42, position: 4.5, previousClicks: 4900, previousImpressions: 180000, intent: "Informational", opportunityScore: 50 },
      { query: "tailwind v4 nested grids tricks", clicks: 6500, impressions: 380000, ctr: 1.71, position: 9.8, previousClicks: 3200, previousImpressions: 290000, intent: "Informational", opportunityScore: 84 },
      { query: "typescript 5.8 pattern matching release", clicks: 4800, impressions: 145000, ctr: 3.31, position: 3.1, previousClicks: 2100, previousImpressions: 110000, intent: "Informational", opportunityScore: 25 },
      { query: "vite bundle splitting optimized configurations", clicks: 3500, impressions: 450000, ctr: 0.78, position: 12.4, previousClicks: 1500, previousImpressions: 410000, intent: "Informational", opportunityScore: 92 },
      { query: "how to avoid hydration errors in nextjs", clicks: 2100, impressions: 520000, ctr: 0.40, position: 16.8, previousClicks: 1100, previousImpressions: 490000, intent: "Informational", opportunityScore: 97 },
      { query: "serverless framework slow cold starts bypass", clicks: 1850, impressions: 180000, ctr: 1.03, position: 11.2, previousClicks: 900, previousImpressions: 160000, intent: "Commercial", opportunityScore: 78 },
      { query: "express 5 routes guide code", clicks: 1200, impressions: 98000, ctr: 1.22, position: 8.5, previousClicks: 950, previousImpressions: 91000, intent: "Informational", opportunityScore: 60 }
    ],
    pages: [
      { url: "https://devinsights.io/", clicks: 32000, impressions: 1800000, ctr: 1.78, position: 4.8, primaryKeyword: "web development reviews" },
      { url: "https://devinsights.io/react-19-state", clicks: 18500, impressions: 920000, ctr: 2.01, position: 6.2, primaryKeyword: "react 19 state store" },
      { url: "https://devinsights.io/tailwind-v4-grid", clicks: 14200, impressions: 850000, ctr: 1.67, position: 8.9, primaryKeyword: "tailwind v4 grid layout" },
      { url: "https://devinsights.io/typescript-pattern-matching", clicks: 11000, impressions: 680000, ctr: 1.62, position: 5.1, primaryKeyword: "typescript pattern matching" },
      { url: "https://devinsights.io/vite-splitting-builds", clicks: 8600, impressions: 600000, ctr: 1.43, position: 9.6, primaryKeyword: "vite bundle split" }
    ],
    countries: [
      { code: "US", name: "United States", clicks: 38200, impressions: 2100000, ctr: 1.82, position: 14.5 },
      { code: "IN", name: "India", clicks: 14200, impressions: 980000, ctr: 1.45, position: 18.2 },
      { code: "GB", name: "United Kingdom", clicks: 9200, impressions: 480000, ctr: 1.92, position: 15.1 },
      { code: "DE", name: "Germany", clicks: 6800, impressions: 320000, ctr: 2.12, position: 15.6 },
      { code: "CA", name: "Canada", clicks: 5120, impressions: 260000, ctr: 1.97, position: 14.8 },
      { code: "UA", name: "Ukraine", clicks: 3100, impressions: 190000, ctr: 1.63, position: 17.5 }
    ],
    devices: [
      { device: "Desktop", clicks: 58400, impressions: 3250000, ctr: 1.80, position: 15.4 },
      { device: "Mobile", clicks: 24700, impressions: 1520000, ctr: 1.63, position: 18.2 },
      { device: "Tablet", clicks: 1200, impressions: 80000, ctr: 1.50, position: 19.1 }
    ],
    trends: [
      { date: "M 01", clicks: 2200, impressions: 130000, ctr: 1.69, position: 18.9 },
      { date: "M 02", clicks: 2500, impressions: 140000, ctr: 1.78, position: 18.5 },
      { date: "M 03", clicks: 2800, impressions: 155000, ctr: 1.80, position: 17.8 },
      { date: "M 04", clicks: 2900, impressions: 165000, ctr: 1.75, position: 17.2 },
      { date: "M 05", clicks: 3100, impressions: 178000, ctr: 1.74, position: 16.8 },
      { date: "M 06", clicks: 3050, impressions: 175000, ctr: 1.74, position: 16.6 },
      { date: "M 07", clicks: 3010, impressions: 17320,  ctr: 1.74, position: 16.5 }
    ]
  }
];
