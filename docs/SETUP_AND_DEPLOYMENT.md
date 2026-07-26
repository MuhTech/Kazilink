# KaziLink Connect — Setup & Deployment Guide

## 1. Environment Configuration

Copy `.env.example` to `.env` and fill in required keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Provider Configuration
GEMINI_API_KEY=your-gemini-api-key
```

---

## 2. Database Migration Execution

Execute the consolidated migration against your Supabase instance:

```bash
npx supabase db push
# Or run migration directly in Supabase SQL Editor:
# supabase/migrations/20260722170000_kazilink_full_ecosystem.sql
```

This sets up:

- Complete database schema & Row Level Security (RLS) policies
- Role-based permissions matrix
- AI ecosystem tables & prompt templates
- Enterprise search tsvector full-text indices and Tanzanian location seed data

---

## 3. Local Development

Install dependencies and boot the development server on Port 3000:

```bash
bun install
bun run dev
```

The applet runs on `http://localhost:3000`.

---

## 4. Production Build & Deployment

Build the standalone application bundle:

```bash
bun run build
bun run start
```
