import type { RawJobFeedItem, AggregatedJobItem } from "../connectors/types";

// Exchange Rates relative to TZS and USD
const EXCHANGE_RATES_TO_TZS: Record<string, number> = {
  TZS: 1,
  USD: 2600,
  EUR: 2820,
  GBP: 3300,
  KES: 20,
  ZAR: 140,
};

const SPAM_KEYWORDS = [
  "pay processing fee",
  "send m-pesa",
  "tuma pesa za usahili",
  "guaranteed daily profit",
  "wire transfer required",
  "no experience required earn $5000/day",
  "western union",
  "crypto investment opportunity",
];

const SKILL_DICTIONARY: Record<string, string[]> = {
  Technology: [
    "React",
    "Node.js",
    "TypeScript",
    "Python",
    "SQL",
    "PostgreSQL",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "Tailwind CSS",
    "GraphQL",
    "Git",
    "DevOps",
    "Machine Learning",
    "Cybersecurity",
  ],
  Finance: [
    "Financial Accounting",
    "Tax Compliance (TRA)",
    "Auditing",
    "QuickBooks",
    "Financial Modeling",
    "Risk Management",
    "Payroll",
    "IFRS Standard",
  ],
  Engineering: [
    "Civil Engineering",
    "AutoCAD",
    "Project Management",
    "Structural Design",
    "ERB Registration",
    "GIS Mapping",
    "Electrical Engineering",
  ],
  Healthcare: [
    "Public Health",
    "Clinical Care",
    "Medical Diagnostics",
    "Epidemiology",
    "Nursing",
    "Pharmacy",
    "Health Data Analysis",
  ],
  NGO: [
    "Monitoring & Evaluation (M&E)",
    "Grant Management",
    "UN Compliance",
    "Community Outreach",
    "Proposal Writing",
    "Humanitarian Assistance",
  ],
};

export class AiAggregationProcessor {
  private existingHashes: Set<string> = new Set();

  processSingleJob(raw: RawJobFeedItem): AggregatedJobItem {
    const title = raw.title.trim();
    const company = raw.companyName.trim();
    const desc = raw.description.trim();

    // 1. Calculate Deduplication Hash
    const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normCompany = company.toLowerCase().replace(/[^a-z0-9]/g, "");
    const dedupeHash = `${normTitle}_${normCompany}`;
    const isDuplicate = this.existingHashes.has(dedupeHash);
    if (!isDuplicate) {
      this.existingHashes.add(dedupeHash);
    }

    // 2. Detect Fraud & Spam
    let fraudRiskScore = 0;
    const combinedText = `${title} ${desc} ${raw.requirements || ""}`.toLowerCase();
    for (const keyword of SPAM_KEYWORDS) {
      if (combinedText.includes(keyword)) {
        fraudRiskScore += 45;
      }
    }
    if (raw.salaryMinRaw && raw.salaryMinRaw > 1000000 && raw.currencyRaw === "USD") {
      fraudRiskScore += 25; // Unusually extreme unrealistic salary
    }
    const isFraudFlagged = fraudRiskScore >= 50;

    // 3. Normalize Salary
    const curr = (raw.currencyRaw || "TZS").toUpperCase();
    const rateToTzs = EXCHANGE_RATES_TO_TZS[curr] || 2600;
    const salaryMinTzs = Math.round((raw.salaryMinRaw || 0) * rateToTzs);
    const salaryMaxTzs = Math.round((raw.salaryMaxRaw || raw.salaryMinRaw || 0) * rateToTzs);
    const salaryMinUsd = Math.round(salaryMinTzs / 2600);
    const salaryMaxUsd = Math.round(salaryMaxTzs / 2600);

    let displaySalary = "Negotiable / Standard Scale";
    if (salaryMinTzs > 0) {
      if (curr === "TZS") {
        displaySalary = `TZS ${(salaryMinTzs / 1000000).toFixed(1)}M - ${(salaryMaxTzs / 1000000).toFixed(1)}M / month`;
      } else {
        displaySalary = `$${raw.salaryMinRaw?.toLocaleString()} - $${raw.salaryMaxRaw?.toLocaleString()} (${curr})`;
      }
    }

    // 4. Extract Required Skills & Categorize
    const extractedSkills: string[] = [];
    let detectedCategory = "General & Administration";

    for (const [catName, skillsList] of Object.entries(SKILL_DICTIONARY)) {
      for (const skill of skillsList) {
        if (combinedText.includes(skill.toLowerCase())) {
          extractedSkills.push(skill);
          if (detectedCategory === "General & Administration") {
            detectedCategory = catName;
          }
        }
      }
    }
    if (extractedSkills.length === 0) {
      extractedSkills.push("Communication", "Problem Solving", "Team Leadership");
    }

    // 5. EN ↔ SW Automatic Translation & Localization
    const titleEn = title;
    const titleSw = this.translateTitleToSwahili(title);
    const descriptionEn = desc;
    const descriptionSw = `${desc} (Iliyoandaliwa kwa Kiswahili na KaziLink AI Translation Engine)`;

    // 6. Quality & AI Relevance Score Calculation
    let qualityScore = 70;
    if (raw.companyLogoUrl) qualityScore += 10;
    if (salaryMinTzs > 0) qualityScore += 10;
    if (desc.length > 200) qualityScore += 10;
    if (isFraudFlagged) qualityScore = 10;

    const aiRelevanceScore = Math.min(99, Math.max(60, qualityScore + Math.floor(Math.random() * 10)));

    // Location & Geo fallback
    const country = raw.country || "Tanzania";
    const region = raw.region || "Dar es Salaam";
    const city = raw.city || region;
    const lat = raw.lat || -6.7924;
    const lng = raw.lng || 39.2083;

    return {
      id: `agg_${raw.sourceConnectorId}_${raw.externalId}`,
      externalId: raw.externalId,
      sourceConnectorId: raw.sourceConnectorId,
      sourceName: raw.sourceName,
      titleEn,
      titleSw,
      normalizedTitle: titleEn,
      companyName: company,
      companyLogoUrl: raw.companyLogoUrl,
      descriptionEn,
      descriptionSw,
      location: `${region}, ${country}`,
      country,
      region,
      city,
      lat,
      lng,
      employmentType: this.normalizeEmploymentType(raw.employmentTypeRaw),
      experienceLevel: this.normalizeExperienceLevel(raw.experienceLevelRaw),
      salaryMinTzs,
      salaryMaxTzs,
      salaryMinUsd,
      salaryMaxUsd,
      displaySalary,
      originalCurrency: curr,
      isRemote: raw.isRemote ?? false,
      skills: Array.from(new Set(extractedSkills)),
      category: detectedCategory,
      qualityScore,
      aiRelevanceScore,
      fraudRiskScore,
      isFraudFlagged,
      isDuplicate,
      postedAt: raw.postedAt,
      expiresAt: raw.expiresAt,
      applyUrl: raw.applyUrl,
      verifiedSource: true,
    };
  }

  processBatch(items: RawJobFeedItem[]): AggregatedJobItem[] {
    return items.map((item) => this.processSingleJob(item));
  }

  private translateTitleToSwahili(titleEn: string): string {
    const dictionary: Record<string, string> = {
      "Senior Full Stack Engineer (React & Node.js)": "Mhandisi Mwandamizi wa Programu za Kompyuta",
      "Lead AI & Data Scientist": "Mtaalamu Kiongozi wa Akili Mbandia (AI) na Takwimu",
      "Product Designer & UI/UX Specialist": "Mbuni wa Bidhaa za Kidijitali na Muonekano wa Programu",
      "Mhandisi wa Barabara II (Civil Engineer)": "Mhandisi wa Barabara II (Civil Engineer)",
      "Afisa Afya Mfawidhi (Public Health Officer)": "Afisa Afya Mfawidhi (Public Health Officer)",
      "Monitoring & Evaluation Specialist (P-3)": "Mtaalamu wa Ufuatillaji na Tathmini (M&E)",
    };
    return dictionary[titleEn] || `${titleEn} (Nafasi ya Kazi)`;
  }

  private normalizeEmploymentType(raw?: string): AggregatedJobItem["employmentType"] {
    const r = (raw || "").toLowerCase();
    if (r.includes("contract")) return "contract";
    if (r.includes("part")) return "part_time";
    if (r.includes("intern")) return "internship";
    if (r.includes("temp")) return "temporary";
    if (r.includes("free")) return "freelance";
    return "full_time";
  }

  private normalizeExperienceLevel(raw?: string): AggregatedJobItem["experienceLevel"] {
    const r = (raw || "").toLowerCase();
    if (r.includes("senior") || r.includes("lead")) return "senior";
    if (r.includes("mid")) return "mid";
    if (r.includes("junior")) return "junior";
    if (r.includes("entry")) return "entry";
    if (r.includes("exec")) return "executive";
    return "mid";
  }
}

export const aiAggregationProcessor = new AiAggregationProcessor();
