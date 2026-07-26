export type ConnectorType =
  | "linkedin"
  | "indeed"
  | "google_jobs"
  | "remote_ok"
  | "we_work_remotely"
  | "wellfound"
  | "career_pages"
  | "government_portal"
  | "ngo_portal"
  | "university_portal"
  | "direct_employer"
  | "ats_greenhouse_lever";

export type ConnectorStatus = "active" | "paused" | "error" | "maintenance";

export interface ConnectorConfig {
  id: string;
  name: string;
  type: ConnectorType;
  category: "API" | "RSS" | "StructuredData" | "ATS" | "PartnerFeed";
  description: string;
  endpointUrl: string;
  apiKeyRequired: boolean;
  status: ConnectorStatus;
  enabled: boolean;
  syncIntervalMinutes: number;
  lastSyncAt?: string;
  nextSyncAt?: string;
  totalJobsImported: number;
  failedImportsCount: number;
  avgAiConfidence: number; // 0-100%
  countryFocus: string; // "Global", "Tanzania", "East Africa", "USA", "Europe"
  rateLimitPerMin: number;
}

export interface RawJobFeedItem {
  externalId: string;
  sourceConnectorId: string;
  sourceName: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  locationRaw: string;
  country?: string;
  region?: string;
  city?: string;
  lat?: number;
  lng?: number;
  description: string;
  requirements?: string;
  employmentTypeRaw?: string;
  experienceLevelRaw?: string;
  salaryMinRaw?: number;
  salaryMaxRaw?: number;
  currencyRaw?: string;
  isRemote?: boolean;
  applyUrl: string;
  postedAt: string;
  expiresAt?: string;
  rawJson?: Record<string, unknown>;
}

export interface AggregatedJobItem {
  id: string;
  externalId: string;
  sourceConnectorId: string;
  sourceName: string;
  titleEn: string;
  titleSw: string;
  normalizedTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  descriptionEn: string;
  descriptionSw: string;
  location: string;
  country: string;
  region: string;
  city: string;
  lat: number;
  lng: number;
  employmentType: "full_time" | "part_time" | "contract" | "internship" | "temporary" | "freelance";
  experienceLevel: "entry" | "junior" | "mid" | "senior" | "lead" | "executive";
  salaryMinTzs: number;
  salaryMaxTzs: number;
  salaryMinUsd: number;
  salaryMaxUsd: number;
  displaySalary: string;
  originalCurrency: string;
  isRemote: boolean;
  skills: string[];
  category: string;
  qualityScore: number; // 0 - 100
  aiRelevanceScore: number; // 0 - 100
  fraudRiskScore: number; // 0 - 100
  isFraudFlagged: boolean;
  isDuplicate: boolean;
  duplicateOfId?: string;
  postedAt: string;
  expiresAt?: string;
  applyUrl: string;
  verifiedSource: boolean;
}

export interface SyncLogEntry {
  id: string;
  connectorId: string;
  connectorName: string;
  timestamp: string;
  status: "success" | "partial" | "failed";
  jobsFetched: number;
  jobsImported: number;
  duplicatesFound: number;
  fraudFlagged: number;
  errorMessage?: string;
  executionTimeMs: number;
}

export interface ConnectorAdapter {
  config: ConnectorConfig;
  fetchJobs(): Promise<RawJobFeedItem[]>;
  testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }>;
}
