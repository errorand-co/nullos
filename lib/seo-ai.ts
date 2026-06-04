import type { GscMetrics, GscQuery } from "@/lib/seo-types"

export function getOfflineAudit(site: string, metrics: GscMetrics) {
  return `### SEO audit for ${site}

**Executive summary**
The property is generating ${metrics.clicks.toLocaleString()} clicks from ${metrics.impressions.toLocaleString()} impressions with a ${metrics.ctr.toFixed(2)}% CTR and an average position of ${metrics.position.toFixed(1)}. The strongest immediate upside is improving page-two keywords and rewriting metadata for high-impression pages.

**Key opportunities**
- Move keywords in positions 8-15 into page-one territory with tighter intent matching.
- Improve CTR on high-impression queries by using clearer title hooks and fresher dates.
- Refresh pages with strong impressions but weak engagement before creating net-new content.

**Technical recommendations**
- Audit title and meta duplication across the top landing pages.
- Add schema for product, article, FAQ, or software entities where relevant.
- Review Core Web Vitals for pages with commercial or transactional intent.

**Content strategy**
Build clusters around the top search intents, then add concise answer blocks near the top of each target page to compete for featured snippets.`
}

export function getOfflineStrategy(queries: GscQuery[]) {
  const targets = queries.filter((query) => query.position >= 5 && query.position <= 20).slice(0, 4)

  if (!targets.length) {
    return "No strong page-one pivot targets were found for this property."
  }

  return targets
    .map(
      (query) => `### ${query.query}

**Intent:** ${query.intent}
**Current position:** ${query.position.toFixed(1)}
**Meta title:** ${toTitleCase(query.query)} Guide: Fast Wins and Examples
**Meta description:** Improve ${query.query} with practical workflows, examples, and ranking-focused checklists.
**LSI terms:** ${query.query} examples, ${query.query} checklist, best ${query.query}, ${query.query} templates
**Modification tip:** Add an FAQ block and a concise definition paragraph above the fold.`
    )
    .join("\n\n")
}

export function getOfflineBrief(keyword: string, position: number, ctr: number) {
  return `### Content brief: ${keyword || "Target keyword"}

**Current signal:** Position ${position.toFixed(1)}, CTR ${ctr.toFixed(2)}%

**Recommended H1**
The Practical ${toTitleCase(keyword || "Target Keyword")} Guide

**Audience**
Searchers who need a direct explanation, a comparison of options, and a practical implementation path.

**Outline**
- What is ${keyword}?
- When ${keyword} matters most
- Step-by-step implementation workflow
- Common mistakes and how to avoid them
- Examples, templates, and FAQs

**Featured snippet target**
Add a 45-60 word answer block immediately after the introduction that defines the term and states the recommended first action.

**Competitor gap**
Include concrete examples, decision tables, and a downloadable checklist rather than another generic overview.`
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase())
}
