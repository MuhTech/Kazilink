# KaziLink Tanzania — Enterprise Security Architecture & Governance

## 1. Executive Summary

KaziLink Tanzania is an enterprise-grade AI-powered job matching and career ecosystem designed to operate with zero-trust principles, robust identity assurance, multi-tenant data segregation, and automated threat mitigation.

This document details the complete end-to-end security model encompassing Database Row Level Security (RLS), Role-Based Access Control (RBAC), input sanitization, secure file uploads, rate bucket throttling, and audit logging.

---

## 2. Role-Based Access Control (RBAC) & Permissions Matrix

### Supported Platform Roles

1. **Super Admin (`super_admin`):** Complete system authority, role delegation, security policy enforcement, disaster recovery triggers.
2. **Admin (`admin`):** Employer verification, platform settings, fraud/scam alert resolution, audit review.
3. **Moderator (`moderator`):** Job post screening, employer flag review.
4. **Employer (`employer`):** Company profile management, job posting, applicant AI ranking, direct messaging.
5. **Recruiter (`recruiter`):** Staffing agency candidate sourcing, application pipeline oversight.
6. **Job Seeker (`job_seeker`):** CV upload, AI profile parsing, job searching, NIDA ID verification, application tracking.
7. **Customer Support (`customer_support`):** Read-only candidate/employer verification status lookup.

### Role Permissions Matrix

| Role            | View Jobs | Apply Jobs | Post Jobs | Rank Candidates | Manage Users | System Settings | Audit Logs |
| :-------------- | :-------: | :--------: | :-------: | :-------------: | :----------: | :-------------: | :--------: |
| **Job Seeker**  |    ✅     |     ✅     |    ❌     |       ❌        |      ❌      |       ❌        |     ❌     |
| **Employer**    |    ✅     |     ❌     |    ✅     |       ✅        |      ❌      |       ❌        |     ❌     |
| **Recruiter**   |    ✅     |     ❌     |    ✅     |       ✅        |      ❌      |       ❌        |     ❌     |
| **Moderator**   |    ✅     |     ❌     | 🔍 Review |       ❌        |      ❌      |       ❌        |  🔍 View   |
| **Admin**       |    ✅     |     ❌     |    ✅     |       ✅        |      ✅      |       ✅        |     ✅     |
| **Super Admin** |    ✅     |     ✅     |    ✅     |       ✅        |      ✅      |       ✅        |     ✅     |

---

## 3. Database Row Level Security (RLS) & Isolation

All 14 PostgreSQL tables enforce strict tenant segregation via Supabase Row Level Security policies.

### Core RLS Policies Overview

- **`profiles`**:
  - `SELECT`: Public read for public profiles; full read for profile owner and admins.
  - `UPDATE`: Allowed only if `auth.uid() = user_id`.
- **`jobs`**:
  - `SELECT`: Public read for published jobs (`status = 'published'`).
  - `INSERT / UPDATE / DELETE`: Allowed for job author or employer associated with `company_id`.
- **`applications`**:
  - `SELECT`: Allowed for applicant (`auth.uid() = applicant_id`) or job owner (`employer`).
  - `INSERT`: Allowed for authenticated `job_seeker`.
- **`user_roles`**:
  - `SELECT`: Read own role or admin lookup.
  - `INSERT / UPDATE / DELETE`: Restricted exclusively to `admin` and `super_admin`.
- **`audit_logs` & `security_alerts`**:
  - `INSERT`: Authenticated system triggers & audit log utility.
  - `SELECT`: Restricted to `admin` and `super_admin`.

---

## 4. Input Security & OWASP Top 10 Protections

### Injection Mitigations

- **SQL Injection (SQLi):** Eliminated via Supabase parameter binding and TypeScript ORM query abstractions.
- **Cross-Site Scripting (XSS):** Handled via `sanitizeHtml()` escaping, React JSX automatic string escaping, and strict CSP headers.
- **Path Traversal:** Filenames sanitized using `sanitizeFileName()`, removing directory separators and randomizing suffixes.
- **CSRF Strategy:** Protected via SameSite cookie directives (`SameSite=Lax/Strict`) and CORS whitelist policies.

### OWASP Top 10 Compliance Verification

1. **A01:2021-Broken Access Control:** Enforced via RLS and server-side RBAC token verification.
2. **A02:2021-Cryptographic Failures:** TLS 1.3 in transit, AES-256 for Supabase Storage objects and Database backups.
3. **A03:2021-Injection:** Zod validation + parameter binding + HTML entity encoding.
4. **A04:2021-Insecure Design:** Token bucket rate limiting + NIDA government ID verification flow.
5. **A05:2021-Security Misconfiguration:** Strict CSP, HSTS, X-Content-Type-Options headers.
6. **A06:2021-Vulnerable and Outdated Components:** Dependabot & lockfile version pinning.
7. **A07:2021-Identification & Authentication Failures:** Automatic lockout, session tracking, device auditing.
8. **A08:2021-Software and Data Integrity Failures:** Signed package dependencies and strict file header magic byte validation.
9. **A09:2021-Security Logging & Monitoring:** Tamper-evident centralized `audit_logs` and `security_alerts`.
10. **A10:2021-Server-Side Request Forgery (SSRF):** Whitelisted outbound domains for AI and Supabase API calls.

---

## 5. File Upload Security Specifications

1. **MIME Type & Extension Whitelisting**: CVs (`.pdf`, `.doc`, `.docx`, `.txt`), Logos/Avatars (`.png`, `.jpg`, `.jpeg`, `.webp`).
2. **Magic Bytes Verification**: Inspects file header signatures (e.g. `%PDF`, `PNG` bytes) prior to bucket write.
3. **Size Constraints**: CVs capped at 5MB; Avatars and logos capped at 3MB.
4. **Filename Randomization**: Strips original directory structure and appends high-entropy timestamps.
5. **Storage Isolation**: Uploaded CVs stored in private Supabase buckets accessible only via time-limited signed URLs.

---

## 6. Rate Limiting Architecture

Token bucket rate limiting is applied across high-value actions:

- **Authentication (`login`)**: 5 attempts per 15 minutes per IP/email.
- **Registration (`register`)**: 3 accounts per hour.
- **OTP Requests (`otp`)**: 3 requests per 5 minutes.
- **Search Queries (`search`)**: 60 requests per minute.
- **AI Endpoints (`ai_request`)**: 15 requests per minute.
- **File Uploads (`file_upload`)**: 10 uploads per minute.
