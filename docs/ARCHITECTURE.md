# KaziLink Connect — System Architecture & Design Documentation

## 1. System Overview

KaziLink Connect is a full-stack job matching, employment discovery, and career development ecosystem built specifically for Tanzania. The platform bridges job seekers, employers, recruiters, and platform administrators through intelligent AI matching, bilingual localization (English & Kiswahili), advanced search algorithms, and high-assurance identity verification (NIDA ID).

---

## 2. Technical Architecture & Tech Stack

```
                                  +---------------------------------------+
                                  |         Client Web Interface          |
                                  | (React 19, Vite, TanStack Router/Query|
                                  |     Tailwind CSS, Lucide Icons)       |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |    TanStack Start Server Engine       |
                                  |  (Server Functions & API Middleware)  |
                                  +----------+-----------------+----------+
                                             |                 |
                       +---------------------+                 +---------------------+
                       v                                                             v
       +---------------+---------------+                             +---------------+---------------+
       |       Supabase Cloud Service  |                             |       Google Gemini AI Engine |
       | (Auth, Storage, Postgres RLS, |                             | (@google/genai, Flash Models, |
       |  Full-Text Search TSVector)   |                             |   Resume Parser, Assistant)   |
       +-------------------------------+                             +-------------------------------+
```

### Core Frontend Stack

- **Framework:** React 19 with Vite & TanStack Start
- **Routing & State:** TanStack Router (type-safe file-based routing) & TanStack Query (React Query v5)
- **Styling:** Tailwind CSS with Radix UI headless primitives
- **Localization:** React Context (`LanguageProvider`) supporting English (`en`) and Kiswahili (`sw`)

---

## 3. Identity & Access Management (IAM) & RBAC Security

### Multi-Tenant Role Hierarchy

- **Super Admin (`super_admin`):** Full system oversight, prompt configuration, audit log review, platform settings.
- **Admin (`admin`):** Employer verification, fraud flag reviews, category management.
- **Moderator (`moderator`):** Content screening and flag management.
- **Employer (`employer`):** Company profile management, job posting, applicant review, candidate AI ranking.
- **Recruiter (`recruiter`):** Agency representation, candidate searching and application tracking.
- **Job Seeker (`job_seeker`):** CV upload, AI profile parsing, job searching, application submission.

### Security Infrastructure

- **Database Row Level Security (RLS):** All database tables enforce strict tenant separation and permission policies.
- **NIDA ID Verification:** Government identity document submission and admin verification status.
- **Active Device Tracking:** Real-time session auditing with global sign-out capabilities.
- **MFA Ready:** Multi-Factor Authentication toggles and phone OTP support.

---

## 4. AI Ecosystem Architecture

The AI module uses the **Provider Adapter Pattern** via `@google/genai`:

- **Resume Parser:** Extracts structured candidate details (skills, education, experience, contact info) from raw CV files/text.
- **Job Recommendation Engine:** Calculates 4-dimensional match scores (Skills, Experience, Location, Salary) between candidate profiles and job postings.
- **Candidate Fit Ranking:** Allows employers to rank applicants for job postings with transparent explanation rationale.
- **Bilingual Career Assistant:** Conversational AI advisor for CV refinement, interview prep, and wage guidance in English and Kiswahili.
- **Fraud & Scam Shield:** Real-time screening of job postings for upfront fee scams and suspicious employer registrations.

---

## 5. Enterprise Search & Discovery Engine

The search architecture abstracts query processing through the **Search Provider Adapter Pattern**:

- **Default Adapter:** `PostgresSearchAdapter` leveraging PostgreSQL `tsvector` full-text search with `ilike` fallbacks.
- **Bilingual Synonyms Dictionary:** Maps Kiswahili terms to English equivalents (e.g., _mhasibu_ → _accountant_, _dereva_ → _driver_).
- **Tanzanian Regional Administrative Hierarchy:** Standardized location filtering across all 26+ mainland and island regions (Dar es Salaam, Mwanza, Arusha, Dodoma, Kilimanjaro, Tanga, Zanzibar, etc.).
- **Saved Search Alerts:** Enables candidates to save complex query parameters and receive notification alerts.
