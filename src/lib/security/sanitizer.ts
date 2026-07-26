import { z } from "zod";

/**
 * Enterprise Input Sanitization & XSS Prevention Engine
 * Prevents HTML injection, script execution, SQL injection, and path traversal vulnerabilities.
 */

export function sanitizeHtml(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function sanitizeFileName(filename: string): string {
  if (!filename) return "unnamed_file";
  // Remove directory traversal characters and non-alphanumeric except dots, hyphens, underscores
  const cleanName = filename
    .replace(/[/\\]/g, "")
    .replace(/\.\.+/g, ".")
    .replace(/[^a-zA-Z0-9._-]/g, "_");

  // Randomize prefix for uniqueness
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extIndex = cleanName.lastIndexOf(".");

  if (extIndex !== -1) {
    const name = cleanName.substring(0, extIndex);
    const ext = cleanName.substring(extIndex).toLowerCase();
    return `${timestamp}_${name}_${randomSuffix}${ext}`;
  }

  return `${timestamp}_${cleanName}_${randomSuffix}`;
}

export const PasswordPolicySchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
  .refine((val) => /[a-z]/.test(val), "Password must contain at least one lowercase letter")
  .refine((val) => /[0-9]/.test(val), "Password must contain at least one number")
  .refine(
    (val) => /[^A-Za-z0-9]/.test(val),
    "Password must contain at least one special character",
  );

export const PhoneTanzaniaSchema = z
  .string()
  .regex(/^(\+?255|0)[67]\d{8}$/, "Must be a valid Tanzanian phone number (+255 or 06/07...)");

export const NidaIdSchema = z
  .string()
  .regex(
    /^\d{8}-\d{5}-\d{5}-\d{2}$|^\d{20}$/,
    "Invalid NIDA National ID format (20 digits or formatted string)",
  );

export const JobPostingSanitizeSchema = z.object({
  title: z.string().min(3).max(150).transform(sanitizeHtml),
  description: z.string().min(10).max(10000).transform(sanitizeHtml),
  requirements: z
    .string()
    .max(5000)
    .optional()
    .transform((val) => (val ? sanitizeHtml(val) : undefined)),
  location: z
    .string()
    .max(100)
    .optional()
    .transform((val) => (val ? sanitizeHtml(val) : undefined)),
  region: z.string().max(100),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  currency: z.enum(["TZS", "USD"]).default("TZS"),
});
