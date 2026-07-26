/**
 * Enterprise Token Bucket Rate Limiting Engine
 * Enforces configurable thresholds for authentication, searching, file uploads, and AI endpoints.
 */

export interface RateLimitConfig {
  key: string;
  maxRequests: number;
  windowMs: number;
}

interface Bucket {
  tokens: number;
  lastRefill: number;
}

class MemoryRateLimiter {
  private buckets = new Map<string, Bucket>();

  public DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
    login: { key: "login", maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
    register: { key: "register", maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 registrations per hour
    otp: { key: "otp", maxRequests: 3, windowMs: 5 * 60 * 1000 }, // 3 OTP requests per 5 min
    passwordReset: { key: "password_reset", maxRequests: 3, windowMs: 30 * 60 * 1000 },
    search: { key: "search", maxRequests: 60, windowMs: 60 * 1000 }, // 60 queries per min
    jobApplication: { key: "job_application", maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 applications per hour
    aiRequest: { key: "ai_request", maxRequests: 15, windowMs: 60 * 1000 }, // 15 AI requests per min
    fileUpload: { key: "file_upload", maxRequests: 10, windowMs: 60 * 1000 }, // 10 uploads per min
  };

  /**
   * Checks if an action is allowed for an identifier (e.g. IP or User ID)
   */
  public checkLimit(
    action: keyof typeof this.DEFAULT_CONFIGS,
    identifier: string,
  ): {
    allowed: boolean;
    remaining: number;
    resetMs: number;
  } {
    const config = this.DEFAULT_CONFIGS[action];
    if (!config) {
      return { allowed: true, remaining: 100, resetMs: 0 };
    }

    const bucketKey = `${action}:${identifier}`;
    const now = Date.now();
    let bucket = this.buckets.get(bucketKey);

    if (!bucket) {
      bucket = {
        tokens: config.maxRequests,
        lastRefill: now,
      };
      this.buckets.set(bucketKey, bucket);
    }

    // Refill tokens based on elapsed time
    const timeElapsed = now - bucket.lastRefill;
    if (timeElapsed >= config.windowMs) {
      bucket.tokens = config.maxRequests;
      bucket.lastRefill = now;
    }

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        remaining: bucket.tokens,
        resetMs: config.windowMs - (now - bucket.lastRefill),
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetMs: config.windowMs - (now - bucket.lastRefill),
    };
  }

  public resetLimit(action: keyof typeof this.DEFAULT_CONFIGS, identifier: string): void {
    const bucketKey = `${action}:${identifier}`;
    this.buckets.delete(bucketKey);
  }
}

export const rateLimiter = new MemoryRateLimiter();
