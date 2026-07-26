
-- =========================================================================
-- KaziLink Tanzania — Core schema
-- =========================================================================

-- ---------- ENUMS ----------
create type public.app_role as enum (
  'super_admin','admin','moderator','employer','recruiter','job_seeker','support'
);
create type public.verification_status as enum ('pending','verified','rejected');
create type public.employment_type as enum (
  'full_time','part_time','contract','internship','temporary','freelance'
);
create type public.experience_level as enum ('entry','junior','mid','senior','lead','executive');
create type public.job_status as enum ('draft','published','closed','archived');
create type public.application_status as enum (
  'submitted','reviewing','shortlisted','interview','offered','hired','rejected','withdrawn'
);
create type public.language_code as enum ('en','sw');

-- ---------- SHARED FUNCTIONS ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- PROFILES ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_path text,
  preferred_language public.language_code not null default 'en',
  bio text,
  location text,
  headline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- USER ROLES ----------
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('super_admin','admin')
  )
$$;

-- Profiles policies
create policy "Profiles: read own or admin" on public.profiles for select
  to authenticated using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "Profiles: insert own" on public.profiles for insert
  to authenticated with check (auth.uid() = id);
create policy "Profiles: update own or admin" on public.profiles for update
  to authenticated using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

-- User roles policies
create policy "Roles: read own or admin" on public.user_roles for select
  to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()));
create policy "Roles: admin insert" on public.user_roles for insert
  to authenticated with check (public.is_admin(auth.uid()));
create policy "Roles: admin update" on public.user_roles for update
  to authenticated using (public.is_admin(auth.uid()));
create policy "Roles: admin delete" on public.user_roles for delete
  to authenticated using (public.is_admin(auth.uid()));

-- ---------- NEW USER TRIGGER ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce((new.raw_user_meta_data->>'preferred_language')::public.language_code, 'en')
  ) on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'job_seeker'::public.app_role)
  ) on conflict (user_id, role) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- COMPANIES ----------
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  industry text,
  company_size text,
  website text,
  email text,
  phone text,
  location text,
  region text,
  logo_path text,
  verification_status public.verification_status not null default 'pending',
  verification_notes text,
  verified_at timestamptz,
  verified_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index companies_owner_idx on public.companies(owner_id);
create index companies_verified_idx on public.companies(verification_status);
grant select, insert, update, delete on public.companies to authenticated;
grant all on public.companies to service_role;
alter table public.companies enable row level security;
create trigger trg_companies_updated before update on public.companies
  for each row execute function public.set_updated_at();

-- ---------- COMPANY MEMBERS ----------
create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'recruiter',
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);
create index company_members_user_idx on public.company_members(user_id);
grant select, insert, update, delete on public.company_members to authenticated;
grant all on public.company_members to service_role;
alter table public.company_members enable row level security;

create or replace function public.can_manage_company(_user_id uuid, _company_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.companies c
    where c.id = _company_id and c.owner_id = _user_id
  ) or exists (
    select 1 from public.company_members m
    where m.company_id = _company_id and m.user_id = _user_id
  ) or public.is_admin(_user_id)
$$;

-- Companies policies
create policy "Companies: read verified or own or admin" on public.companies for select
  to authenticated using (
    verification_status = 'verified'
    or owner_id = auth.uid()
    or public.can_manage_company(auth.uid(), id)
    or public.is_admin(auth.uid())
  );
create policy "Companies: insert own" on public.companies for insert
  to authenticated with check (owner_id = auth.uid());
create policy "Companies: update owner or admin" on public.companies for update
  to authenticated using (owner_id = auth.uid() or public.is_admin(auth.uid()))
  with check (owner_id = auth.uid() or public.is_admin(auth.uid()));
create policy "Companies: delete owner or admin" on public.companies for delete
  to authenticated using (owner_id = auth.uid() or public.is_admin(auth.uid()));

-- Company members policies
create policy "Members: read if manage" on public.company_members for select
  to authenticated using (public.can_manage_company(auth.uid(), company_id));
create policy "Members: owner insert" on public.company_members for insert
  to authenticated with check (
    exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid())
    or public.is_admin(auth.uid())
  );
create policy "Members: owner update" on public.company_members for update
  to authenticated using (
    exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid())
    or public.is_admin(auth.uid())
  );
create policy "Members: owner delete" on public.company_members for delete
  to authenticated using (
    exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid())
    or public.is_admin(auth.uid())
  );

-- ---------- JOB CATEGORIES ----------
create table public.job_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_sw text not null,
  description_en text,
  description_sw text,
  icon text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.job_categories to authenticated;
grant insert, update, delete on public.job_categories to authenticated;
grant all on public.job_categories to service_role;
alter table public.job_categories enable row level security;

create policy "Categories: read active" on public.job_categories for select
  to authenticated using (active or public.is_admin(auth.uid()));
create policy "Categories: admin write" on public.job_categories for insert
  to authenticated with check (public.is_admin(auth.uid()));
create policy "Categories: admin update" on public.job_categories for update
  to authenticated using (public.is_admin(auth.uid()));
create policy "Categories: admin delete" on public.job_categories for delete
  to authenticated using (public.is_admin(auth.uid()));

-- ---------- JOBS ----------
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category_id uuid references public.job_categories(id) on delete set null,
  posted_by uuid not null references auth.users(id),
  title text not null,
  slug text not null unique,
  description text not null,
  requirements text,
  responsibilities text,
  location text,
  region text,
  employment_type public.employment_type not null default 'full_time',
  experience_level public.experience_level not null default 'mid',
  salary_min numeric(14,2),
  salary_max numeric(14,2),
  currency text not null default 'TZS',
  is_remote boolean not null default false,
  application_deadline date,
  status public.job_status not null default 'draft',
  published_at timestamptz,
  views_count int not null default 0,
  applications_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index jobs_status_idx on public.jobs(status);
create index jobs_company_idx on public.jobs(company_id);
create index jobs_category_idx on public.jobs(category_id);
create index jobs_published_idx on public.jobs(published_at desc);
create index jobs_search_idx on public.jobs using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(requirements,'')));
grant select, insert, update, delete on public.jobs to authenticated;
grant all on public.jobs to service_role;
alter table public.jobs enable row level security;
create trigger trg_jobs_updated before update on public.jobs
  for each row execute function public.set_updated_at();

create policy "Jobs: read published or manage" on public.jobs for select
  to authenticated using (
    (status = 'published' and (application_deadline is null or application_deadline >= current_date))
    or public.can_manage_company(auth.uid(), company_id)
  );
create policy "Jobs: insert if manage company" on public.jobs for insert
  to authenticated with check (
    public.can_manage_company(auth.uid(), company_id) and posted_by = auth.uid()
  );
create policy "Jobs: update if manage" on public.jobs for update
  to authenticated using (public.can_manage_company(auth.uid(), company_id))
  with check (public.can_manage_company(auth.uid(), company_id));
create policy "Jobs: delete if manage" on public.jobs for delete
  to authenticated using (public.can_manage_company(auth.uid(), company_id));

-- ---------- JOB SKILLS ----------
create table public.job_skills (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  skill text not null,
  unique (job_id, skill)
);
create index job_skills_job_idx on public.job_skills(job_id);
grant select, insert, update, delete on public.job_skills to authenticated;
grant all on public.job_skills to service_role;
alter table public.job_skills enable row level security;
create policy "JobSkills: read" on public.job_skills for select
  to authenticated using (
    exists (select 1 from public.jobs j where j.id = job_id
      and (j.status = 'published' or public.can_manage_company(auth.uid(), j.company_id)))
  );
create policy "JobSkills: manage" on public.job_skills for all
  to authenticated using (
    exists (select 1 from public.jobs j where j.id = job_id and public.can_manage_company(auth.uid(), j.company_id))
  ) with check (
    exists (select 1 from public.jobs j where j.id = job_id and public.can_manage_company(auth.uid(), j.company_id))
  );

-- ---------- APPLICATIONS ----------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  cover_letter text,
  resume_path text,
  status public.application_status not null default 'submitted',
  employer_notes text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, applicant_id)
);
create index applications_job_idx on public.applications(job_id);
create index applications_applicant_idx on public.applications(applicant_id);
create index applications_status_idx on public.applications(status);
grant select, insert, update, delete on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;
create trigger trg_applications_updated before update on public.applications
  for each row execute function public.set_updated_at();

create policy "Applications: read own or employer" on public.applications for select
  to authenticated using (
    applicant_id = auth.uid()
    or exists (select 1 from public.jobs j where j.id = job_id and public.can_manage_company(auth.uid(), j.company_id))
  );
create policy "Applications: applicant insert" on public.applications for insert
  to authenticated with check (
    applicant_id = auth.uid()
    and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'published')
  );
create policy "Applications: applicant withdraw or employer update" on public.applications for update
  to authenticated using (
    applicant_id = auth.uid()
    or exists (select 1 from public.jobs j where j.id = job_id and public.can_manage_company(auth.uid(), j.company_id))
  ) with check (
    applicant_id = auth.uid()
    or exists (select 1 from public.jobs j where j.id = job_id and public.can_manage_company(auth.uid(), j.company_id))
  );

-- Increment applications_count trigger
create or replace function public.bump_applications_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.jobs set applications_count = applications_count + 1 where id = new.job_id;
  elsif tg_op = 'DELETE' then
    update public.jobs set applications_count = greatest(applications_count - 1, 0) where id = old.job_id;
  end if;
  return null;
end $$;
create trigger trg_applications_count
  after insert or delete on public.applications
  for each row execute function public.bump_applications_count();

-- ---------- SAVED JOBS ----------
create table public.saved_jobs (
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, job_id)
);
grant select, insert, delete on public.saved_jobs to authenticated;
grant all on public.saved_jobs to service_role;
alter table public.saved_jobs enable row level security;
create policy "Saved: own" on public.saved_jobs for select
  to authenticated using (user_id = auth.uid());
create policy "Saved: insert own" on public.saved_jobs for insert
  to authenticated with check (user_id = auth.uid());
create policy "Saved: delete own" on public.saved_jobs for delete
  to authenticated using (user_id = auth.uid());

-- ---------- AUDIT LOGS ----------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index audit_actor_idx on public.audit_logs(actor_id);
create index audit_created_idx on public.audit_logs(created_at desc);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "Audit: admin read" on public.audit_logs for select
  to authenticated using (public.is_admin(auth.uid()));

-- ---------- APP SETTINGS ----------
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
grant select on public.app_settings to authenticated;
grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;
create policy "Settings: read" on public.app_settings for select
  to authenticated using (true);
create policy "Settings: admin write" on public.app_settings for insert
  to authenticated with check (public.is_admin(auth.uid()));
create policy "Settings: admin update" on public.app_settings for update
  to authenticated using (public.is_admin(auth.uid()));

insert into public.app_settings (key, value) values
  ('premium_features_enabled', 'false'::jsonb),
  ('subscriptions_enabled', 'false'::jsonb),
  ('payments_enabled', 'false'::jsonb),
  ('ai_matching_enabled', 'false'::jsonb);

-- ---------- SEED JOB CATEGORIES ----------
insert into public.job_categories (slug, name_en, name_sw, description_en, description_sw, sort_order) values
  ('technology','Technology','Teknolojia','Software, IT and engineering roles','Nafasi za programu, IT na uhandisi',1),
  ('finance','Finance & Banking','Fedha na Benki','Accounting, banking and finance','Uhasibu, benki na fedha',2),
  ('healthcare','Healthcare','Afya','Medical and health services','Huduma za matibabu na afya',3),
  ('education','Education','Elimu','Teaching and training','Ualimu na mafunzo',4),
  ('agriculture','Agriculture','Kilimo','Farming and agribusiness','Kilimo na biashara ya kilimo',5),
  ('construction','Construction','Ujenzi','Building and civil works','Ujenzi na kazi za kiraia',6),
  ('hospitality','Hospitality & Tourism','Ukaribishaji na Utalii','Hotels, restaurants and tourism','Hoteli, migahawa na utalii',7),
  ('sales','Sales & Marketing','Mauzo na Uuzaji','Sales, marketing and business development','Mauzo, uuzaji na maendeleo ya biashara',8),
  ('logistics','Logistics & Transport','Usafirishaji','Transport, warehousing and supply chain','Usafirishaji, ghala na mnyororo wa ugavi',9),
  ('ngo','NGO & Non-Profit','Mashirika Yasiyo ya Kiserikali','Development and humanitarian roles','Nafasi za maendeleo na kibinadamu',10),
  ('government','Government & Public Sector','Serikali na Sekta ya Umma','Public sector roles','Nafasi za sekta ya umma',11),
  ('other','Other','Nyinginezo','Other opportunities','Fursa nyinginezo',99);

-- ---------- STORAGE POLICIES ----------
-- Path convention: {owner_uid}/filename for avatars, resumes, verification-docs
--                  {company_id}/filename for company-logos (owner_id column on companies checked via join)

-- Avatars: owner-scoped
create policy "avatars: read own or admin" on storage.objects for select to authenticated using (
  bucket_id = 'avatars' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin(auth.uid())
  )
);
create policy "avatars: write own" on storage.objects for insert to authenticated with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "avatars: update own" on storage.objects for update to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "avatars: delete own" on storage.objects for delete to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);

-- Company logos: company owner or member
create policy "logos: read authenticated" on storage.objects for select to authenticated using (
  bucket_id = 'company-logos'
);
create policy "logos: write if manage" on storage.objects for insert to authenticated with check (
  bucket_id = 'company-logos'
  and public.can_manage_company(auth.uid(), ((storage.foldername(name))[1])::uuid)
);
create policy "logos: update if manage" on storage.objects for update to authenticated using (
  bucket_id = 'company-logos'
  and public.can_manage_company(auth.uid(), ((storage.foldername(name))[1])::uuid)
);
create policy "logos: delete if manage" on storage.objects for delete to authenticated using (
  bucket_id = 'company-logos'
  and public.can_manage_company(auth.uid(), ((storage.foldername(name))[1])::uuid)
);

-- Resumes: applicant own; employers read via server function (service role)
create policy "resumes: read own" on storage.objects for select to authenticated using (
  bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "resumes: write own" on storage.objects for insert to authenticated with check (
  bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "resumes: update own" on storage.objects for update to authenticated using (
  bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "resumes: delete own" on storage.objects for delete to authenticated using (
  bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text
);

-- Verification docs: company owner writes; admin reads
create policy "verif: owner read" on storage.objects for select to authenticated using (
  bucket_id = 'verification-docs' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin(auth.uid())
  )
);
create policy "verif: owner write" on storage.objects for insert to authenticated with check (
  bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "verif: owner update" on storage.objects for update to authenticated using (
  bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "verif: owner delete" on storage.objects for delete to authenticated using (
  bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text
);
