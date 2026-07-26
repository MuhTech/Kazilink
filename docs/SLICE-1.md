# KaziLink Tanzania — Vertical Slice 1

Production foundation for the platform: schema, RLS, roles, storage,
authentication (email + Google), profile, employer/company workflow,
job categories, job posting, search, detail, application, applicant
management, admin verification, i18n (EN/SW), and monetization toggles.

## Stack

- TanStack Start (React 19, Vite, SSR)
- Lovable Cloud (Supabase Postgres + Auth + Storage) with RLS on every table
- TanStack Query for data fetching
- Zod for validation
- shadcn/ui + Tailwind v4 (semantic tokens in `src/styles.css`)
- Bilingual (English / Kiswahili) via `src/lib/i18n.tsx`

## Database schema

- `profiles` – user profile (linked 1:1 to `auth.users`)
- `user_roles` – RBAC: super_admin, admin, moderator, employer, recruiter, job_seeker, support
- `companies` – with `pending / verified / rejected` verification workflow
- `company_members` – recruiters attached to a company
- `job_categories` – bilingual EN/SW seed (12 categories)
- `jobs` – `draft / published / closed / archived`, GIN full-text index
- `job_skills` – tags per job
- `applications` – full pipeline (`submitted → reviewing → shortlisted → interview → offered → hired / rejected / withdrawn`)
- `saved_jobs` – bookmarks
- `audit_logs` – security & activity trail
- `app_settings` – premium / subscriptions / payments / AI toggles (all off by default)

Security-definer helpers: `public.has_role`, `public.is_admin`, `public.can_manage_company` — avoid RLS recursion. `handle_new_user()` seeds `profiles` + default `job_seeker` role on signup.

## Storage buckets

All private, owner-scoped RLS on `storage.objects`:

- `avatars/{uid}/*`
- `company-logos/{company_id}/*` (owner or member writes)
- `resumes/{uid}/*` (owner writes; employers get 60-second signed URLs)
- `verification-docs/{uid}/*` (owner writes; admin reads)

## Roles & access

| Role                 | Sees                               | Can do                                                                |
| -------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| Job Seeker (default) | Published jobs, verified companies | Apply, save, manage profile                                           |
| Employer             | + own companies/jobs/applicants    | Create companies, post jobs, review applicants                        |
| Recruiter            | Company they're linked to          | Post jobs & review applicants for that company                        |
| Admin / Super Admin  | Everything                         | Verify companies, manage categories, toggle settings, read audit logs |

Roles are stored in `user_roles` (never on profile). Never grant admin via client-side flag.

## Routes

Public: `/`, `/jobs`, `/jobs/$slug`, `/auth`
Auth-gated (`_authenticated/`): `/dashboard`, `/profile`, `/applications`, `/employer/companies`, `/employer/jobs`, `/employer/jobs/$id/applicants`, `/admin`

## Payments / premium (stubs on, features off)

`app_settings` rows control platform toggles. `premium_features_enabled`, `subscriptions_enabled`, `payments_enabled`, `ai_matching_enabled` all default `false`. Admin can flip them from `/admin` without a code change. Implementation of the M-Pesa / Airtel / card providers ships in Vertical Slice 4 behind these flags.

## Verification checklist

- [x] Schema + enums + triggers + RLS + grants
- [x] Storage buckets + object policies
- [x] Email/password + Google OAuth via Lovable managed OAuth
- [x] RBAC helpers and RLS gates
- [x] Profile CRUD
- [x] Company creation + verification workflow
- [x] Job CRUD (draft/publish)
- [x] Public job search + filters + detail
- [x] Applications (apply, resume upload, applicant review)
- [x] Admin panel (verify + settings)
- [x] Bilingual EN/SW throughout
- [x] Audit logging on verification actions

## How to become an admin (first-time setup)

1. Sign up as a normal user.
2. In the Lovable Cloud **Users** view, find your user ID.
3. Insert into `user_roles`: `(user_id, 'admin')`. From then on the admin panel is available at `/admin` and you can grant additional admin/moderator roles from the UI.
