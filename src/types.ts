import type { Database } from "./integrations/supabase/types";

// App Roles & Permissions
export type AppRole =
  "super_admin" | "admin" | "moderator" | "employer" | "recruiter" | "job_seeker" | "support";

export interface Permission {
  id: string;
  code: string;
  description: string;
  module: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  granted_by?: string;
  created_at: string;
}

export interface UserDevice {
  id: string;
  user_id: string;
  device_name: string;
  browser?: string;
  os?: string;
  ip_address?: string;
  is_current: boolean;
  last_active_at: string;
  created_at: string;
}

export interface LoginHistoryItem {
  id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  location_estimate?: string;
  status: "success" | "failed" | "locked_out" | "mfa_required";
  failure_reason?: string;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  user_id?: string;
  event_type: string;
  severity: "info" | "warning" | "critical";
  details: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface UserPreferences {
  user_id: string;
  theme: "light" | "dark" | "system";
  email_notifications: boolean;
  sms_notifications: boolean;
  mfa_enabled: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  updated_at: string;
}

export interface AccountVerification {
  id: string;
  user_id: string;
  id_type: "nida" | "passport" | "voter_id" | "driving_license" | "tax_tin";
  id_number: string;
  document_path?: string;
  status: "pending" | "verified" | "rejected";
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

// ---------- AI ECOSYSTEM TYPES ----------

export interface ParsedResume {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  education?: Array<{ institution: string; degree: string; field: string; year?: string }>;
  experience?: Array<{ company: string; role: string; duration?: string; description?: string }>;
  skills?: string[];
  languages?: string[];
  certifications?: string[];
  awards?: string[];
  references?: string[];
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  job_id: string;
  match_score: number;
  breakdown: {
    skills_score: number;
    experience_score: number;
    location_score: number;
    salary_score: number;
  };
  reasons: string[];
  feedback?: "interested" | "dismissed" | "applied";
  job?: any;
}

export interface CandidateRanking {
  id: string;
  job_id: string;
  applicant_id: string;
  overall_score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;
  location_score: number;
  explanation: string;
  applicant?: {
    full_name: string;
    headline: string;
    avatar_path?: string;
    location?: string;
    phone?: string;
  };
}

export interface AICareerChatMessage {
  id: string;
  user_id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  language: "en" | "sw";
  created_at: string;
}

export interface AIFraudFlag {
  id: string;
  entity_type: "job" | "company" | "user" | "application";
  entity_id: string;
  risk_score: number;
  flag_type: string;
  reason: string;
  details: Record<string, unknown>;
  status: "pending" | "approved" | "dismissed";
  created_at: string;
}

export interface AIDuplicateJobFlag {
  id: string;
  job_id: string;
  existing_job_id: string;
  similarity_score: number;
  status: "flagged" | "merged" | "dismissed";
  created_at: string;
  job_title?: string;
  existing_job_title?: string;
}

export interface AIPromptTemplate {
  key: string;
  provider: string;
  model_alias: string;
  template: string;
  description?: string;
  is_active: boolean;
}

export interface AIProviderAdapter {
  name: string;
  parseResume(text: string): Promise<ParsedResume>;
  generateJobRecommendations(profile: any, jobs: any[]): Promise<AIRecommendation[]>;
  rankCandidates(job: any, candidates: any[]): Promise<CandidateRanking[]>;
  careerAssistantChat(
    history: AICareerChatMessage[],
    userMessage: string,
    language: "en" | "sw",
  ): Promise<string>;
  detectJobFraud(jobData: any): Promise<{ riskScore: number; isFraud: boolean; reason: string }>;
  detectDuplicateJob(
    newJob: any,
    existingJobs: any[],
  ): Promise<{ isDuplicate: boolean; score: number; existingJobId?: string }>;
}

// ---------- SEARCH & DISCOVERY TYPES ----------

export type EmploymentType =
  "full_time" | "part_time" | "contract" | "internship" | "temporary" | "freelance";
export type ExperienceLevel = "entry" | "junior" | "mid" | "senior" | "lead" | "executive";

export interface JobSearchFilters {
  q?: string;
  region?: string;
  district?: string;
  userId?: string;
  category?: string;
  type?: EmploymentType;
  experience?: ExperienceLevel;
  remoteOnly?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  postedWithinDays?: number; // 1, 7, 30
  verifiedEmployerOnly?: boolean;
  urgentOnly?: boolean;
  skills?: string[];
  sortBy?: "relevance" | "newest" | "salary_desc" | "salary_asc" | "ai_score";
  page?: number;
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  region?: string;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  is_remote: boolean;
  published_at: string;
  views_count: number;
  applications_count: number;
  company_name?: string;
  company_logo?: string;
  company_verified?: boolean;
  category_name_en?: string;
  category_name_sw?: string;
  skills?: string[];
  ai_score?: number;
}

export interface TanzaniaLocation {
  id: string;
  region: string;
  district: string;
  ward?: string;
  lat?: number;
  lng?: number;
}

export interface SearchSynonym {
  id: string;
  term: string;
  synonyms: string[];
  language: "en" | "sw";
  is_active: boolean;
}

export interface SavedSearchItem {
  id: string;
  user_id: string;
  name: string;
  query_text?: string;
  filters: JobSearchFilters;
  notify_email: boolean;
  created_at: string;
}

export interface SearchProviderAdapter {
  name: string;
  searchJobs(filters: JobSearchFilters): Promise<{ items: SearchResultItem[]; total: number }>;
  getSuggestions(query: string, lang: "en" | "sw"): Promise<string[]>;
}
