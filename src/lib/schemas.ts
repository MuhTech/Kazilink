import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2).max(120),
  role: z.enum(["job_seeker", "employer"]),
});

export const profileSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  headline: z.string().trim().max(160).optional().or(z.literal("")),
  preferred_language: z.enum(["en", "sw"]),
});

export const companySchema = z.object({
  name: z.string().trim().min(2).max(160),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  company_size: z.string().trim().max(40).optional().or(z.literal("")),
  website: z.string().trim().url().max(255).optional().or(z.literal("")),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  region: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
});

export const jobSchema = z.object({
  company_id: z.string().uuid(),
  category_id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(4).max(160),
  description: z.string().trim().min(20).max(10000),
  requirements: z.string().trim().max(6000).optional().or(z.literal("")),
  responsibilities: z.string().trim().max(6000).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  region: z.string().trim().max(80).optional().or(z.literal("")),
  employment_type: z.enum([
    "full_time",
    "part_time",
    "contract",
    "internship",
    "temporary",
    "freelance",
  ]),
  experience_level: z.enum(["entry", "junior", "mid", "senior", "lead", "executive"]),
  salary_min: z.number().nonnegative().optional().nullable(),
  salary_max: z.number().nonnegative().optional().nullable(),
  is_remote: z.boolean(),
  application_deadline: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "closed", "archived"]),
  skills: z.string().trim().max(500).optional().or(z.literal("")),
});

export const applicationSchema = z.object({
  job_id: z.string().uuid(),
  cover_letter: z.string().trim().max(4000).optional().or(z.literal("")),
});

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}
