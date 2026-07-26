import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Eye,
  Lock,
  AlertTriangle,
  FileCode,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Globe,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export interface SecurityAuditRecord {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  severity: "info" | "warning" | "error" | "critical" | string;
  ip_address?: string;
  details?: Record<string, any>;
  created_at: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

export function SecurityAuditLogsTable() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<SecurityAuditRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // 1. Fetch Audit Logs from security_audit_logs or fallback audit_logs
  const {
    data: records = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["security-audit-logs", severityFilter, actionFilter],
    queryFn: async () => {
      const normalizeRecord = (row: any): SecurityAuditRecord => ({
        id: row.id,
        user_id: row.user_id ?? row.actor_id ?? undefined,
        action: row.action ?? "",
        entity_type: row.entity_type ?? undefined,
        entity_id: row.entity_id ?? undefined,
        severity: row.severity ?? "info",
        ip_address: row.ip_address ?? row.ip ?? undefined,
        details: row.details ?? row.metadata ?? undefined,
        created_at: row.created_at ?? new Date().toISOString(),
        profiles: row.profiles
          ? {
              full_name: row.profiles.full_name ?? undefined,
              email: row.profiles.email ?? undefined,
            }
          : undefined,
      });

      let dataRecords: SecurityAuditRecord[] = [];

      try {
        let q1 = supabase
          .from("security_audit_logs" as any)
          .select("*, profiles:user_id(full_name, email)")
          .order("created_at", { ascending: false })
          .limit(250);

        if (severityFilter !== "all") {
          q1 = q1.eq("severity", severityFilter as never);
        }
        if (actionFilter !== "all") {
          q1 = q1.eq("action", actionFilter);
        }

        const res1 = await q1;
        if (!res1.error && Array.isArray(res1.data) && res1.data.length > 0) {
          dataRecords = res1.data.map(normalizeRecord);
        }
      } catch (err) {
        console.warn("security_audit_logs fetch issue, checking audit_logs fallback", err);
      }

      if (dataRecords.length === 0) {
        try {
          let q2 = supabase
            .from("audit_logs")
            .select("*, profiles:user_id(full_name, email)")
            .order("created_at", { ascending: false })
            .limit(250);

          if (actionFilter !== "all") {
            q2 = q2.eq("action", actionFilter);
          }

          const res2 = await q2;
          if (!res2.error && Array.isArray(res2.data)) {
            dataRecords = res2.data.map(normalizeRecord);
          }
        } catch (err) {
          console.error("Failed to query audit_logs fallback", err);
        }
      }

      return dataRecords;
    },
    enabled: isAdmin,
  });

  // Client-side search filtering
  const filteredRecords = records.filter((rec) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const actionMatch = rec.action?.toLowerCase().includes(term);
    const userMatch =
      rec.user_id?.toLowerCase().includes(term) ||
      rec.profiles?.email?.toLowerCase().includes(term);
    const ipMatch = rec.ip_address?.toLowerCase().includes(term);
    const entityMatch = rec.entity_type?.toLowerCase().includes(term);
    const detailsMatch = JSON.stringify(rec.details || {})
      .toLowerCase()
      .includes(term);

    return actionMatch || userMatch || ipMatch || entityMatch || detailsMatch;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Stats Counters
  const criticalCount = records.filter((r) => r.severity === "critical").length;
  const warningCount = records.filter((r) => r.severity === "warning").length;
  const uniqueIps = new Set(records.map((r) => r.ip_address).filter(Boolean)).size;

  // CSV Export
  const exportCsv = () => {
    if (filteredRecords.length === 0) {
      toast.error("No audit records available to export");
      return;
    }

    const headers = [
      "ID",
      "Timestamp",
      "Severity",
      "Action",
      "User ID",
      "User Email",
      "IP Address",
      "Entity",
      "Details",
    ];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.created_at,
      r.severity,
      `"${r.action.replace(/"/g, '""')}"`,
      r.user_id || "N/A",
      r.profiles?.email || "N/A",
      r.ip_address || "N/A",
      r.entity_type || "N/A",
      `"${JSON.stringify(r.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `security_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Security audit log CSV exported successfully");
  };

  // Helper for severity styling
  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return (
          <Badge className="bg-red-600 text-white hover:bg-red-700 animate-pulse font-semibold uppercase tracking-wider text-[10px]">
            Critical
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-rose-500 text-white hover:bg-rose-600 font-semibold uppercase tracking-wider text-[10px]">
            Error
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-amber-500 text-black hover:bg-amber-600 font-semibold uppercase tracking-wider text-[10px]">
            Warning
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-400 font-medium text-[10px]"
          >
            Info
          </Badge>
        );
    }
  };

  if (authLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
        <p className="text-sm">Verifying administrator credentials...</p>
      </div>
    );
  }

  // Protected Gate Check
  if (!isAdmin) {
    return (
      <Card className="border-red-900/50 bg-red-950/20 text-slate-200 my-6">
        <CardHeader className="flex flex-row items-center space-x-3 pb-2">
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-red-400 font-semibold text-lg">
              Access Denied — Protected Audit Storage
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              The <code className="text-red-300">security_audit_logs</code> repository contains
              sensitive cryptographic & governance events. Access is restricted exclusively to
              authenticated platform administrators.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Captured Events</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">{records.length}</p>
            </div>
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{criticalCount}</p>
            </div>
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Warnings Logged</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{warningCount}</p>
            </div>
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Unique Source IPs</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{uniqueIps}</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Audit Logs Table Card */}
      <Card className="bg-slate-900/80 border-slate-800 text-slate-100 shadow-xl">
        <CardHeader className="border-b border-slate-800 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                Security Audit Logs Repository (
                <code className="text-xs text-emerald-400 font-mono">security_audit_logs</code>)
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm mt-1">
                Tamper-evident security trail capturing unauthorized access, role escalation, login
                anomalies, and threat vectors.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1.5 ${isRefetching ? "animate-spin text-primary" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={exportCsv}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search action, user email, IP, or payload..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 bg-slate-950/80 border-slate-800 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500 hidden sm:inline" />
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="info">Info</option>
              </select>
            </div>

            {/* Action Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Action Types</option>
                <option value="unauthorized_access_attempt">Unauthorized Access Attempts</option>
                <option value="role_modification">Role Modifications</option>
                <option value="suspicious_login_activity">Suspicious Login Activity</option>
                <option value="login_failed">Failed Logins</option>
                <option value="login_success">Successful Logins</option>
                <option value="file_upload_blocked">Blocked File Uploads</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-400" />
              <p className="text-sm font-medium">
                Querying encrypted security audit log records...
              </p>
            </div>
          ) : paginatedRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-semibold text-slate-300">No matching audit logs found</p>
              <p className="text-xs text-slate-500 mt-1">
                Adjust your search term or severity filters above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">User / Email</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {paginatedRecords.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">{getSeverityBadge(log.severity)}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-200">
                        <span className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-emerald-400 font-semibold">
                          {log.action}
                        </span>
                        {log.entity_type && (
                          <span className="ml-2 text-[11px] text-slate-400 font-normal">
                            ({log.entity_type})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{log.profiles?.email || log.user_id || "Anonymous / System"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {log.ip_address || "client-web"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRecord(log)}
                          className="h-8 px-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/40">
              <div>
                Showing page <span className="font-semibold text-slate-200">{currentPage}</span> of{" "}
                <span className="font-semibold text-slate-200">{totalPages}</span> (
                {filteredRecords.length} total events)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-7 px-2 border-slate-800 bg-slate-900 text-slate-300 text-xs disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 px-2 border-slate-800 bg-slate-900 text-slate-300 text-xs disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payload Modal Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileCode className="w-5 h-5 text-emerald-400" />
              Security Audit Event Details
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Raw cryptographic payload and parameters logged for event ID{" "}
              <code className="text-emerald-400 font-mono">{selectedRecord?.id}</code>
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Action Identifier
                  </span>
                  <span className="text-emerald-400 font-mono font-medium">
                    {selectedRecord.action}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Severity
                  </span>
                  <div>{getSeverityBadge(selectedRecord.severity)}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Logged User
                  </span>
                  <span className="text-slate-200">
                    {selectedRecord.profiles?.email || selectedRecord.user_id || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    IP Address
                  </span>
                  <span className="text-slate-200 font-mono">
                    {selectedRecord.ip_address || "client-web"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Timestamp
                  </span>
                  <span className="text-slate-300 font-mono">
                    {new Date(selectedRecord.created_at).toISOString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1 text-xs">
                  Metadata & Parameters Payload
                </span>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto max-h-60 leading-relaxed">
                  {JSON.stringify(selectedRecord.details || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRecord(null)}
              className="border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Close Inspector
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
