import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini SDK with telemetry header per guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Route: SEO Audit
  app.post("/api/seo/audit", async (req, res) => {
    try {
      const { siteName, metrics, topKeywords, topPages } = req.body;
      
      const prompt = `Analyze this Google Search Console SEO snapshot for "${siteName}":
Metrics (last 28 days):
- Total Clicks: ${metrics.clicks.toLocaleString()}
- Total Impressions: ${metrics.impressions.toLocaleString()}
- Average CTR: ${metrics.ctr.toFixed(2)}%
- Average Position: ${metrics.position.toFixed(1)}

Top Search Queries / Keywords:
${JSON.stringify(topKeywords, null, 2)}

Top Landing Pages:
${JSON.stringify(topPages, null, 2)}

Provide an expert, professional, and deeply actionable SEO Audit of this site. Your response should contain the following clearly defined, formatted markdown sections:
1. **Executive Summary**: A concise assessment of current search visibility and trajectory.
2. **Key Opportunities**: Top 3 higher-value wins (e.g., target keywords in position 8-15, CTR underperformance).
3. **On-Page & Technical Audit**: Specific, developer-focused recommendations to improve Core Web Vitals, metadata, search rendering, and schema.
4. **Content Strategy Plan**: Actionable content refreshes and fresh topic clustering ideas to dominate search intent.
5. **SEO SWOT Analysis**: A 2x2 SWOT analysis for their GSC search presence.

Keep the tone highly professional, precise, data-driven, and actionable. Don't use generic advice; tailor it specifically based on the provided metrics and keywords.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a world-class Elite SEO Consultant and growth marketing strategist with 15+ years of experience auditing enterprise websites through Google Search Console data.",
          temperature: 0.7,
        },
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Gemini SEO Audit Failed:", error);
      res.status(500).json({ error: error.message || "SEO Audit generation failed" });
    }
  });

  // API Route: Keyword Strategy Optimizer
  app.post("/api/seo/keyword-strategy", async (req, res) => {
    try {
      const { keywords } = req.body;

      const prompt = `Optimize the following SEO keywords which are currently on the verge of driving high volume traffic (holding positions 8 to 20 or suffering from poor CTRs):
      
${JSON.stringify(keywords, null, 2)}

For each keyword, please generate a highly contextual search optimizer blueprint:
1. **Target Keyword & Search Intent**: Identify user intent (Informational, Navigational, Conversational, Transactional).
2. **SEO Meta Title (Optimized)**: High CTR, engaging, and under 60 characters. Incorporate secondary terms or click triggers (e.g., Guide, Fast, Top, [Year]).
3. **Meta Description**: Highly engaging, clear CTA, and under 155 characters.
4. **Critical On-Page LSI Terms**: 4 auxiliary keywords/semantic terms to include in the content body to improve semantic relevancy.
5. **Quick content modification tip** to boost ranking from Page 2 to Page 1.

Deliver the results as a polished, structured markdown list.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a master on-page optimizer and technical copywriter specializing in GSC CTR optimizations and landing page alignments.",
          temperature: 0.65,
        },
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Gemini Keyword Strategy Failed:", error);
      res.status(500).json({ error: error.message || "Keyword optimization failed" });
    }
  });

  // API Route: Content Brief Generator
  app.post("/api/seo/content-brief", async (req, res) => {
    try {
      const { keyword, currentPosition, currentCTR } = req.body;

      const prompt = `Generate a comprehensive SEO Content Brief and Draft Blueprint for targeting the keyword: "${keyword}".
Current performance: 
- Google Search Console Position: ${currentPosition}
- GSC Click-Through Rate: ${currentCTR}%

Please generate:
1. **Recommended Article Title (H1)** (including CTR power words)
2. **Brief Objectives & Key Target Audiences**
3. **Detailed Semantic Header Outline (H2, H3 structures)**
4. **Primary Content Blocks & Answer Target (featured snippet optimization)**: Specify the exact query block to address early in the page in a concise definition format.
5. **Competitor Gap Wins**: What unique value can this page offer that other articles in positions 1-3 missed?

Provide a detailed markdown response.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert Content Architect and Semantic SEO strategist mapping out search intent structures to claim Google Featured Snippets.",
          temperature: 0.7,
        },
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Gemini Content Brief Failed:", error);
      res.status(500).json({ error: error.message || "Content brief generation failed" });
    }
  });

  // API Route: Check env state
  app.get("/api/seo/status", (req, res) => {
    res.json({ 
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
