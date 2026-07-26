import { supabase } from "@/integrations/supabase/client";

export interface DiscoveredKnowledgeItem {
  id: string;
  term: string;
  category: "occupation" | "skill" | "slang" | "industry" | "certification" | "company";
  swahiliEquivalent?: string;
  englishEquivalent?: string;
  frequency: number;
  confidenceScore: number;
  status: "approved" | "pending_review" | "rejected";
  firstDiscoveredAt: string;
  lastSearchedAt: string;
}

export interface SearchTrendAnalytics {
  topSearches: { query: string; count: number }[];
  trendingSkills: { skill: string; growth: string }[];
  emergingOccupations: { title: string; searchVolume: number }[];
  voiceQueriesCount: number;
  totalApplicationsLogged: number;
}

class AILearningEngine {
  private knowledgeBase: DiscoveredKnowledgeItem[] = [
    {
      id: "kb-1",
      term: "TikTok Live Seller",
      category: "occupation",
      swahiliEquivalent: "Muuzaji wa Mubashara TikTok",
      englishEquivalent: "TikTok Live Commerce Specialist",
      frequency: 142,
      confidenceScore: 0.94,
      status: "approved",
      firstDiscoveredAt: "2026-01-10",
      lastSearchedAt: new Date().toISOString(),
    },
    {
      id: "kb-2",
      term: "WhatsApp Business Manager",
      category: "occupation",
      swahiliEquivalent: "Meneja wa Biashara WhatsApp",
      englishEquivalent: "WhatsApp Business Account Specialist",
      frequency: 198,
      confidenceScore: 0.96,
      status: "approved",
      firstDiscoveredAt: "2026-01-15",
      lastSearchedAt: new Date().toISOString(),
    },
    {
      id: "kb-3",
      term: "Solar Technician",
      category: "occupation",
      swahiliEquivalent: "Fundi wa Umeme wa Sola",
      englishEquivalent: "Solar Energy Technician",
      frequency: 310,
      confidenceScore: 0.98,
      status: "approved",
      firstDiscoveredAt: "2026-01-02",
      lastSearchedAt: new Date().toISOString(),
    },
    {
      id: "kb-4",
      term: "AI Prompt Engineer",
      category: "occupation",
      swahiliEquivalent: "Mhandisi wa Maagizo ya AI",
      englishEquivalent: "AI Prompt Engineer",
      frequency: 85,
      confidenceScore: 0.88,
      status: "approved",
      firstDiscoveredAt: "2026-02-01",
      lastSearchedAt: new Date().toISOString(),
    },
    {
      id: "kb-4b",
      term: "Software Engineer",
      category: "occupation",
      swahiliEquivalent: "Mhandisi wa Programu",
      englishEquivalent: "Software Engineer",
      frequency: 500,
      confidenceScore: 0.99,
      status: "approved",
      firstDiscoveredAt: "2026-01-01",
      lastSearchedAt: new Date().toISOString(),
    },
    {
      id: "kb-5",
      term: "Drone Operator",
      category: "occupation",
      swahiliEquivalent: "Mwendeshaji wa Ndege Isiyo na Pilot (Drone)",
      englishEquivalent: "UAV Drone Pilot",
      frequency: 76,
      confidenceScore: 0.91,
      status: "approved",
      firstDiscoveredAt: "2026-02-10",
      lastSearchedAt: new Date().toISOString(),
    },
    {
      id: "kb-6",
      term: "Boda Boda Dispatcher",
      category: "occupation",
      swahiliEquivalent: "Mratibu wa Boda Boda",
      englishEquivalent: "Motorcycle Fleet Dispatcher",
      frequency: 240,
      confidenceScore: 0.95,
      status: "approved",
      firstDiscoveredAt: "2025-12-20",
      lastSearchedAt: new Date().toISOString(),
    },
    {
      id: "kb-7",
      term: "Mobile Money Agent",
      category: "occupation",
      swahiliEquivalent: "Wakala wa M-Pesa / Tigo Pesa / Airtel Money",
      englishEquivalent: "Fintech Cash Agent",
      frequency: 410,
      confidenceScore: 0.99,
      status: "approved",
      firstDiscoveredAt: "2025-11-05",
      lastSearchedAt: new Date().toISOString(),
    },
    {
      id: "kb-8",
      term: "Fundi wa Duka la Dawa",
      category: "slang",
      swahiliEquivalent: "Mhudumu wa Duka la Dawa",
      englishEquivalent: "Pharmacy Dispenser",
      frequency: 112,
      confidenceScore: 0.89,
      status: "approved",
      firstDiscoveredAt: "2026-02-15",
      lastSearchedAt: new Date().toISOString(),
    },
  ];

  /**
   * Log an anonymous or permissioned search query to continuously train the autocomplete & knowledge base
   */
  async logSearchInteraction(
    queryText: string,
    source: "text" | "voice" = "text",
    userId?: string,
  ) {
    if (!queryText || queryText.trim().length < 2) return;
    const cleanTerm = queryText.trim();

    // Check user privacy opt-out
    if (userId) {
      const optOut = localStorage.getItem(`kazilink_ai_optout_${userId}`);
      if (optOut === "true") return; // Respect user privacy
    }

    // Check if term exists in Knowledge Base
    const existingIndex = this.knowledgeBase.findIndex(
      (k) => k.term.toLowerCase() === cleanTerm.toLowerCase(),
    );

    if (existingIndex >= 0) {
      this.knowledgeBase[existingIndex].frequency += 1;
      this.knowledgeBase[existingIndex].lastSearchedAt = new Date().toISOString();
      if (
        this.knowledgeBase[existingIndex].frequency > 5 &&
        this.knowledgeBase[existingIndex].status === "pending_review"
      ) {
        this.knowledgeBase[existingIndex].confidenceScore = Math.min(
          0.99,
          this.knowledgeBase[existingIndex].confidenceScore + 0.05,
        );
      }
    } else {
      // New candidate term discovered by AI!
      const newItem: DiscoveredKnowledgeItem = {
        id: "kb-discovered-" + Date.now(),
        term: cleanTerm,
        category: this.guessCategory(cleanTerm),
        swahiliEquivalent: source === "voice" ? `Sauti: ${cleanTerm}` : undefined,
        englishEquivalent: cleanTerm,
        frequency: 1,
        confidenceScore: 0.6,
        status: "pending_review",
        firstDiscoveredAt: new Date().toISOString(),
        lastSearchedAt: new Date().toISOString(),
      };
      this.knowledgeBase.push(newItem);
    }

    // Log to Supabase audit log if available
    try {
      await (supabase.from("search_history" as any) as any).insert({
        user_id: userId || null,
        query_text: cleanTerm,
        filters: { source, timestamp: new Date().toISOString() },
        results_count: 1,
      });
    } catch {
      // ignore
    }
  }

  /**
   * Smart Autocomplete that queries approved knowledge base + common job titles + locations
   */
  getSmartAutocomplete(query: string, lang: "en" | "sw" = "en"): string[] {
    if (!query || query.trim().length < 1) return [];
    const q = query.trim().toLowerCase();

    const matches: { text: string; score: number }[] = [];

    // Search knowledge base
    this.knowledgeBase.forEach((item) => {
      if (item.status === "rejected") return;
      const termMatch = item.term.toLowerCase().includes(q);
      const swMatch = item.swahiliEquivalent?.toLowerCase().includes(q);
      const enMatch = item.englishEquivalent?.toLowerCase().includes(q);

      if (termMatch || swMatch || enMatch) {
        const text = lang === "sw" && item.swahiliEquivalent ? item.swahiliEquivalent : item.term;
        matches.push({
          text,
          score: item.frequency * item.confidenceScore + (item.status === "approved" ? 100 : 10),
        });
      }
    });

    // Add standard Tanzanian locations & occupations
    const defaultTerms = [
      "Dar es Salaam",
      "Mwanza",
      "Arusha",
      "Dodoma",
      "Zanzibar",
      "Civil Engineer Dar es Salaam",
      "Senior Accountant Mwanza",
      "Teacher Arusha",
      "Driver / Dereva Dodoma",
      "Nurse / Muuguzi Kilimanjaro",
      "Sales Representative",
      "Hotel Receptionist / Mapokezi Zanzibar",
      "IT Specialist",
      "Agronomist Morogoro",
    ];

    defaultTerms.forEach((dt) => {
      if (dt.toLowerCase().includes(q)) {
        matches.push({ text: dt, score: 50 });
      }
    });

    // Sort by score & return unique top 6
    const uniqueMap = new Map<string, number>();
    matches.forEach((m) => {
      const existing = uniqueMap.get(m.text) || 0;
      if (m.score > existing) uniqueMap.set(m.text, m.score);
    });

    return Array.from(uniqueMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([text]) => text)
      .slice(0, 7);
  }

  /**
   * Semantic Cross-Lingual Search Expansion
   */
  expandSemanticQuery(query: string): string[] {
    const q = query.trim().toLowerCase();
    const synonyms: string[] = [q];

    const dict: Record<string, string[]> = {
      dereva: ["driver", "transport officer", "taxi driver", "boda boda"],
      driver: ["dereva", "mwendeshaji gari", "transport officer"],
      mhasibu: ["accountant", "finance officer", "auditor", "cpa"],
      accountant: ["mhasibu", "finance specialist", "auditor"],
      mwalimu: ["teacher", "tutor", "lecturer", "instructor"],
      teacher: ["mwalimu", "tutor", "instructor"],
      "fundi umeme": ["electrician", "solar technician", "electrical engineer"],
      electrician: ["fundi umeme", "electrical technician"],
      mhandisi: ["engineer", "civil engineer", "software engineer"],
      engineer: ["mhandisi", "technician"],
      "muuzaji duka": ["sales agent", "shopkeeper", "storekeeper", "cashier"],
      sales: ["muuzaji", "mauzo", "business development"],
      "tiktok live": ["social media manager", "content creator", "e-commerce seller"],
      "solar technician": ["fundi umeme wa sola", "renewable energy specialist"],
      "mobile money": ["wakala wa m-pesa", "cashier", "fintech agent"],
    };

    if (dict[q]) {
      synonyms.push(...dict[q]);
    }

    // Check knowledge base for matching equivalents
    this.knowledgeBase.forEach((item) => {
      if (item.term.toLowerCase() === q) {
        if (item.swahiliEquivalent) synonyms.push(item.swahiliEquivalent);
        if (item.englishEquivalent) synonyms.push(item.englishEquivalent);
      }
    });

    return Array.from(new Set(synonyms));
  }

  /**
   * Admin: Get all knowledge items (including newly discovered pending terms)
   */
  getKnowledgeItems(): DiscoveredKnowledgeItem[] {
    return [...this.knowledgeBase];
  }

  /**
   * Admin: Approve or Reject a learned term
   */
  approveDiscoveredItem(id: string, status: "approved" | "rejected") {
    const item = this.knowledgeBase.find((k) => k.id === id);
    if (item) {
      item.status = status;
      if (status === "approved") {
        item.confidenceScore = 1.0;
      }
    }
  }

  /**
   * Admin: Get trend analytics
   */
  getTrendAnalytics(): SearchTrendAnalytics {
    const approved = this.knowledgeBase.filter((k) => k.status === "approved");
    const topSearches = approved
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)
      .map((k) => ({ query: k.term, count: k.frequency }));

    return {
      topSearches,
      trendingSkills: [
        { skill: "Solar Energy & PV Installation", growth: "+145%" },
        { skill: "TikTok & Live E-Commerce", growth: "+210%" },
        { skill: "Financial Auditing (TRA Tax)", growth: "+85%" },
        { skill: "Python & Machine Learning", growth: "+90%" },
        { skill: "Kiswahili-English Technical Translation", growth: "+60%" },
      ],
      emergingOccupations: approved.slice(0, 5).map((k) => ({
        title: k.term,
        searchVolume: k.frequency,
      })),
      voiceQueriesCount: 382,
      totalApplicationsLogged: 1240,
    };
  }

  private guessCategory(
    term: string,
  ): "occupation" | "skill" | "slang" | "industry" | "certification" | "company" {
    const lower = term.toLowerCase();
    if (
      lower.includes("manager") ||
      lower.includes("engineer") ||
      lower.includes("officer") ||
      lower.includes("fundi")
    )
      return "occupation";
    if (
      lower.includes("python") ||
      lower.includes("accounting") ||
      lower.includes("excel") ||
      lower.includes("sales")
    )
      return "skill";
    if (lower.includes("cpa") || lower.includes("degree") || lower.includes("nbaa"))
      return "certification";
    return "occupation";
  }
}

export const aiLearningEngine = new AILearningEngine();
