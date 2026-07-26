-- =========================================================================
-- KaziLink Tanzania — Full Ecosystem Expansion Migration
-- Module 1: Auth & RBAC Security Infrastructure
-- Module 2: AI Ecosystem (Resume Parsing, Recommendations, Skill Matrix, Candidate Ranking, Fraud & Duplicate Detection)
-- Module 3: Advanced Search, Tanzanian Administrative Hierarchy & Analytics
-- =========================================================================

-- ---------- AUTH & RBAC EXPANSION ----------

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  module text not null default 'core',
  created_at timestamptz not null default now()
);
grant select on public.permissions to authenticated;
grant all on public.permissions to service_role;
alter table public.permissions enable row level security;
create policy "Permissions: read authenticated" on public.permissions for select to authenticated using (true);

create table if not exists public.role_permissions (
  role public.app_role not null,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role, permission_id)
);
grant select on public.role_permissions to authenticated;
grant all on public.role_permissions to service_role;
alter table public.role_permissions enable row level security;
create policy "RolePermissions: read authenticated" on public.role_permissions for select to authenticated using (true);

-- User Devices & Active Sessions Tracking
create table if not exists public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_name text not null,
  browser text,
  os text,
  ip_address text,
  is_current boolean default true,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_user_devices_user on public.user_devices(user_id);
grant select, insert, update, delete on public.user_devices to authenticated;
grant all on public.user_devices to service_role;
alter table public.user_devices enable row level security;
create policy "UserDevices: owner manage" on public.user_devices for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Login Audit History
create table if not exists public.login_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  ip_address text,
  user_agent text,
  location_estimate text,
  status text not null check (status in ('success', 'failed', 'locked_out', 'mfa_required')),
  failure_reason text,
  created_at timestamptz not null default now()
);
create index if not exists idx_login_history_user on public.login_history(user_id);
grant select on public.login_history to authenticated;
grant all on public.login_history to service_role;
alter table public.login_history enable row level security;
create policy "LoginHistory: read own or admin" on public.login_history for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- Security & Audit Events
create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);
create index if not exists idx_security_events_user on public.security_events(user_id);
grant select on public.security_events to authenticated;
grant all on public.security_events to service_role;
alter table public.security_events enable row level security;
create policy "SecurityEvents: read own or admin" on public.security_events for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- User Security Preferences & MFA Metadata
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  email_notifications boolean not null default true,
  sms_notifications boolean not null default false,
  mfa_enabled boolean not null default false,
  phone_verified boolean not null default false,
  email_verified boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.user_preferences to authenticated;
grant all on public.user_preferences to service_role;
alter table public.user_preferences enable row level security;
create policy "UserPreferences: owner manage" on public.user_preferences for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- User Verification & NIDA/ID Submissions
create table if not exists public.account_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  id_type text not null check (id_type in ('nida', 'passport', 'voter_id', 'driving_license', 'tax_tin')),
  id_number text not null,
  document_path text,
  status public.verification_status not null default 'pending',
  admin_notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.account_verifications to authenticated;
grant all on public.account_verifications to service_role;
alter table public.account_verifications enable row level security;
create policy "AccountVerifications: owner or admin" on public.account_verifications for all to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()))
  with check (user_id = auth.uid() or public.is_admin(auth.uid()));

-- ---------- AI ECOSYSTEM TABLES ----------

-- Centralized Skills Catalog
create table if not exists public.skills_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null default 'General',
  aliases text[] default '{}',
  created_at timestamptz not null default now()
);
grant select on public.skills_catalog to authenticated;
grant all on public.skills_catalog to service_role;
alter table public.skills_catalog enable row level security;
create policy "SkillsCatalog: read authenticated" on public.skills_catalog for select to authenticated using (true);

-- User Extracted & Verified Skills Matrix
create table if not exists public.user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill text not null,
  proficiency text not null default 'intermediate' check (proficiency in ('beginner', 'intermediate', 'advanced', 'expert')),
  source text not null default 'user_added' check (source in ('user_added', 'ai_extracted', 'assessment_verified')),
  created_at timestamptz not null default now(),
  unique (user_id, skill)
);
grant select, insert, update, delete on public.user_skills to authenticated;
grant all on public.user_skills to service_role;
alter table public.user_skills enable row level security;
create policy "UserSkills: read own or employer" on public.user_skills for select to authenticated using (true);
create policy "UserSkills: write own" on public.user_skills for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Parsed Resumes and AI Profile Extract
create table if not exists public.user_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_path text not null,
  file_name text,
  parsed_data jsonb not null default '{}'::jsonb,
  extracted_skills text[] default '{}',
  parsed_at timestamptz not null default now()
);
grant select, insert, update, delete on public.user_resumes to authenticated;
grant all on public.user_resumes to service_role;
alter table public.user_resumes enable row level security;
create policy "UserResumes: own manage" on public.user_resumes for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- AI Job Recommendation Scores & Explanations
create table if not exists public.ai_recommendation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  match_score numeric(5,2) not null default 0.0,
  breakdown jsonb not null default '{}'::jsonb,
  reasons text[] default '{}',
  feedback text check (feedback in ('interested', 'dismissed', 'applied')),
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);
grant select, insert, update on public.ai_recommendation_logs to authenticated;
grant all on public.ai_recommendation_logs to service_role;
alter table public.ai_recommendation_logs enable row level security;
create policy "AIRecommendations: own read write" on public.ai_recommendation_logs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Candidate Ranking Scores for Employers
create table if not exists public.candidate_rankings (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  overall_score numeric(5,2) not null default 0.0,
  skills_score numeric(5,2) default 0.0,
  experience_score numeric(5,2) default 0.0,
  education_score numeric(5,2) default 0.0,
  location_score numeric(5,2) default 0.0,
  explanation text,
  updated_at timestamptz not null default now(),
  unique (job_id, applicant_id)
);
grant select, insert, update on public.candidate_rankings to authenticated;
grant all on public.candidate_rankings to service_role;
alter table public.candidate_rankings enable row level security;
create policy "CandidateRankings: employer read" on public.candidate_rankings for select to authenticated
  using (exists (select 1 from public.jobs j where j.id = job_id and public.can_manage_company(auth.uid(), j.company_id)) or public.is_admin(auth.uid()));

-- AI Career Assistant Chat Conversations
create table if not exists public.ai_career_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null default gen_random_uuid(),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  language text not null default 'en' check (language in ('en', 'sw')),
  created_at timestamptz not null default now()
);
grant select, insert on public.ai_career_chats to authenticated;
grant all on public.ai_career_chats to service_role;
alter table public.ai_career_chats enable row level security;
create policy "AICareerChats: own manage" on public.ai_career_chats for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- AI Fraud & Scam Detection Logs
create table if not exists public.ai_fraud_flags (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('job', 'company', 'user', 'application')),
  entity_id uuid not null,
  risk_score numeric(5,2) not null default 0.0,
  flag_type text not null,
  reason text not null,
  details jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'dismissed')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
grant select on public.ai_fraud_flags to authenticated;
grant all on public.ai_fraud_flags to service_role;
alter table public.ai_fraud_flags enable row level security;
create policy "AIFraudFlags: admin manage" on public.ai_fraud_flags for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- AI Duplicate Job Postings Flags
create table if not exists public.ai_duplicate_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  existing_job_id uuid not null references public.jobs(id) on delete cascade,
  similarity_score numeric(5,2) not null,
  status text not null default 'flagged' check (status in ('flagged', 'merged', 'dismissed')),
  created_at timestamptz not null default now()
);
grant select on public.ai_duplicate_jobs to authenticated;
grant all on public.ai_duplicate_jobs to service_role;
alter table public.ai_duplicate_jobs enable row level security;
create policy "AIDuplicateJobs: admin manage" on public.ai_duplicate_jobs for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- AI System Prompts & Config
create table if not exists public.ai_prompt_templates (
  key text primary key,
  provider text not null default 'gemini',
  model_alias text not null default 'gemini-2.5-flash',
  template text not null,
  description text,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select on public.ai_prompt_templates to authenticated;
grant all on public.ai_prompt_templates to service_role;
alter table public.ai_prompt_templates enable row level security;
create policy "AIPrompts: admin manage" on public.ai_prompt_templates for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ---------- SEARCH & DISCOVERY TABLES ----------

-- Search History Log
create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  query_text text not null,
  filters jsonb not null default '{}'::jsonb,
  results_count int not null default 0,
  language text default 'en',
  created_at timestamptz not null default now()
);
create index if not exists idx_search_history_query on public.search_history(query_text);
grant select, insert on public.search_history to authenticated;
grant all on public.search_history to service_role;
alter table public.search_history enable row level security;
create policy "SearchHistory: read insert own" on public.search_history for all to authenticated
  using (user_id = auth.uid() or user_id is null) with check (user_id = auth.uid() or user_id is null);

-- User Saved Job Searches & Alert Subscriptions
create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  query_text text,
  filters jsonb not null default '{}'::jsonb,
  notify_email boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.saved_searches to authenticated;
grant all on public.saved_searches to service_role;
alter table public.saved_searches enable row level security;
create policy "SavedSearches: owner manage" on public.saved_searches for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Bilingual Search Synonyms Catalog
create table if not exists public.search_synonyms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  synonyms text[] not null,
  language text not null default 'en' check (language in ('en', 'sw')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.search_synonyms to authenticated;
grant all on public.search_synonyms to service_role;
alter table public.search_synonyms enable row level security;
create policy "SearchSynonyms: read authenticated" on public.search_synonyms for select to authenticated using (true);
create policy "SearchSynonyms: admin manage" on public.search_synonyms for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Trending Job Search Terms
create table if not exists public.trending_searches (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  search_count int not null default 1,
  category text,
  last_searched_at timestamptz not null default now()
);
grant select on public.trending_searches to authenticated;
grant all on public.trending_searches to service_role;
alter table public.trending_searches enable row level security;
create policy "TrendingSearches: read authenticated" on public.trending_searches for select to authenticated using (true);

-- Tanzanian Administrative Locations (Regions, Districts, Wards)
create table if not exists public.tanzania_locations (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  district text not null,
  ward text,
  lat numeric(9,6),
  lng numeric(9,6),
  unique (region, district, ward)
);
grant select on public.tanzania_locations to authenticated;
grant all on public.tanzania_locations to service_role;
alter table public.tanzania_locations enable row level security;
create policy "TanzaniaLocations: read authenticated" on public.tanzania_locations for select to authenticated using (true);

-- Seed Tanzanian Regions & Districts
insert into public.tanzania_locations (region, district, lat, lng) values
  ('Dar es Salaam', 'Kinondoni', -6.7512, 39.2311),
  ('Dar es Salaam', 'Ilala', -6.8252, 39.2731),
  ('Dar es Salaam', 'Temeke', -6.8833, 39.2833),
  ('Dar es Salaam', 'Ubungo', -6.7833, 39.1833),
  ('Dar es Salaam', 'Kigamboni', -6.8500, 39.3167),
  ('Mwanza', 'Nyamagana', -2.5167, 32.9000),
  ('Mwanza', 'Ilemela', -2.4833, 32.9167),
  ('Arusha', 'Arusha City', -3.3667, 36.6833),
  ('Dodoma', 'Dodoma Urban', -6.1731, 35.7419),
  ('Kilimanjaro', 'Moshi Urban', -3.3333, 37.3333),
  ('Tanga', 'Tanga City', -5.0667, 39.1000),
  ('Zanzibar', 'Urban West', -6.1659, 39.1994),
  ('Mbeya', 'Mbeya City', -8.9000, 33.4500),
  ('Morogoro', 'Morogoro Urban', -6.8242, 37.6633)
on conflict do nothing;

-- Seed Initial Search Synonyms (Bilingual English & Kiswahili)
insert into public.search_synonyms (term, synonyms, language) values
  ('driver', array['dereva', 'chauffeur', 'cab driver', 'bus driver'], 'en'),
  ('software engineer', array['mhandisi wa programu', 'developer', 'web developer', 'coder', 'mwanaprogramu'], 'en'),
  ('accountant', array['mhasibu', 'finance officer', 'auditor', 'mhasibu mkuu'], 'en'),
  ('teacher', array['mwalimu', 'tutor', 'instructor', 'lecturer'], 'en'),
  ('nurse', array['muuguzi', 'nurse practitioner', 'medical assistant'], 'en'),
  ('electrician', array['fundi umeme', 'electrical technician', 'engineer'], 'en'),
  ('mechanic', array['fundi mitambo', 'auto technician'], 'en'),
  ('sales manager', array['meneja mauzo', 'sales executive', 'mkuu wa mauzo'], 'en'),
  ('manager', array['meneja', 'mkurugenzi', 'head', 'supervisor'], 'en')
on conflict do nothing;

-- Seed Default AI Prompts
insert into public.ai_prompt_templates (key, provider, template, description) values
  ('resume_parser', 'gemini', 'Extract structured JSON from the candidate resume text with fields: fullName, email, phone, location, education, experience, skills, languages, certifications, summary.', 'Extract resume parameters to profile'),
  ('candidate_ranker', 'gemini', 'Analyze candidate profile vs job description and produce overall match score (0-100), skills score, experience score, education score, location score, and structured breakdown explanation.', 'Ranks candidate fit for employer'),
  ('career_assistant', 'gemini', 'You are KaziLink Career Assistant, an expert AI career advisor for job seekers in Tanzania. Respond concisely and professionally in the user language (English or Swahili).', 'System prompt for career advisor chatbot'),
  ('fraud_detector', 'gemini', 'Analyze job posting title, description, company name, salary range for scam/fraud patterns (e.g. upfront fee requests, suspicious contacts, fake brand impersonation). Return risk score (0-100) and reason.', 'AI job posting safety screening')
on conflict do nothing;
