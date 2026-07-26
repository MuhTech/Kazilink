import { describe, it, expect, vi } from "vitest";
import { sanitizeHtml, sanitizeFileName, PasswordPolicySchema } from "@/lib/security/sanitizer";
import { rateLimiter } from "@/lib/security/rate-limiter";
import { validateFileUpload } from "@/lib/security/file-scanner";
import { AuditLogger } from "@/lib/security/audit-logger";

describe("Enterprise Security & Input Protection Suite", () => {
  it("should sanitize malicious script tags and HTML injection", () => {
    const maliciousInput = '<script>alert("XSS Attack")</script><img src=x onerror=alert(1)>';
    const cleanOutput = sanitizeHtml(maliciousInput);

    expect(cleanOutput).not.toContain("<script>");
    expect(cleanOutput).not.toContain("</script>");
    expect(cleanOutput).toContain("&lt;script&gt;");
    expect(cleanOutput).toContain("&lt;img");
  });

  it("should sanitize file names preventing path traversal attacks", () => {
    const maliciousFilename = "../../../etc/passwd_malicious.sh.pdf";
    const safeFilename = sanitizeFileName(maliciousFilename);

    expect(safeFilename).not.toContain("..");
    expect(safeFilename).not.toContain("/");
    expect(safeFilename).not.toContain("\\");
    expect(safeFilename.endsWith(".pdf")).toBe(true);
  });

  it("should enforce strong enterprise password validation schema", () => {
    expect(PasswordPolicySchema.safeParse("weak").success).toBe(false);
    expect(PasswordPolicySchema.safeParse("Password123").success).toBe(false); // missing special char
    expect(PasswordPolicySchema.safeParse("P@ssword123!").success).toBe(true);
  });

  it("should throttle rapid action requests using Token Bucket Rate Limiting", () => {
    const testUser = "user_test_rate_bucket";
    rateLimiter.resetLimit("login", testUser);

    // Consume all 5 login tokens
    for (let i = 0; i < 5; i++) {
      const res = rateLimiter.checkLimit("login", testUser);
      expect(res.allowed).toBe(true);
    }

    // 6th attempt should be blocked
    const blockedRes = rateLimiter.checkLimit("login", testUser);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);

    // Clean up
    rateLimiter.resetLimit("login", testUser);
  });

  it("should reject dangerous executable file uploads", async () => {
    const fakeFile = new File(["malicious content"], "malware.exe", {
      type: "application/x-msdownload",
    });
    const result = await validateFileUpload(fakeFile, "cv");

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid file type extension");
  });

  it("should support centralized AuditLogger service for security event capture", async () => {
    const spy = vi.spyOn(AuditLogger, "logEvent").mockImplementation(async () => {});

    await AuditLogger.logUnauthorizedAccess("u123", "admin_dashboard", "DELETE_USER");
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u123",
        action: "unauthorized_access_attempt",
        severity: "warning",
      }),
    );

    await AuditLogger.logRoleModification("u456", "admin1", "super_admin", "employer");
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "admin1",
        action: "role_modification",
        entityId: "u456",
      }),
    );

    await AuditLogger.logSuspiciousLogin("hacker@example.com", "192.168.1.1");
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "suspicious_login_activity",
        severity: "critical",
      }),
    );

    spy.mockRestore();
  });
});
