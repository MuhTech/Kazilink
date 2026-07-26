import { supabase } from "@/integrations/supabase/client";

/**
 * Enterprise Audit Logging & Security Event Capture Module
 * Records security alerts, administrative actions, RBAC changes, and authentication events
 * into security_audit_logs / audit_logs for compliance and threat analysis.
 */

export type AuditSeverity = "info" | "warning" | "error" | "critical";

export interface AuditLogPayload {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  severity?: AuditSeverity;
  details?: Record<string, any>;
  ipAddress?: string;
}

export class AuditLoggerService {
  /**
   * Log generic audit event to database
   */
  async logEvent(payload: AuditLogPayload): Promise<void> {
    const {
      userId,
      action,
      entityType = "system",
      entityId,
      severity = "info",
      details = {},
      ipAddress = "client-web",
    } = payload;

    const record = {
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      severity,
      details,
      ip_address: ipAddress,
      created_at: new Date().toISOString(),
    };

    try {
      // 1. Insert into security_audit_logs
      await (supabase.from("security_audit_logs" as any) as any).insert(record as any);
    } catch (e) {
      // Fallback if table is named audit_logs
      try {
        await (supabase.from("audit_logs" as any) as any).insert(record as any);
      } catch (err) {
        console.warn("[AuditLogger] Failed to write to audit_logs:", err);
      }
    }

    try {
      // 2. Trigger high-priority security alert for errors or critical events
      if (severity === "critical" || severity === "error") {
        await supabase.from("security_alerts").insert({
          title: `Security Alert: ${action}`,
          severity,
          user_id: userId,
          description: `Action '${action}' triggered security flag for entity ${entityType} (${entityId || "N/A"})`,
          status: "open",
          metadata: details,
        });
      }
    } catch (err) {
      console.warn("[AuditLogger] Failed to trigger security alert:", err);
    }
  }

  /**
   * Capture unauthorized access attempt
   */
  async logUnauthorizedAccess(
    userId: string | undefined,
    resource: string,
    action: string,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: "unauthorized_access_attempt",
      entityType: resource,
      severity: "warning",
      details: {
        attemptedAction: action,
        resource,
        ...details,
      },
    });
  }

  /**
   * Capture RBAC role modification
   */
  async logRoleModification(
    targetUserId: string,
    updatedByUserId: string,
    newRole: string,
    oldRole?: string,
  ): Promise<void> {
    await this.logEvent({
      userId: updatedByUserId,
      action: "role_modification",
      entityType: "user_roles",
      entityId: targetUserId,
      severity: "warning",
      details: {
        targetUserId,
        updatedByUserId,
        oldRole,
        newRole,
      },
    });
  }

  /**
   * Capture suspicious login or brute-force pattern
   */
  async logSuspiciousLogin(
    email: string,
    ipAddress = "client-ip",
    reason = "Multiple failed authentication attempts",
  ): Promise<void> {
    await this.logEvent({
      action: "suspicious_login_activity",
      entityType: "authentication",
      severity: "critical",
      ipAddress,
      details: {
        email,
        reason,
      },
    });
  }

  /**
   * Capture login attempt outcome
   */
  async recordLoginAttempt(
    userId: string,
    email: string,
    success: boolean,
    failureReason?: string,
  ): Promise<void> {
    try {
      const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "unknown";
      await supabase.from("login_history").insert({
        user_id: userId,
        email,
        ip_address: "client-ip",
        user_agent: userAgent,
        status: success ? "success" : "failed",
        failure_reason: failureReason,
      });

      if (!success) {
        await this.logEvent({
          userId,
          action: "login_failed",
          severity: "warning",
          details: { email, failureReason },
        });
      } else {
        await this.logEvent({
          userId,
          action: "login_success",
          severity: "info",
          details: { email },
        });
      }
    } catch (err) {
      console.warn("[AuditLogger] Failed to record login attempt:", err);
    }
  }
}

export const AuditLogger = new AuditLoggerService();

// Export backward compatible functions
export const logAuditEvent = (payload: AuditLogPayload) => AuditLogger.logEvent(payload);
export const recordLoginAttempt = (
  userId: string,
  email: string,
  success: boolean,
  failureReason?: string,
) => AuditLogger.recordLoginAttempt(userId, email, success, failureReason);
