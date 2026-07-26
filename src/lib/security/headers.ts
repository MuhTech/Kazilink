/**
 * Enterprise HTTP Security Headers Configuration
 * Applied across TanStack Start server middleware and HTTP responses.
 */

export const ENTERPRISE_SECURITY_HEADERS = {
  // Content Security Policy (CSP)
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
    "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com wss://*.supabase.co",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; "),

  // Strict Transport Security (HSTS)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  // Prevent MIME sniffing
  "X-Content-Type-Options": "nosniff",

  // Prevent Clickjacking frame embedding
  "X-Frame-Options": "SAMEORIGIN",

  // Referrer Policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Browser Permissions Policy
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), payment=()",

  // Cross Origin Opener Policy
  "Cross-Origin-Opener-Policy": "same-origin",
};
