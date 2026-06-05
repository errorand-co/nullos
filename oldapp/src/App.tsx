import React, { useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { 
  Sparkles, 
  Search, 
  Globe, 
  Smartphone, 
  Monitor, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  Menu, 
  X, 
  Check, 
  Copy, 
  HelpCircle, 
  AlertCircle, 
  Info, 
  Filter, 
  ExternalLink, 
  Calendar, 
  User, 
  TrendingUp, 
  Zap,
  CheckSquare,
  Plus,
  Trash2,
  TrendingDown,
  Sun,
  Moon
} from "lucide-react";
import { sandboxSites } from "./mockData";
import { GscQuery, GscPage, GscCountry, GscDevice, SandboxSite, TrackedKeyword } from "./types";

export default function App() {
  // Theme state supporting dark (default) and light mode
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Navigation & Sidebars
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Dashboard Core State
  const [activeSite, setActiveSite] = useState<SandboxSite>(sandboxSites[0]);
  const [activeMetric, setActiveMetric] = useState<"clicks" | "impressions" | "ctr" | "position">("clicks");
  const [dateRange, setDateRange] = useState<"7d" | "28d" | "3m" | "6m">("28d");
  const [subTab, setSubTab] = useState<"queries" | "pages" | "countries" | "devices" | "month-comparison" | "keyword-tracking">("queries");
  
  // Month-to-Month comparison states
  const [monthA, setMonthA] = useState<string>("M 06");
  const [monthB, setMonthB] = useState<string>("M 07");
  
  // Tracked keywords collection across sites
  const [trackedKeywords, setTrackedKeywords] = useState<{ [siteId: string]: TrackedKeyword[] }>({
    "saas-pulse": [
      { id: "sp-1", query: "saas metrics dashboard", siteId: "saas-pulse", currentPosition: 1.4, previousPosition: 2.1, targetPosition: 1, volume: 1500, difficulty: "Easy", status: "On Track", dateAdded: "2026-05-01" },
      { id: "sp-2", query: "b2b churn rate calculator", siteId: "saas-pulse", currentPosition: 12.6, previousPosition: 15.1, targetPosition: 5, volume: 3400, difficulty: "Medium", status: "Needs Attention", dateAdded: "2026-05-15" },
      { id: "sp-3", query: "how to design user dashboards", siteId: "saas-pulse", currentPosition: 15.2, previousPosition: 12.0, targetPosition: 3, volume: 8200, difficulty: "Hard", status: "Critical", dateAdded: "2026-05-20" },
      { id: "sp-4", query: "open source product analytics", siteId: "saas-pulse", currentPosition: 2.8, previousPosition: 2.5, targetPosition: 1, volume: 920, difficulty: "Medium", status: "On Track", dateAdded: "2026-05-25" }
    ],
    "glowstore-shoes": [
      { id: "gs-1", query: "buy minimalist running shoes", siteId: "glowstore-shoes", currentPosition: 3.8, previousPosition: 5.2, targetPosition: 1, volume: 12000, difficulty: "Hard", status: "On Track", dateAdded: "2026-05-01" },
      { id: "gs-2", query: "best shoes for trail runner safety", siteId: "glowstore-shoes", currentPosition: 8.2, previousPosition: 7.9, targetPosition: 3, volume: 2400, difficulty: "Medium", status: "Needs Attention", dateAdded: "2026-05-10" },
      { id: "gs-3", query: "slip resistant gym trainers review", siteId: "glowstore-shoes", currentPosition: 15.6, previousPosition: 18.2, targetPosition: 10, volume: 4400, difficulty: "Medium", status: "On Track", dateAdded: "2026-05-12" }
    ],
    "dev-insights": [
      { id: "di-1", query: "react 19 state managers", siteId: "dev-insights", currentPosition: 4.5, previousPosition: 7.2, targetPosition: 1, volume: 14000, difficulty: "Hard", status: "On Track", dateAdded: "2026-05-05" },
      { id: "di-2", query: "typescript 5.8 pattern matching release", siteId: "dev-insights", currentPosition: 3.1, previousPosition: 3.2, targetPosition: 1, volume: 5600, difficulty: "Easy", status: "On Track", dateAdded: "2026-05-12" },
      { id: "di-3", query: "how to avoid hydration errors in nextjs", siteId: "dev-insights", currentPosition: 16.8, previousPosition: 14.1, targetPosition: 5, volume: 9800, difficulty: "Hard", status: "Critical", dateAdded: "2026-05-18" }
    ]
  });

  // Tracked keyword form states
  const [newKeywordQuery, setNewKeywordQuery] = useState("");
  const [newKeywordTarget, setNewKeywordTarget] = useState<number>(3);
  const [newKeywordVolume, setNewKeywordVolume] = useState<number>(1000);
  const [newKeywordDiff, setNewKeywordDiff] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  
  // Back-end status and AI Results
  const [backendStatus, setBackendStatus] = useState({ hasApiKey: false });
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [strategyResult, setStrategyResult] = useState<string | null>(null);
  const [isStrategyLoading, setIsStrategyLoading] = useState(false);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  
  // Content Brief Generator
  const [briefKeyword, setBriefKeyword] = useState<string>("");
  const [briefPosition, setBriefPosition] = useState<number>(10);
  const [briefCtr, setBriefCtr] = useState<number>(2.1);
  const [briefResult, setBriefResult] = useState<string | null>(null);
  const [isBriefLoading, setIsBriefLoading] = useState(false);

  // Load configuration status on mount
  useEffect(() => {
    fetch("/api/seo/status")
      .then(res => res.json())
      .then(data => setBackendStatus(data))
      .catch(() => console.log("Middleware server is preparing. Standard offline models loaded."));
  }, []);

  // Sync date-range simulated modifications to create realistic micro-fluctuations
  const getSimulatedTrendData = () => {
    let scale = 1.0;
    if (dateRange === "7d") scale = 0.25;
    if (dateRange === "3m") scale = 3.2;
    if (dateRange === "6m") scale = 6.4;

    return activeSite.trends.map(t => ({
      ...t,
      clicks: Math.round(t.clicks * scale),
      impressions: Math.round(t.impressions * scale)
    }));
  };

  const simulatedTrends = getSimulatedTrendData();

  // Reset filters on site selection
  const handleSiteChange = (siteId: string) => {
    const site = sandboxSites.find(s => s.id === siteId);
    if (site) {
      setActiveSite(site);
      setSearchQuery("");
      setIntentFilter("all");
      setPositionFilter("all");
      setAuditResult(null);
      setStrategyResult(null);
      setBriefResult(null);
      setBriefKeyword("");
    }
  };

  // Metric calculation helpers per selected dateRange scale
  const getPivotedMetrics = () => {
    let multiplier = 1.0;
    if (dateRange === "7d") multiplier = 0.25;
    if (dateRange === "3m") multiplier = 3.1;
    if (dateRange === "6m") multiplier = 6.2;

    const base = activeSite.metrics;
    return {
      clicks: Math.round(base.clicks * multiplier),
      impressions: Math.round(base.impressions * multiplier),
      ctr: base.ctr,
      position: base.position,
      clicksChange: base.clicksChange,
      impressionsChange: base.impressionsChange,
      ctrChange: base.ctrChange,
      positionChange: base.positionChange
    };
  };

  const currentMetrics = getPivotedMetrics();

  // Filter lists based on search controls
  const filteredQueries = activeSite.queries.filter(q => {
    const matchSearch = q.query.toLowerCase().includes(searchQuery.toLowerCase());
    const matchIntent = intentFilter === "all" || q.intent === intentFilter;
    let matchPosition = true;
    if (positionFilter === "top3") matchPosition = q.position <= 3;
    else if (positionFilter === "top10") matchPosition = q.position <= 10;
    else if (positionFilter === "page2") matchPosition = q.position > 10 && q.position <= 20;

    return matchSearch && matchIntent && matchPosition;
  });

  const filteredPages = activeSite.pages.filter(p => 
    p.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.primaryKeyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trigger server-side AI Audit
  const triggerSeoAudit = async () => {
    setIsAuditLoading(true);
    setAuditResult(null);
    try {
      const response = await fetch("/api/seo/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: activeSite.name,
          metrics: currentMetrics,
          topKeywords: activeSite.queries.slice(0, 5),
          topPages: activeSite.pages.slice(0, 3)
        })
      });
      
      if (!response.ok) throw new Error("Could not execute server-side SEO Audit.");
      const data = await response.json();
      setAuditResult(data.result);
    } catch (err: any) {
      // Fallback elegant client demo audit in case API key is missing or server preparing
      setTimeout(() => {
        setAuditResult(getOfflineAudit(activeSite.name, currentMetrics));
      }, 1500);
    } finally {
      setIsAuditLoading(false);
    }
  };

  // Trigger keyword strategy generator
  const triggerKeywordStrategy = async () => {
    setIsStrategyLoading(true);
    setStrategyResult(null);
    try {
      // Filter high-opportunity keywords for Page-2 metadata boost
      const list = activeSite.queries.filter(q => q.position >= 5 && q.position <= 20).slice(0, 4);
      const response = await fetch("/api/seo/keyword-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: list })
      });
      if (!response.ok) throw new Error("Metadata SEO model query failed.");
      const data = await response.json();
      setStrategyResult(data.result);
    } catch (err) {
      setTimeout(() => {
        setStrategyResult(getOfflineStrategy(activeSite.queries));
      }, 1500);
    } finally {
      setIsStrategyLoading(false);
    }
  };

  // Trigger Content Brief strategy
  const triggerContentBrief = async (kw: string, pos: number, ctr: number) => {
    setBriefKeyword(kw);
    setBriefPosition(pos);
    setBriefCtr(ctr);
    setIsBriefLoading(true);
    setBriefResult(null);
    try {
      const response = await fetch("/api/seo/content-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: kw, currentPosition: pos, currentCTR: ctr })
      });
      if (!response.ok) throw new Error("Content builder response failed.");
      const data = await response.json();
      setBriefResult(data.result);
    } catch (err) {
      setTimeout(() => {
        setBriefResult(getOfflineBrief(kw, pos, ctr));
      }, 1500);
    } finally {
      setIsBriefLoading(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, kw: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyword(kw);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  // Add a tracked keyword to the current site list
  const handleAddTrackedKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordQuery.trim()) return;

    // Simulate standard baseline attributes
    const starterPosition = parseFloat((1.5 + Math.random() * 20).toFixed(1));
    const previousPosition = parseFloat((starterPosition + (Math.random() * 4 - 2)).toFixed(1));
    const isNewOnTrack = starterPosition <= newKeywordTarget;
    const isNewCritical = starterPosition > newKeywordTarget + 10;
    const computedStatus = isNewOnTrack ? "On Track" : isNewCritical ? "Critical" : "Needs Attention";
    
    const newKw: TrackedKeyword = {
      id: `${activeSite.id}-${Date.now()}`,
      query: newKeywordQuery.trim(),
      siteId: activeSite.id,
      currentPosition: starterPosition,
      previousPosition,
      targetPosition: newKeywordTarget,
      volume: newKeywordVolume,
      difficulty: newKeywordDiff,
      status: computedStatus,
      dateAdded: new Date().toISOString().split("T")[0]
    };

    setTrackedKeywords(prev => ({
      ...prev,
      [activeSite.id]: [newKw, ...(prev[activeSite.id] || [])]
    }));

    // Reset form states
    setNewKeywordQuery("");
    setNewKeywordTarget(3);
    setNewKeywordVolume(1000);
    setNewKeywordDiff("Medium");
  };

  // Delete tracked keyword
  const handleDeleteTrackedKeyword = (id: string) => {
    setTrackedKeywords(prev => ({
      ...prev,
      [activeSite.id]: (prev[activeSite.id] || []).filter(kw => kw.id !== id)
    }));
  };

  // Render metric line chart focus options
  const getChartMetricColor = () => {
    if (activeMetric === "clicks") return "#0ea5e9"; // Cyan
    if (activeMetric === "impressions") return "#a855f7"; // Purple
    if (activeMetric === "ctr") return "#10b981"; // Emerald
    return "#e11d48"; // Rose
  };

  // Pie chart variables
  const deviceColors = ["#3b82f6", "#a855f7", "#10b981"];

  // Month-to-Month trend comparative computations
  const MONTH_NAMES: { [key: string]: string } = {
    "M 01": "January",
    "M 02": "February",
    "M 03": "March",
    "M 04": "April",
    "M 05": "May",
    "M 06": "June",
    "M 07": "July"
  };

  const trendA = activeSite.trends.find(t => t.date === monthA) || activeSite.trends[Math.max(0, activeSite.trends.length - 2)];
  const trendB = activeSite.trends.find(t => t.date === monthB) || activeSite.trends[activeSite.trends.length - 1];

  const clicksDiff = trendB.clicks - trendA.clicks;
  const clicksPct = trendA.clicks !== 0 ? (clicksDiff / trendA.clicks) * 100 : 0;

  const impDiff = trendB.impressions - trendA.impressions;
  const impPct = trendA.impressions !== 0 ? (impDiff / trendA.impressions) * 100 : 0;

  const ctrDiff = trendB.ctr - trendA.ctr;
  const ctrPct = trendA.ctr !== 0 ? (ctrDiff / trendA.ctr) * 100 : 0;

  const posDiff = trendB.position - trendA.position;

  // Query-level month A vs B comparisons 
  const queryComparisons = activeSite.queries.map(q => {
    const clickChange = q.clicks - q.previousClicks;
    const clickChangePct = q.previousClicks > 0 ? (clickChange / q.previousClicks) * 100 : 0;
    
    const charSum = q.query.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const posChange = parseFloat(((charSum % 7) - 3.2).toFixed(1)); 
    const previousPosition = parseFloat((q.position - posChange).toFixed(1));
    
    return {
      query: q.query,
      monthAClicks: q.previousClicks,
      monthBClicks: q.clicks,
      clickChange,
      clickChangePct,
      monthAPosition: previousPosition,
      monthBPosition: q.position,
      posChange,
      intent: q.intent,
      opportunityScore: q.opportunityScore
    };
  });

  const winners = [...queryComparisons].sort((a, b) => b.clickChange - a.clickChange).slice(0, 3);
  const losers = [...queryComparisons].sort((a, b) => a.clickChange - b.clickChange).slice(0, 3);

  // Keyword Tracker metrics calculations
  const activeTracked = trackedKeywords[activeSite.id] || [];
  const avgTrackedPos = activeTracked.length > 0 
    ? (activeTracked.reduce((acc, k) => acc + k.currentPosition, 0) / activeTracked.length).toFixed(1) 
    : "0.0";
  const top3Count = activeTracked.filter(k => k.currentPosition <= 3).length;
  const top10Count = activeTracked.filter(k => k.currentPosition <= 10).length;
  const totalVolume = activeTracked.reduce((acc, k) => acc + k.volume, 0).toLocaleString();

  return (
    <div className="min-h-screen text-[#fafafa] bg-[#09090b] font-sans flex flex-col md:flex-row" id="seo-root">
      
      {/* SIDEBAR NAVIGATION - DESKTOP */}
      <aside className="hidden md:flex flex-col w-60 border-r border-[#27272a] bg-[#09090b] p-5 sticky top-0 h-screen shrink-0 justify-between" id="desktop-sidebar">
        <div>
          {/* Platform Title */}
          <div className="p-1 flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <span className="font-semibold tracking-tight text-white">SEO Insight</span>
          </div>

          {/* Sandbox Site Selector */}
          <div className="mb-8">
            <span className="text-[11px] font-medium text-[#a1a1aa] uppercase tracking-wider block mb-2 px-1">Connected Site</span>
            <div className="relative">
              <select 
                className="w-full bg-[#18181b] border border-[#27272a] rounded py-1.5 px-3 text-xs text-[#fafafa] outline-none hover:border-[#3f3f46] focus:border-blue-500 transition cursor-pointer font-medium"
                value={activeSite.id}
                onChange={(e) => handleSiteChange(e.target.value)}
              >
                {sandboxSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 pl-1 flex items-center gap-1.5 text-[11px] text-[#a1a1aa] font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block"></span>
              <span className="truncate">{activeSite.url}</span>
            </div>
          </div>

          {/* Main Panel Controls */}
          <nav className="space-y-1">
            <div className="text-[11px] font-medium text-[#a1a1aa] uppercase tracking-wider px-2 py-2">Overview</div>
            <button 
              onClick={() => { setSubTab("queries") }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${subTab === "queries" ? "bg-[#27272a] text-white" : "text-[#a1a1aa] hover:bg-[#18181b] hover:text-white"}`}
            >
              <Search className="w-4 h-4 opacity-70" />
              <span>Performance</span>
            </button>
            
            <button 
              onClick={() => { setSubTab("pages") }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${subTab === "pages" ? "bg-[#27272a] text-white" : "text-[#a1a1aa] hover:bg-[#18181b] hover:text-white"}`}
            >
              <FileText className="w-4 h-4 opacity-70" />
              <span>Landing Pages</span>
            </button>

            <button 
              onClick={() => { setSubTab("countries") }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${subTab === "countries" ? "bg-[#27272a] text-white" : "text-[#a1a1aa] hover:bg-[#18181b] hover:text-white"}`}
            >
              <Globe className="w-4 h-4 opacity-70" />
              <span>Geographics</span>
            </button>

            <button 
              onClick={() => { setSubTab("devices") }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${subTab === "devices" ? "bg-[#27272a] text-white" : "text-[#a1a1aa] hover:bg-[#18181b] hover:text-white"}`}
            >
              <Smartphone className="w-4 h-4 opacity-70" />
              <span>Device Traffic</span>
            </button>
          </nav>

          {/* Premium Analytics Tools */}
          <nav className="space-y-1 mt-4">
            <div className="text-[11px] font-medium text-[#a1a1aa] uppercase tracking-wider px-2 py-2">Premium Matrix</div>
            <button 
              onClick={() => { setSubTab("month-comparison") }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${subTab === "month-comparison" ? "bg-[#27272a] text-white" : "text-[#a1a1aa] hover:bg-[#18181b] hover:text-white"}`}
            >
              <RefreshCw className="w-4 h-4 opacity-70" style={{ transform: "rotate(45deg)" }} />
              <span>Month Comparison</span>
            </button>
            <button 
              onClick={() => { setSubTab("keyword-tracking") }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${subTab === "keyword-tracking" ? "bg-[#27272a] text-white" : "text-[#a1a1aa] hover:bg-[#18181b] hover:text-white"}`}
            >
              <TrendingUp className="w-4 h-4 opacity-70" />
              <span>Keyword Tracker</span>
            </button>
          </nav>
        </div>

        {/* User Identity Info / Sandbox Credentials */}
        <div className="p-1 border-t border-[#27272a]">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 shrink-0"></div>
            <div className="text-xs overflow-hidden">
              <p className="font-medium text-white truncate">Alex Rivers</p>
              <p className="text-[#a1a1aa] truncate text-[10px]">boonpipop.bome@gmail</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BAR */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-900 sticky top-0 z-30" id="mobile-header">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-semibold text-sm text-white">SEO Insight</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-[#18181b] border border-[#27272a] rounded-lg py-1 px-2.5 text-xs text-[#fafafa]"
            value={activeSite.id}
            onChange={(e) => handleSiteChange(e.target.value)}
          >
            {sandboxSites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 px-1.5 border border-[#27272a] rounded bg-[#18181b] text-white"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MOBILE OVERLAY NAVIGATION */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-[#09090b]/98 backdrop-blur-md z-20 p-5 space-y-6 flex flex-col justify-between" id="mobile-overlay-menu">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] block">Console Filters</span>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => { setSubTab("queries"); setIsMobileMenuOpen(false); }}
                className={`py-3 px-4 rounded-xl text-xs font-semibold text-center border transition ${subTab === "queries" ? "bg-[#27272a] border-[#a1a1aa] text-white" : "bg-[#18181b] border-[#27272a] text-[#a1a1aa]"}`}
              >
                Performance
              </button>
              <button 
                onClick={() => { setSubTab("pages"); setIsMobileMenuOpen(false); }}
                className={`py-3 px-4 rounded-xl text-xs font-semibold text-center border transition ${subTab === "pages" ? "bg-[#27272a] border-[#a1a1aa] text-white" : "bg-[#18181b] border-[#27272a] text-[#a1a1aa]"}`}
              >
                Landing Pages
              </button>
              <button 
                onClick={() => { setSubTab("countries"); setIsMobileMenuOpen(false); }}
                className={`py-3 px-4 rounded-xl text-xs font-semibold text-center border transition ${subTab === "countries" ? "bg-[#27272a] border-[#a1a1aa] text-white" : "bg-[#18181b] border-[#27272a] text-[#a1a1aa]"}`}
              >
                Geographics
              </button>
              <button 
                onClick={() => { setSubTab("devices"); setIsMobileMenuOpen(false); }}
                className={`py-3 px-4 rounded-xl text-xs font-semibold text-center border transition ${subTab === "devices" ? "bg-[#27272a] border-[#a1a1aa] text-white" : "bg-[#18181b] border-[#27272a] text-[#a1a1aa]"}`}
              >
                Device Traffic
              </button>
              <button 
                onClick={() => { setSubTab("month-comparison"); setIsMobileMenuOpen(false); }}
                className={`py-3 px-4 rounded-xl text-xs font-semibold text-center border transition ${subTab === "month-comparison" ? "bg-[#27272a] border-[#a1a1aa] text-white" : "bg-[#18181b] border-[#27272a] text-[#a1a1aa]"}`}
              >
                Month Compare
              </button>
              <button 
                onClick={() => { setSubTab("keyword-tracking"); setIsMobileMenuOpen(false); }}
                className={`py-3 px-4 rounded-xl text-xs font-semibold text-center border transition ${subTab === "keyword-tracking" ? "bg-[#27272a] border-[#a1a1aa] text-white" : "bg-[#18181b] border-[#27272a] text-[#a1a1aa]"}`}
              >
                Keyword Tracker
              </button>
            </div>

            <div className="p-3 bg-[#18181b] rounded-xl border border-[#27272a] space-y-2">
              <span className="font-mono text-[11px] text-[#a1a1aa] block">Sector Context: {activeSite.sector}</span>
              <span className="font-mono text-[11px] text-[#a1a1aa] block">URL Path: {activeSite.url}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#27272a] pb-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 shrink-0"></div>
              <div>
                <span className="text-xs font-semibold text-white block">Alex Rivers</span>
                <span className="text-[10px] text-[#a1a1aa] font-mono block">boonpipop.bome@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED SEO DASHBOARD MAIN STAGE */}
      <main className="flex-1 flex flex-col bg-[#09090b] h-screen overflow-y-auto" id="dashboard-stage">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-[#27272a] px-4 sm:px-8 flex items-center justify-between bg-[#09090b]" id="sleek-dashboard-header">
          <div className="flex items-center gap-4">
            <div className="text-sm text-[#a1a1aa]">Properties / <span className="text-white font-semibold">{activeSite.name}</span></div>
            <div className="h-4 w-[1px] bg-[#27272a] hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2 bg-[#18181b] border border-[#27272a] rounded px-3 py-1.5 text-xs text-white">
              <span className="capitalize">{dateRange === "7d" ? "Last 7 Days" : dateRange === "28d" ? "Last 28 Days" : dateRange === "3m" ? "Last 3 Months" : "Last 6 Months"}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
              className="p-2 border border-[#27272a] bg-[#18181b] text-[#a1a1aa] hover:text-white rounded-lg transition shrink-0 flex items-center justify-center cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400 animate-pulse" /> : <Moon className="w-4 h-4 text-blue-500" />}
            </button>

            {/* Quick Refresh Tool */}
            <button 
              onClick={() => handleSiteChange(activeSite.id)}
              className="p-2 border border-[#27272a] bg-[#18181b] text-[#a1a1aa] hover:text-white rounded-lg transition shrink-0"
              title="Reset metrics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                const dataToExport = JSON.stringify({ site: activeSite.name, metrics: currentMetrics, queries: activeSite.queries });
                const blob = new Blob([dataToExport], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${activeSite.id}-seo-stats.json`;
                a.click();
              }}
              className="px-4 py-2 bg-[#fafafa] hover:bg-[#eaeaea] text-[#09090b] text-[#09090b] text-xs sm:text-sm font-semibold rounded-md transition duration-150 active:scale-95"
            >
              Export Data
            </button>
          </div>
        </header>

        {/* Dashboard Viewport wrapper matching design paddings */}
        <div className="flex-1 p-4 sm:p-8 space-y-6">
          {/* Quick interactive mobile selector */}
          <div className="sm:hidden flex items-center justify-between p-3 bg-[#18181b] border border-[#27272a] rounded-xl">
            <span className="text-xs text-[#a1a1aa] font-medium font-sans">Active Period</span>
            <select 
              className="bg-[#09090b] border border-[#27272a] rounded py-1 px-2.5 text-xs text-white"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="28d">Last 28 Days</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
            </select>
          </div>

          {/* Date range selection helper for desktops, matching clean arrangement */}
          <div className="hidden sm:flex items-center justify-between p-1 bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Search Console Insights</h2>
              <p className="text-xs text-[#a1a1aa]">Performance monitoring for Google Organic ranking triggers</p>
            </div>
            <div className="bg-[#09090b] p-1 rounded-lg border border-[#27272a] flex items-center gap-1">
              {(["7d", "28d", "3m", "6m"] as const).map((range) => {
                const labels = { "7d": "7 Days", "28d": "28 Days", "3m": "3 Months", "6m": "6 Months" };
                return (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1 text-xs rounded font-medium transition ${dateRange === range ? "bg-[#27272a] text-white border border-[#27272a]" : "text-[#a1a1aa] hover:text-white"}`}
                  >
                    {labels[range]}
                  </button>
                );
              })}
            </div>
          </div>

        {/* METRICS COUNT CARDS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="gsc-metrics-pane">
          
          {/* CLICKS CARD */}
          <div 
            onClick={() => setActiveMetric("clicks")}
            className={`cursor-pointer group p-5 rounded-xl border transition relative ${activeMetric === "clicks" ? "bg-[#18181b] border-blue-500 shadow-lg shadow-blue-500/5" : "bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]"}`}
          >
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Total Clicks</p>
              <span className={`text-[10px] font-bold ${currentMetrics.clicksChange >= 0 ? "text-emerald-500" : "text-[#f43f5e]"}`}>
                {currentMetrics.clicksChange >= 0 ? "+" : ""}{currentMetrics.clicksChange}%
              </span>
            </div>
            <h3 className="text-2xl font-semibold mt-1 text-white tracking-tight">{currentMetrics.clicks.toLocaleString()}</h3>
            <div className="w-full h-1 bg-[#27272a] mt-4 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: "70%" }}></div>
            </div>
            {activeMetric === "clicks" && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>}
          </div>

          {/* IMPRESSIONS CARD */}
          <div 
            onClick={() => setActiveMetric("impressions")}
            className={`cursor-pointer group p-5 rounded-xl border transition relative ${activeMetric === "impressions" ? "bg-[#18181b] border-purple-500 shadow-lg shadow-purple-500/5" : "bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]"}`}
          >
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Impressions</p>
              <span className={`text-[10px] font-bold ${currentMetrics.impressionsChange >= 0 ? "text-emerald-500" : "text-[#f43f5e]"}`}>
                {currentMetrics.impressionsChange >= 0 ? "+" : ""}{currentMetrics.impressionsChange}%
              </span>
            </div>
            <h3 className="text-2xl font-semibold mt-1 text-white tracking-tight">
              {currentMetrics.impressions >= 1000000 
                ? `${(currentMetrics.impressions / 1000000).toFixed(2)}M` 
                : currentMetrics.impressions.toLocaleString()}
            </h3>
            <div className="w-full h-1 bg-[#27272a] mt-4 rounded-full overflow-hidden">
              <div className="h-full bg-[#a855f7] transition-all duration-500" style={{ width: "45%" }}></div>
            </div>
            {activeMetric === "impressions" && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>}
          </div>

          {/* CTR CARD */}
          <div 
            onClick={() => setActiveMetric("ctr")}
            className={`cursor-pointer group p-5 rounded-xl border transition relative ${activeMetric === "ctr" ? "bg-[#18181b] border-emerald-500 shadow-lg shadow-emerald-500/5" : "bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]"}`}
          >
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Avg. CTR</p>
              <span className={`text-[10px] font-bold ${currentMetrics.ctrChange >= 0 ? "text-emerald-500" : "text-[#f43f5e]"}`}>
                {currentMetrics.ctrChange >= 0 ? "+" : ""}{currentMetrics.ctrChange}%
              </span>
            </div>
            <h3 className="text-2xl font-semibold mt-1 text-white tracking-tight">{currentMetrics.ctr.toFixed(2)}%</h3>
            <div className="w-full h-1 bg-[#27272a] mt-4 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: "32%" }}></div>
            </div>
            {activeMetric === "ctr" && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>}
          </div>

          {/* POSITION CARD */}
          <div 
            onClick={() => setActiveMetric("position")}
            className={`cursor-pointer group p-5 rounded-xl border transition relative ${activeMetric === "position" ? "bg-[#18181b] border-rose-500 shadow-lg shadow-rose-500/5" : "bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]"}`}
          >
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Avg. Position</p>
              <span className={`text-[10px] font-bold ${currentMetrics.positionChange <= 0 ? "text-emerald-500" : "text-[#f43f5e]"}`}>
                {currentMetrics.positionChange <= 0 ? "+" : ""}{currentMetrics.positionChange?.toFixed(1)}
              </span>
            </div>
            <h3 className="text-2xl font-semibold mt-1 text-white tracking-tight">{currentMetrics.position.toFixed(1)}</h3>
            <div className="w-full h-1 bg-[#27272a] mt-4 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: "82%" }}></div>
            </div>
            {activeMetric === "position" && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>}
          </div>

        </div>

        {/* GOOGLE SEARCH CONSOLE DYNAMIC DATA CHART AND AI SUITE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-ai">
          
          {/* CHART VIEWER CONTAINER (Takes 2 Columns on desktop) */}
          <div className="lg:col-span-2 bg-slate-900/30 border border-slate-900 rounded-3xl p-4 sm:p-6 flex flex-col justify-between" id="gsc-line-chart-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-[#a1a1aa] block mb-0.5">Console Graph Analytics</span>
                <span className="text-sm font-semibold text-[#fafafa]">
                  Search Query Performance Trend ({activeMetric.toUpperCase()})
                </span>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-[#09090b] border border-[#27272a] rounded">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getChartMetricColor() }}></span>
                <span className="text-[11px] font-mono text-[#a1a1aa] uppercase font-semibold pr-1.5">{activeMetric}</span>
              </div>
            </div>

            {/* Recharts container */}
            <div className="h-64 sm:h-72 w-full" id="gsc-trend-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulatedTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getChartMetricColor()} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={getChartMetricColor()} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#a1a1aa" 
                    fontSize={11}
                    fontFamily="JetBrains Mono"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#a1a1aa"
                    fontSize={11}
                    fontFamily="JetBrains Mono"
                    tickLine={false}
                    axisLine={false}
                    domain={activeMetric === "position" ? [24, 'auto'] : ['auto', 'auto']}
                    reversed={activeMetric === "position"}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#18181b", 
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      color: "#fafafa",
                      fontFamily: "Inter"
                    }}
                    labelStyle={{ fontFamily: "Inter", fontWeight: "bold", fontSize: "12px", color: "#fafafa" }}
                  />
                  <Line 
                     type="monotone" 
                     dataKey={activeMetric} 
                     stroke={getChartMetricColor()} 
                     strokeWidth={3} 
                     dot={{ r: 4, strokeWidth: 1 }}
                     activeDot={{ r: 7, strokeWidth: 0, fill: getChartMetricColor() }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Quick SEO chart annotations */}
            <div className="mt-4 pt-4 border-t border-[#27272a] grid grid-cols-3 gap-2">
              <div className="text-center">
                <span className="text-[10px] text-[#a1a1aa] font-mono block">Median Peak</span>
                <span className="font-semibold text-xs text-white">
                  {activeMetric === "ctr" ? "4.15%" : activeMetric === "position" ? "3.2" : "1,450"}
                </span>
              </div>
              <div className="text-center border-x border-[#27272a]">
                <span className="text-[10px] text-[#a1a1aa] font-mono block">YoY Growth Index</span>
                <span className="font-semibold text-xs text-emerald-500">+18.5%</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-[#a1a1aa] font-mono block">Rank Stability</span>
                <span className="font-semibold text-xs text-blue-400">92 / 100</span>
              </div>
            </div>
          </div>

          {/* AI CONSOLE ASSISTANT PANEL */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 flex flex-col justify-between relative overflow-hidden animate-fade-in" id="ai-assistant-card">
            
            {/* Ambient visual background glow */}
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pulsate-radar pointer-events-none"></div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block uppercase tracking-wider">SEO Gemini Auditor</span>
                  <span className="text-[10px] text-[#a1a1aa]">Active Agent: 3.5-flash-pro</span>
                </div>
              </div>

              <div className="p-4 bg-[#09090b]/80 rounded-lg border border-[#27272a] space-y-3">
                <h3 className="text-[11px] font-semibold text-white uppercase tracking-wider">Site Audit Checklist</h3>
                <ul className="text-xs text-[#a1a1aa] space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Scan search click distributions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Evaluate keyword opportunity deltas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Align Page-2 content intents</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Unlock deep organic performance trends in one click using pre-trained Gemini models directly connected to active console indices.
              </p>
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={triggerSeoAudit}
                disabled={isAuditLoading}
                className="w-full bg-[#fafafa] hover:bg-[#eaeaea] disabled:bg-[#27272a] text-[#09090b] disabled:text-[#a1a1aa] py-2 rounded text-xs font-semibold tracking-tight transition flex items-center justify-center gap-2 cursor-pointer border border-[#27272a]"
              >
                {isAuditLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Consulting Gemini SEO Expert...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Full Site SEO Audit</span>
                  </>
                )}
              </button>
              
              <button
                onClick={triggerKeywordStrategy}
                disabled={isStrategyLoading}
                className="w-full bg-[#18181b] hover:bg-[#27272a] text-white py-2 rounded text-xs font-semibold transition border border-[#27272a] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isStrategyLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Queries...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                    <span>View Page 1 Pivot Strategy</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* AI GEN AI AUDIT RESULTS OUTPUT (Drawn dynamically if present) */}
        {(auditResult || strategyResult || isAuditLoading || isStrategyLoading) && (
          <section className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 space-y-4" id="ai-results-pane">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                <h2 className="text-xs uppercase tracking-wider font-semibold text-white">
                  {auditResult ? "SEO Audit Report" : "Page 1 Metadata Strategy Optimizer"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setAuditResult(null); setStrategyResult(null); }}
                  className="p-1 px-3 border border-[#27272a] rounded bg-[#09090b] text-[#a1a1aa] hover:text-white text-xs font-mono"
                >
                  Clear Report
                </button>
              </div>
            </div>

            {/* Display loader icons if active */}
            {(isAuditLoading || isStrategyLoading) ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="h-10 w-10 border-2 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
                <p className="text-xs font-mono text-[#a1a1aa]">Gemini is structuring search statistics schemas...</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto pr-2 text-xs sm:text-sm text-[#fafafa] space-y-6 scrollbar leading-relaxed">
                {auditResult && (
                  <div className="space-y-4">
                    <pre className="whitespace-pre-wrap font-sans bg-[#09090b]/80 p-4 rounded-lg border border-[#27272a] overflow-x-auto text-[11px] sm:text-xs">
                      {auditResult}
                    </pre>
                  </div>
                )}
                {strategyResult && (
                  <div className="space-y-4">
                    <pre className="whitespace-pre-wrap font-sans bg-[#09090b]/80 p-4 rounded-lg border border-[#27272a] overflow-x-auto text-[11px] sm:text-xs">
                      {strategyResult}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* DRILL DOWN CONSOLE TABS VIEWER */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden" id="gsc-drilldown-panels">
          
          {/* TAB TICKER HEADERS */}
          <div className="flex bg-[#18181b] border-b border-[#27272a] overflow-x-auto" id="gsc-subtab-headers">
            <button
              onClick={() => { setSubTab("queries"); setSearchQuery(""); }}
              className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider relative whitespace-nowrap transition ${subTab === "queries" ? "text-white" : "text-[#a1a1aa] hover:text-white"}`}
            >
              Queries ({filteredQueries.length})
              {subTab === "queries" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white"></div>}
            </button>
            <button
              onClick={() => { setSubTab("pages"); setSearchQuery(""); }}
              className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider relative whitespace-nowrap transition ${subTab === "pages" ? "text-white" : "text-[#a1a1aa] hover:text-white"}`}
            >
              Pages ({filteredPages.length})
              {subTab === "pages" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white"></div>}
            </button>
            <button
              onClick={() => { setSubTab("countries"); setSearchQuery(""); }}
              className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider relative whitespace-nowrap transition ${subTab === "countries" ? "text-white" : "text-[#a1a1aa] hover:text-white"}`}
            >
              Countries ({activeSite.countries.length})
              {subTab === "countries" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white"></div>}
            </button>
            <button
              onClick={() => { setSubTab("devices"); setSearchQuery(""); }}
              className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider relative whitespace-nowrap transition ${subTab === "devices" ? "text-white" : "text-[#a1a1aa] hover:text-white"}`}
            >
              Devices ({activeSite.devices.length})
              {subTab === "devices" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white"></div>}
            </button>
            <button
              onClick={() => { setSubTab("month-comparison"); setSearchQuery(""); }}
              className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider relative whitespace-nowrap transition ${subTab === "month-comparison" ? "text-white" : "text-[#a1a1aa] hover:text-white"}`}
            >
              Month Comparison 🔄
              {subTab === "month-comparison" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white"></div>}
            </button>
            <button
              onClick={() => { setSubTab("keyword-tracking"); setSearchQuery(""); }}
              className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider relative whitespace-nowrap transition ${subTab === "keyword-tracking" ? "text-white" : "text-[#a1a1aa] hover:text-white"}`}
            >
              Keyword Tracker 🎯 ({(trackedKeywords[activeSite.id] || []).length})
              {subTab === "keyword-tracking" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white"></div>}
            </button>
          </div>

          {/* TAB TOOLS & FILTERS BAR */}
          {subTab !== "month-comparison" && subTab !== "keyword-tracking" && (
            <div className="p-4 border-b border-[#27272a] bg-[#18181b]/50 flex flex-col md:flex-row gap-3 items-center justify-between" id="gsc-filtering-dock">
              
              {/* Search Input */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-[#a1a1aa] absolute left-3 top-2.5" />
                <input 
                  type="text"
                  placeholder={subTab === "queries" ? "Search keys..." : "Search urls..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded py-1.5 pl-9 pr-4 text-xs text-white outline-none focus:border-[#a1a1aa] transition placeholder:text-[#a1a1aa]"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2 text-[#a1a1aa] hover:text-white text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Pivot selectors only for Queries tab */}
              {subTab === "queries" ? (
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto self-start md:self-auto py-1 md:py-0">
                  {/* Intent filter */}
                  <select 
                    className="bg-[#09090b] border border-[#27272a] text-xs py-1.5 px-3 rounded text-[#fafafa] outline-none hover:border-[#a1a1aa] font-medium"
                    value={intentFilter}
                    onChange={(e) => setIntentFilter(e.target.value)}
                  >
                    <option value="all">Intents: All</option>
                    <option value="Informational">Informational</option>
                    <option value="Transactional">Transactional</option>
                    <option value="Commercial">Commercial</option>
                  </select>

                  {/* Position intervals filter */}
                  <select 
                    className="bg-[#09090b] border border-[#27272a] text-xs py-1.5 px-3 rounded text-[#fafafa] outline-none hover:border-[#a1a1aa] font-medium"
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                  >
                    <option value="all">Positions: All</option>
                    <option value="top3">Top 3 (Strongest rank)</option>
                    <option value="top10">Top 10 (Page 1)</option>
                    <option value="page2">Position 11-20 (Page 2 Wins)</option>
                  </select>
                </div>
              ) : (
                <div className="text-[10px] font-mono text-[#a1a1aa] flex items-center gap-1">
                  <Info className="w-3 h-3 text-blue-500" />
                  <span>Showing parsed Search Console reports</span>
                </div>
              )}
            </div>
          )}

          {/* DYNAMIC LIST INTERFACES */}
          <div className="p-1 sm:p-2 bg-[#09090b]/40" id="gsc-drilldown-tables">
            
            {/* SUBTAB 1 - SEARCH QUERIES */}
            {subTab === "queries" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#27272a] text-[11px] font-mono tracking-wider text-[#a1a1aa] uppercase">
                      <th className="py-3 px-4">Search term / Query</th>
                      <th className="py-3 px-4 text-right">Clicks</th>
                      <th className="py-3 px-4 text-right">Impressions</th>
                      <th className="py-3 px-4 text-right">Avg. CTR</th>
                      <th className="py-3 px-4 text-right">Avg. Position</th>
                      <th className="py-3 px-4 text-center">User Intent</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a] text-xs">
                    {filteredQueries.length > 0 ? (
                      filteredQueries.map((item, idx) => {
                        const opportunityBadge = item.opportunityScore >= 80 
                          ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                          : item.opportunityScore >= 60 
                            ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                            : "text-sky-400 bg-sky-500/10 border-sky-500/20";
                        return (
                          <tr key={idx} className="hover:bg-[#18181b]/50 group transition">
                            <td className="py-3 px-4">
                              <span className="font-semibold text-white block group-hover:text-white transition">{item.query}</span>
                              <div className="mt-1 flex items-center gap-1.5">
                                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
                                  Score: {item.opportunityScore}
                                </span>
                                {item.opportunityScore >= 70 && (
                                  <span className="text-[9px] text-[#fafafa] bg-semibold-emerald bg-emerald-950 px-1 py-0.5 rounded text-[9px] border border-emerald-500/30 text-emerald-400 font-semibold">Priority Opportunity</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-medium text-[#fafafa]">
                              {Math.round(item.clicks * (dateRange === "7d" ? 0.25 : dateRange === "3m" ? 3.1 : dateRange === "6m" ? 6.2 : 1.0)).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-[#a1a1aa]">
                              {Math.round(item.impressions * (dateRange === "7d" ? 0.25 : dateRange === "3m" ? 3.1 : dateRange === "6m" ? 6.2 : 1.0)).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-500">
                              {item.ctr.toFixed(2)}%
                            </td>
                            <td className="py-3 px-4 text-right font-mono">
                              <span className={`px-1.5 py-0.5 rounded text-[11px] ${item.position <= 3 ? "text-emerald-500 bg-emerald-500/10" : item.position <= 10 ? "text-blue-500 bg-blue-500/10" : "text-amber-500 bg-amber-500/10"}`}>
                                {item.position.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
                                {item.intent}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => triggerContentBrief(item.query, item.position, item.ctr)}
                                  className="px-3 py-1 bg-[#18181b] hover:bg-[#27272a] rounded text-[10px] font-medium text-[#fafafa] border border-[#27272a] transition cursor-pointer"
                                  title="Build SEO brief with Gemini"
                                >
                                  Brief Outline
                                </button>
                                <button
                                  onClick={() => handleCopy(`Title: Best ${item.query} Guide | Meta: Discover top resources and analytics for ${item.query}...`, item.query)}
                                  className="p-1 border border-[#27272a] bg-[#18181b] text-[#a1a1aa] hover:text-white rounded transition"
                                  title="Copy SEO title draft helper"
                                >
                                  {copiedKeyword === item.query ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#a1a1aa] font-mono text-xs">
                          No query terms matched search parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUBTAB 2 - LANDING PAGES */}
            {subTab === "pages" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#27272a] text-[11px] font-mono tracking-wider text-[#a1a1aa] uppercase">
                      <th className="py-3 px-4">Landing Page Address</th>
                      <th className="py-3 px-4 text-right">Clicks</th>
                      <th className="py-3 px-4 text-right">Impressions</th>
                      <th className="py-3 px-4 text-right">Avg. CTR</th>
                      <th className="py-3 px-4 text-right">Avg. Position</th>
                      <th className="py-3 px-4 text-right">Dominant Keyword</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a] text-xs">
                    {filteredPages.length > 0 ? (
                      filteredPages.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#18181b]/50 group transition">
                          <td className="py-3 px-4">
                            <span className="font-mono text-blue-400 hover:underline transition truncate block max-w-xs sm:max-w-md cursor-pointer">
                              {item.url}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium text-white">
                            {Math.round(item.clicks * (dateRange === "7d" ? 0.25 : dateRange === "3m" ? 3.1 : dateRange === "6m" ? 6.2 : 1.0)).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[#a1a1aa]">
                            {Math.round(item.impressions * (dateRange === "7d" ? 0.25 : dateRange === "3m" ? 3.1 : dateRange === "6m" ? 6.2 : 1.0)).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-500">
                            {item.ctr.toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            <span className="px-1.5 py-0.5 rounded text-[11px] bg-[#18181b] border border-[#27272a] text-white">
                              {item.position.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-white">
                            <div className="flex items-center justify-end gap-1 text-[11px]">
                              <span>"{item.primaryKeyword}"</span>
                              <button
                                onClick={() => triggerContentBrief(item.primaryKeyword, item.position, item.ctr)}
                                className="ml-1.5 p-1 px-2.5 bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] border border-[#27272a] hover:text-white rounded text-[10px] transition"
                                title="Optimize Content Outline"
                              >
                                Build Draft
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#a1a1aa] font-mono text-xs">
                          No page records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUBTAB 3 - COUNTRIES */}
            {subTab === "countries" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
                <div className="lg:col-span-2 overflow-x-auto border-r border-[#27272a] pr-0 lg:pr-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#27272a] text-[11px] font-mono tracking-wider text-[#a1a1aa] uppercase">
                        <th className="py-3 px-4">Country Region</th>
                        <th className="py-3 px-4 text-right">Clicks</th>
                        <th className="py-3 px-4 text-right">Impressions</th>
                        <th className="py-3 px-4 text-right">Avg. CTR</th>
                        <th className="py-3 px-4 text-right">Avg. Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a] text-xs">
                      {activeSite.countries.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#18181b]/50 transition">
                          <td className="py-3 px-4 flex items-center gap-2">
                            <span className="w-5 h-4 bg-[#18181b] border border-[#27272a] rounded flex items-center justify-center font-mono font-semibold text-[9px] text-blue-400">
                              {item.code}
                            </span>
                            <span className="font-semibold text-white">{item.name}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-white">
                            {Math.round(item.clicks * (dateRange === "7d" ? 0.25 : dateRange === "3m" ? 3.1 : dateRange === "6m" ? 6.2 : 1.0)).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[#a1a1aa]">
                            {Math.round(item.impressions * (dateRange === "7d" ? 0.25 : dateRange === "3m" ? 3.1 : dateRange === "6m" ? 6.2 : 1.0)).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-500">{item.ctr.toFixed(2)}%</td>
                          <td className="py-3 px-4 text-right font-mono text-white">{item.position.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Country Insights Widget */}
                <div className="space-y-4 bg-[#18181b] p-5 rounded-lg border border-[#27272a]">
                  <h3 className="text-xs font-semibold text-[#fafafa] uppercase tracking-widest flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span>Geographic Insights</span>
                  </h3>
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-[#09090b]/60 border border-[#27272a] rounded space-y-1">
                      <span className="text-[10px] text-[#a1a1aa] font-mono block">Primary Search Node</span>
                      <p className="text-xs text-[#fafafa] font-normal leading-relaxed">
                        The **{activeSite.countries[0]?.name || "US"} ({activeSite.countries[0]?.code})** represents the dominant traffic core, commanding over **45%** of all organic user arrivals.
                      </p>
                    </div>
                    <div className="p-3 bg-[#09090b]/60 border border-[#27272a] rounded space-y-1">
                      <span className="text-[10px] text-[#a1a1aa] font-mono block">Rank Efficiency</span>
                      <p className="text-xs text-[#fafafa] font-normal leading-relaxed">
                        Search patterns indicate high localized alignment in Western Europe. Centralized keyword metadata translations suggested.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4 - DEVICES */}
            {subTab === "devices" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 sm:p-6">
                
                {/* Traditional list table */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase font-semibold tracking-widest text-[#a1a1aa]">Device Traffic Shares</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#27272a] text-[10px] font-mono uppercase text-[#a1a1aa]">
                          <th className="py-2">Device Node</th>
                          <th className="py-2 text-right">Clicks</th>
                          <th className="py-2 text-right">Impressions</th>
                          <th className="py-2 text-right">CTR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#27272a] text-xs">
                        {activeSite.devices.map((d, index) => {
                          const icons = { Mobile: <Smartphone className="w-4 h-4 text-blue-500" />, Desktop: <Monitor className="w-4 h-4 text-purple-500" />, Tablet: <Layers className="w-4 h-4 text-amber-500" /> };
                          return (
                            <tr key={index} className="hover:bg-[#18181b]/50">
                              <td className="py-3 flex items-center gap-2 font-semibold text-white">
                                {icons[d.device]}
                                <span>{d.device}</span>
                              </td>
                              <td className="py-3 text-right font-mono font-medium text-[#fafafa]">
                                {Math.round(d.clicks * (dateRange === "7d" ? 0.25 : dateRange === "3m" ? 3.1 : dateRange === "6m" ? 6.2 : 1.0)).toLocaleString()}
                              </td>
                              <td className="py-3 text-right font-mono text-[#a1a1aa]">
                                {Math.round(d.impressions * (dateRange === "7d" ? 0.25 : dateRange === "3m" ? 3.1 : dateRange === "6m" ? 6.2 : 1.0)).toLocaleString()}
                              </td>
                              <td className="py-3 text-right font-mono text-emerald-500">{d.ctr.toFixed(2)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pie Chart Representation */}
                <div className="flex flex-col items-center justify-center p-4 bg-[#18181b] border border-[#27272a] rounded-xl">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#a1a1aa] block mb-3">Organic Click Segmentation</span>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activeSite.devices.map(d => ({ name: d.device, value: d.clicks }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {activeSite.devices.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={deviceColors[index % deviceColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}

            {/* SUBTAB 5 - MONTH TO MONTH COMPARISON */}
            {subTab === "month-comparison" && (
              <div className="p-4 sm:p-6 space-y-6" id="month-comparison-stage">
                
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#18181b]/40 rounded-xl border border-[#27272a]">
                  <div>
                    <h3 className="text-[#fafafa] font-semibold text-sm flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-blue-500" style={{ transform: "rotate(45deg)" }} />
                      <span>Compare Monthly GSC Profiles</span>
                    </h3>
                    <p className="text-xs text-[#a1a1aa] mt-0.5">Select two month periods to trace organic shifts, CTR deltas, and keyword position deltas.</p>
                  </div>
                  
                  {/* Selectors */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#a1a1aa] mb-1">Period A</span>
                      <select 
                        value={monthA} 
                        onChange={(e) => setMonthA(e.target.value)}
                        className="bg-[#09090b] border border-[#27272a] rounded p-1.5 text-xs text-[#fafafa] outline-none"
                      >
                        {activeSite.trends.map(t => (
                          <option key={`a-${t.date}`} value={t.date}>{MONTH_NAMES[t.date] || t.date}</option>
                        ))}
                      </select>
                    </div>
                    
                    <span className="text-xs text-[#a1a1aa] mt-4 font-mono">VS</span>
                    
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#a1a1aa] mb-1">Period B</span>
                      <select 
                        value={monthB} 
                        onChange={(e) => setMonthB(e.target.value)}
                        className="bg-[#09090b] border border-[#27272a] rounded p-1.5 text-xs text-[#fafafa] outline-none"
                      >
                        {activeSite.trends.map(t => (
                          <option key={`b-${t.date}`} value={t.date}>{MONTH_NAMES[t.date] || t.date}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4 Cards Grid Comparing Month A and Month B */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* CLICKS COMPARE CARD */}
                  <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
                    <span className="text-xs text-[#a1a1aa] block uppercase font-mono">Total Clicks</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-medium text-white">{trendB.clicks.toLocaleString()}</span>
                      <span className="text-xs text-[#a1a1aa] font-mono">vs {trendA.clicks.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {clicksDiff >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span className={`text-xs font-semibold ${clicksDiff >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {clicksDiff >= 0 ? "+" : ""}{clicksDiff.toLocaleString()} ({clicksPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* IMPRESSIONS COMPARE CARD */}
                  <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
                    <span className="text-xs text-[#a1a1aa] block uppercase font-mono">Total Impressions</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-medium text-white">{trendB.impressions.toLocaleString()}</span>
                      <span className="text-xs text-[#a1a1aa] font-mono">vs {trendA.impressions.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {impDiff >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span className={`text-xs font-semibold ${impDiff >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {impDiff >= 0 ? "+" : ""}{impPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* CTR COMPARE CARD */}
                  <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
                    <span className="text-xs text-[#a1a1aa] block uppercase font-mono">Average CTR</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-medium text-white">{trendB.ctr.toFixed(2)}%</span>
                      <span className="text-xs text-[#a1a1aa] font-mono">vs {trendA.ctr.toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {ctrDiff >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span className={`text-xs font-semibold ${ctrDiff >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {ctrDiff >= 0 ? "+" : ""}{ctrDiff.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* AVG POSITION COMPARE CARD */}
                  <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
                    <span className="text-xs text-[#a1a1aa] block uppercase font-mono">Average Position</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-medium text-white">{trendB.position.toFixed(1)}</span>
                      <span className="text-xs text-[#a1a1aa] font-mono">vs {trendA.position.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {posDiff <= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0 animate-pulse" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span className={`text-xs font-semibold ${posDiff <= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {posDiff <= 0 ? "Improved" : "Dropped"} by {Math.abs(posDiff).toFixed(1)} ranks
                      </span>
                    </div>
                  </div>
                </div>

                {/* Double Bar Charts Comparing Months */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* CHART 1: CLICKS COMPARE */}
                  <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl">
                    <span className="text-xs font-semibold block text-[#fafafa] mb-4">Clicks Comparison Overview</span>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: MONTH_NAMES[monthA] || monthA, clicks: trendA.clicks, fill: "#3b82f6" },
                            { name: MONTH_NAMES[monthB] || monthB, clicks: trendB.clicks, fill: "#10b981" }
                          ]}
                          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                          <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
                          <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                          <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
                            {
                              [
                                { fill: "#3b82f6" },
                                { fill: "#10b981" }
                              ].map((entry, index) => (
                                <Cell key={`cell-c-${index}`} fill={entry.fill} />
                              ))
                            }
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* CHART 2: POSITION COMPARE */}
                  <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl">
                    <span className="text-xs font-semibold block text-[#fafafa] mb-4">Average Position Comparatives (Lower is Better)</span>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: MONTH_NAMES[monthA] || monthA, position: trendA.position, fill: "#e11d48" },
                            { name: MONTH_NAMES[monthB] || monthB, position: trendB.position, fill: "#10b981" }
                          ]}
                          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                          <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} domain={[0, 'auto']} />
                          <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                          <Bar dataKey="position" radius={[4, 4, 0, 0]}>
                            {
                              [
                                { fill: "#a1a1aa" },
                                { fill: "#10b981" }
                              ].map((entry, index) => (
                                <Cell key={`cell-p-${index}`} fill={entry.fill} />
                              ))
                            }
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Winners and Losers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* WINNERS */}
                  <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                      <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                      <span>Traffic Growth Winners</span>
                    </div>
                    <div className="divide-y divide-[#27272a]">
                      {winners.map((w, index) => (
                        <div key={`w-${index}`} className="py-3 flex items-center justify-between">
                          <div className="pr-2 truncate">
                            <span className="text-xs font-semibold text-white block truncate">"{w.query}"</span>
                            <span className="text-[10px] text-[#a1a1aa] font-mono">Rank: {w.monthBPosition.toFixed(1)} (from {w.monthAPosition.toFixed(1)})</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs text-emerald-400 font-medium block">+{w.clickChange} Clicks</span>
                            <span className="text-[10px] text-[#a1a1aa] font-mono">+{w.clickChangePct.toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* LOSERS */}
                  <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl space-y-4">
                    <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
                      <ArrowDownRight className="w-5 h-5 text-rose-500" />
                      <span>Traffic Declining Loss</span>
                    </div>
                    <div className="divide-y divide-[#27272a]">
                      {losers.map((l, index) => (
                        <div key={`l-${index}`} className="py-3 flex items-center justify-between">
                          <div className="pr-2 truncate">
                            <span className="text-xs font-semibold text-white block truncate">"{l.query}"</span>
                            <span className="text-[10px] text-[#a1a1aa] font-mono">Rank: {l.monthBPosition.toFixed(1)} (from {l.monthAPosition.toFixed(1)})</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs text-red-500 font-medium block">{l.clickChange} Clicks</span>
                            <span className="text-[10px] text-[#a1a1aa] font-mono">{l.clickChangePct.toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SUBTAB 6 - KEYWORD TRACKER */}
            {subTab === "keyword-tracking" && (
              <div className="p-4 sm:p-6 space-y-6" id="keyword-tracker-stage">
                
                {/* Summary Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl space-y-1">
                    <span className="text-[10px] text-[#a1a1aa] block uppercase font-mono">Average Position</span>
                    <h4 className="text-xl font-bold text-white">#{avgTrackedPos}</h4>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Fully Synced
                    </span>
                  </div>

                  <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl space-y-1">
                    <span className="text-[10px] text-[#a1a1aa] block uppercase font-mono">In Top 3</span>
                    <h4 className="text-xl font-bold text-white text-emerald-500">{top3Count} <span className="text-xs text-[#a1a1aa] font-normal">keywords</span></h4>
                    <span className="text-[10px] text-[#a1a1aa]">Highest opportunity core</span>
                  </div>

                  <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl space-y-1">
                    <span className="text-[10px] text-[#a1a1aa] block uppercase font-mono">In Top 10</span>
                    <h4 className="text-xl font-bold text-white text-blue-400">{top10Count} <span className="text-xs text-[#a1a1aa] font-normal">keywords</span></h4>
                    <span className="text-[10px] text-[#a1a1aa]">Page 1 search index</span>
                  </div>

                  <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl space-y-1">
                    <span className="text-[10px] text-[#a1a1aa] block uppercase font-mono">Total Est. Vol</span>
                    <h4 className="text-xl font-bold text-white">{totalVolume}</h4>
                    <span className="text-[10px] text-[#a1a1aa]">Monthly search reach</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Tracked Keywords List (Takes 2 columns) */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#fafafa]">Tracked Keywords Index</h3>
                      <span className="text-[10px] text-[#a1a1aa] font-mono">{activeTracked.length} terms tracking currently</span>
                    </div>

                    <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#27272a] text-[10px] font-mono tracking-wider text-[#a1a1aa] uppercase bg-[#18181b]/85 whitespace-nowrap">
                              <th className="py-3 px-4">Search Query Term</th>
                              <th className="py-3 px-4 text-center">Difficulty</th>
                              <th className="py-3 px-4 text-right">Search Vol</th>
                              <th className="py-3 px-4 text-center">Target Rank</th>
                              <th className="py-3 px-4 text-center">GSC Rank</th>
                              <th className="py-3 px-4 text-center">Status</th>
                              <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#27272a] text-xs">
                            {activeTracked.length > 0 ? (
                              activeTracked.map((item) => {
                                const rankDelta = item.previousPosition - item.currentPosition; // positive is rank improved!
                                const isRankUp = rankDelta > 0;
                                
                                return (
                                  <tr key={item.id} className="hover:bg-[#18181b]/50 group transition">
                                    <td className="py-3 px-4 font-semibold text-white">
                                      <div className="truncate max-w-[150px]" title={item.query}>
                                        {item.query}
                                      </div>
                                      <span className="text-[9px] font-mono text-[#a1a1aa] block font-normal mt-0.5">Added: {item.dateAdded}</span>
                                    </td>
                                    
                                    <td className="py-3 px-4 text-center">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                        item.difficulty === "Easy" 
                                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                                          : item.difficulty === "Medium" 
                                            ? "text-amber-400 bg-amber-500/10 border-amber-500/20" 
                                            : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                                      }`}>
                                        {item.difficulty}
                                      </span>
                                    </td>

                                    <td className="py-3 px-4 text-right font-mono text-white">
                                      {item.volume.toLocaleString()}
                                    </td>

                                    <td className="py-3 px-4 text-center font-semibold text-[#a1a1aa]">
                                      #{item.targetPosition}
                                    </td>

                                    <td className="py-3 px-4 text-center font-mono font-medium">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <span className="text-white font-semibold">#{item.currentPosition.toFixed(1)}</span>
                                        {Math.abs(rankDelta) > 0.05 && (
                                          <span className={`flex items-center gap-0.5 text-[9px] font-bold ${isRankUp ? "text-emerald-500" : "text-rose-500"}`}>
                                            {isRankUp ? "▲" : "▼"}{Math.abs(rankDelta).toFixed(1)}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    <td className="py-3 px-4 text-center">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                        item.status === "On Track" 
                                          ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" 
                                          : item.status === "Needs Attention" 
                                            ? "text-amber-400 bg-amber-500/15 border-amber-500/30" 
                                            : "text-rose-400 bg-rose-500/15 border-rose-500/30"
                                      }`}>
                                        {item.status}
                                      </span>
                                    </td>

                                    <td className="py-3 px-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={() => {
                                            setBriefKeyword(item.query);
                                            setBriefPosition(item.currentPosition);
                                            setBriefCtr(item.currentPosition <= 3 ? 5.2 : item.currentPosition <= 10 ? 2.8 : 1.1);
                                            // Scroll to builder
                                            document.getElementById("gsc-briefing-room")?.scrollIntoView({ behavior: "smooth" });
                                          }}
                                          className="text-[10px] text-blue-400 hover:text-white px-2 py-1 bg-[#18181b] rounded border border-[#27272a] hover:bg-[#27272a] cursor-pointer"
                                          title="Generate Content Brief layout"
                                        >
                                          SEO Brief
                                        </button>
                                        <button
                                          onClick={() => handleDeleteTrackedKeyword(item.id)}
                                          className="text-[#a1a1aa] hover:text-red-400 p-1 rounded transition cursor-pointer"
                                          title="Remove from tracking"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-[#a1a1aa] font-mono text-xs">
                                  No keywords are being tracked yet. Use the tool on the right to add some keywords.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Add Keyword Form (Takes 1 column) */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#fafafa]">Monitor New Keyword</h3>
                    
                    <form onSubmit={handleAddTrackedKeyword} className="p-5 bg-[#18181b] border border-[#27272a] rounded-xl space-y-4">
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[#a1a1aa] block mb-1">Search Phrase</label>
                        <div className="relative">
                          <Search className="w-4 h-4 text-[#a1a1aa] absolute left-3 top-2.5" />
                          <input 
                            type="text"
                            required
                            placeholder="e.g. b2b growth strategy"
                            value={newKeywordQuery}
                            onChange={(e) => setNewKeywordQuery(e.target.value)}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded py-1.5 pl-9 pr-4 text-xs text-white outline-none focus:border-[#a1a1aa] transition placeholder:text-[#52525b]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-[#a1a1aa] block mb-1">Target rank</label>
                          <select 
                            value={newKeywordTarget} 
                            onChange={(e) => setNewKeywordTarget(parseInt(e.target.value))}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded p-1.5 text-xs text-white outline-none font-medium"
                          >
                            <option value={1}>#1 (Leader)</option>
                            <option value={3}>#3 (Hero)</option>
                            <option value={5}>#5 (Page 1 Mid)</option>
                            <option value={10}>#10 (Page 1 Edge)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-semibold text-[#a1a1aa] block mb-1">Difficulty</label>
                          <select 
                            value={newKeywordDiff} 
                            onChange={(e) => setNewKeywordDiff(e.target.value as any)}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded p-1.5 text-xs text-white outline-none font-medium"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-semibold text-[#a1a1aa] block mb-1">Est. Search volume / mo</label>
                        <input 
                          type="number"
                          min={10}
                          max={500000}
                          value={newKeywordVolume}
                          onChange={(e) => setNewKeywordVolume(parseInt(e.target.value) || 0)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded py-1.5 px-3 text-xs text-white outline-none focus:border-[#a1a1aa]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-white hover:bg-[#eaeaea] text-black py-2 rounded text-xs font-semibold hover:border-[#a1a1aa] flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add keyword tracking</span>
                      </button>
                    </form>

                    {/* Pro Optimization Tip card */}
                    <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl flex gap-3">
                      <Zap className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5 animate-pulse" />
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-white block">Rank Tracker Engine</span>
                        <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                          Adding terms tells the indexing robot to record SERP fluctuations every 12 hours. Track progress vs target metrics to calculate opportunity scores dynamically.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* INTERACTIVE GEMINI BRIEF GENERATOR PANE */}
        <section className="bg-[#18181b] border border-[#27272a] rounded-xl p-6" id="gsc-briefing-room">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Input variables */}
            <div className="w-full lg:w-1/3 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </div>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-white">AI Content Brief Planner</h3>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Type or click "Brief Outline" on any GSC keyword above. Gemini will generate optimized title structures, thematic headings and competitor ranking guidelines.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-[10px] uppercase font-semibold text-[#a1a1aa] block mb-1">Target Keyword</label>
                  <input 
                    type="text"
                    value={briefKeyword}
                    onChange={(e) => setBriefKeyword(e.target.value)}
                    placeholder="e.g. react 19 state managers"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded py-1.5 px-3 text-xs text-white outline-none focus:border-[#a1a1aa] transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-[#a1a1aa] block mb-1">GSC Position</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={briefPosition}
                      onChange={(e) => setBriefPosition(parseFloat(e.target.value) || 10)}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded py-1.5 px-3 text-xs text-white outline-none focus:border-[#a1a1aa]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-[#a1a1aa] block mb-1">Current CTR %</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={briefCtr}
                      onChange={(e) => setBriefCtr(parseFloat(e.target.value) || 2.1)}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded py-1.5 px-3 text-xs text-white outline-none focus:border-[#a1a1aa]"
                    />
                  </div>
                </div>

                <button
                  onClick={() => triggerContentBrief(briefKeyword, briefPosition, briefCtr)}
                  disabled={!briefKeyword || isBriefLoading}
                  className="w-full bg-[#fafafa] hover:bg-[#eaeaea] disabled:bg-[#27272a] text-[#09090b] disabled:text-[#a1a1aa] py-2 rounded text-xs font-semibold select-none transition cursor-pointer flex items-center justify-center gap-2 border border-[#27272a]"
                >
                  {isBriefLoading ? (
                    <>
                      <RefreshCw className="w-3 animate-spin" />
                      <span>Writing Search Brief...</span>
                    </>
                  ) : (
                    <span>Generate AI SEO Plan</span>
                  )}
                </button>
              </div>
            </div>

            {/* AI Outline Outputs */}
            <div className="flex-1 min-h-48 bg-[#09090b]/80 border border-[#27272a] rounded p-4 sm:p-5 relative">
              {isBriefLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#09090b]/90 rounded z-10">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-2"></div>
                  <span className="text-xs font-mono text-[#a1a1aa]">Gemini is mapping key headers and semantic clusters...</span>
                </div>
              ) : null}

              {briefResult ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-[#27272a] pb-2">
                    <span className="text-xs font-semibold text-blue-400">Blueprint results for: "{briefKeyword}"</span>
                    <button
                      onClick={() => handleCopy(briefResult, briefKeyword)}
                      className="text-[#a1a1aa] hover:text-white flex items-center gap-1 text-[11px] font-mono"
                    >
                      {copiedKeyword === briefKeyword ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied Blueprint!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Brief Outline</span>
                        </>
                      )
                      }
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto text-xs text-[#fafafa] leading-relaxed scrollbar pr-2">
                    <pre className="whitespace-pre-wrap font-sans text-xs">
                      {briefResult}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="p-3 rounded-full bg-[#18181b]/55 border border-[#27272a]">
                    <Sparkles className="w-6 h-6 text-[#a1a1aa]" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block mb-0.5">Ready for SEO Content Briefing</span>
                    <span className="text-[11px] text-[#a1a1aa] max-w-sm block">
                      Select a search query from the table above or input your target query to generate optimized title layouts, semantic headers and featured snippet blocks.
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>

      </div>
    </main>

  </div>
  );
}


// FALLBACK COMPREHENSIVE TEXT REPORTS GENERATED IF GEMINI API KEY PREPARES OR MISSES
function getOfflineAudit(site: string, metrics: any) {
  return `### 📊 OFFLINE ACTIONABLE SEO REPORT FOR ${site.toUpperCase()}
*Note: Using built-in local fallback analytics models. Define a real GEMINI_API_KEY in the Secrets panel to activate full enterprise audits.*

1. **Executive Summary**:
   Your site Search visibility is holding strong at an average position of **${metrics.position.toFixed(1)}** with a total of **${metrics.clicks.toLocaleString()} clicks** representing a CTR density of **${metrics.ctr.toFixed(2)}%**. Trajectory indices indicate steady momentum with solid opportunities to pivot page-2 keywords.

2. **Key Low-Hanging Opportunities**:
   - **Target Query Core**: Optimize primary queries currently sitting at position **10 to 14** (on the cusp of Page 1). A 5% boost in CTR will generate **over 3,500 additional organic arrivals**.
   - **Page-2 Intent Alignment**: Address the intent shift on pages experiencing CTR drop-offs. High impressions signify strong interest, but content is likely stale or misaligned.

3. **On-Page & Technical Audit**:
   - **Page Rendering Core**: Optimize Largest Contentful Paint (LCP). Images or large script components are triggering layout shifts.
   - **Sitelink Searchbox & Structured Schemas**: Ensure proper Schema.org JSON-LD structured data is implemented for pages to secure rich Google Snippets.

4. **Strategic Action Plan**:
   - Update titles to include CTR power words (e.g. *Guide*, *Fast*, *Optimized*, *[Year]*).
   - Re-cluster semantic sibling headings (H2/H3) to expand intent surface coverage.
  `;
}

function getOfflineStrategy(queries: GscQuery[]) {
  // Find queries sitting on page 2 (position 10 to 20)
  const page2queries = queries.filter(q => q.position > 10 && q.position <= 20).slice(0, 3);
  const titles = page2queries.map(q => {
    return `### 🔍 Keyword Target: "${q.query}" (Current Position: ${q.position.toFixed(1)})
- **Optimized SEO Title Layout**: "How to Master ${q.query.toUpperCase()} - Complete Optimization Guide"
- **Meta Description**: "Stop struggling with ${q.query}. Learn advanced strategies, core workflows, and real-world checklists to double your efficiency fast."
- **Auxiliary LSI Terms**: [${q.query} tips, ${q.query} templates, best ${q.query} setups, enterprise ${q.query}]
- **Modification Tip**: Add a curated "Frequently Asked Questions" section addressing this query directly to capture featured snippet blocks.
`;
  }).join("\n");

  return `### ⚡ PAGE 1 PIVOT OPTIMIZATION BLUEPRINT

${titles || "No queries found on Page 2 (Positions 8-20). Try querying other site sandbox sets!"}
`;
}

function getOfflineBrief(kw: string, position: number, ctr: number) {
  return `### 📝 CONTENT BRIEF DRAFT: "${kw.toUpperCase()}"
*GSC Statistics: Position ${position} | CTR ${ctr}%*

1. **Recommended Meta Header (H1)**:
   "The Ultimate ${kw} Guide: Step-by-Step Optimization Tactics"

2. **Semantic H2 / H3 Header Architecture**:
   - **H2: What is ${kw}?** (Targeting search intent and defining high-level syntax)
   - **H2: Core Core Workflows and Real-World Scenarios**
     - *H3: Crucial Checklists to Double Efficiency*
     - *H3: Common Pitfalls to Avoid*
   - **H2: Frequently Asked Questions about ${kw}**

3. **Answer Target block (Featured Snippet)**:
   Add a 50-word direct answer block immediately following the first H2: *"An efficient ${kw} is configured by structuring logical blocks, caching static collections, and optimizing search indexes."*

4. **Competitor Gap Wins**:
   Analyze current ranking articles (Positions 1-3). Provide unique, downloadable templates and concrete interactive code snippets that competitors miss.
`;
}
