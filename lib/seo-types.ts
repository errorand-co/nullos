export interface GscMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  clicksChange: number; // WoW delta percentage (e.g., +15.2 or -4.1)
  impressionsChange: number;
  ctrChange: number;
  positionChange: number;
}

export interface GscQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  previousClicks: number;
  previousImpressions: number;
  intent: "Informational" | "Navigational" | "Commercial" | "Transactional";
  opportunityScore: number; // 0-100 score indicating ranking boost potential
}

export interface GscPage {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  primaryKeyword: string;
}

export interface GscCountry {
  code: string;
  name: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscDevice {
  device: "Desktop" | "Mobile" | "Tablet";
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscTrendPoint {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number; // percentage
  position: number;
}

export interface SandboxSite {
  id: string;
  name: string;
  url: string;
  sector: string;
  audience: string;
  metrics: GscMetrics;
  queries: GscQuery[];
  pages: GscPage[];
  countries: GscCountry[];
  devices: GscDevice[];
  trends: GscTrendPoint[];
}

export interface TrackedKeyword {
  id: string;
  query: string;
  siteId: string;
  currentPosition: number;
  previousPosition: number;
  targetPosition: number;
  volume: number;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "On Track" | "Needs Attention" | "Critical";
  dateAdded: string;
}

