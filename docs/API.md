# KaziLink Connect — API & Interface Specification

## 1. Database Schema Specifications

### Core Data Models

- **`profiles`**: User details (full name, phone, headline, bio, location, avatar, language preferences).
- **`user_roles`**: Maps users to roles (`super_admin`, `admin`, `employer`, `recruiter`, `job_seeker`).
- **`companies`**: Employer organizations, verification status (`pending`, `verified`, `rejected`), industry, logo.
- **`jobs`**: Job postings, salary range, employment type, location, region, experience level, status.
- **`applications`**: Job applications, cover letters, resume storage paths, candidate status.
- **`user_preferences`**: MFA settings, notification preferences, phone/email verification states.
- **`account_verifications`**: NIDA national ID / passport number submissions and review status.

---

## 2. AI Provider Adapter Interface (`src/types.ts`)

```typescript
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
```

---

## 3. Search Engine Adapter Interface (`src/types.ts`)

```typescript
export interface SearchProviderAdapter {
  name: string;
  searchJobs(filters: JobSearchFilters): Promise<{ items: SearchResultItem[]; total: number }>;
  getSuggestions(query: string, lang: "en" | "sw"): Promise<string[]>;
}
```

### Search Filter Schema

```typescript
export interface JobSearchFilters {
  q?: string;
  region?: string;
  district?: string;
  category?: string;
  type?: EmploymentType;
  experience?: ExperienceLevel;
  remoteOnly?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  postedWithinDays?: number;
  sortBy?: "relevance" | "newest" | "salary_desc" | "salary_asc" | "ai_score";
  page?: number;
  limit?: number;
}
```
