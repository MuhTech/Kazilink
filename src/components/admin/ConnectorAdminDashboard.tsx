/// <reference types="react" />
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Globe,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Plus,
  Activity,
  FileCheck,
  ShieldCheck,
  Clock,
  Database,
  SlidersHorizontal,
} from "lucide-react";
import { connectorRegistry } from "@/lib/connectors/connector-registry";
import type { ConnectorConfig, SyncLogEntry, ConnectorType } from "@/lib/connectors/types";
import { toast } from "sonner";

export function ConnectorAdminDashboard() {
  const [connectors, setConnectors] = useState<ConnectorConfig[]>(connectorRegistry.getAllConnectors());
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>(connectorRegistry.getSyncLogs());
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New Connector Form State
  const [newConnName, setNewConnName] = useState("");
  const [newConnType, setNewConnType] = useState<ConnectorType>("career_pages");
  const [newConnCategory, setNewConnCategory] = useState<"API" | "RSS" | "StructuredData" | "ATS" | "PartnerFeed">("API");
  const [newConnUrl, setNewConnUrl] = useState("");
  const [newConnInterval, setNewConnInterval] = useState("30");
  const [newConnCountry, setNewConnCountry] = useState("Global");

  const handleToggle = (id: string, currentVal: boolean) => {
    try {
      const updated = connectorRegistry.toggleConnector(id, !currentVal);
      setConnectors(connectorRegistry.getAllConnectors());
      toast.success(`${updated.name} is now ${updated.enabled ? "ENABLED" : "PAUSED"}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to toggle connector");
    }
  };

  const handleManualSync = async (id: string) => {
    setSyncingId(id);
    try {
      const log = await connectorRegistry.runManualSync(id);
      setConnectors(connectorRegistry.getAllConnectors());
      setSyncLogs(connectorRegistry.getSyncLogs());
      toast.success(`⚡ Sync completed for ${log.connectorName}: ${log.jobsImported} jobs imported!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to trigger sync");
    } finally {
      setSyncingId(null);
    }
  };

  const handleCreateConnector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConnName || !newConnUrl) {
      toast.error("Please fill in required connector fields.");
      return;
    }

    try {
      const created = connectorRegistry.addCustomConnector({
        name: newConnName,
        type: newConnType,
        category: newConnCategory,
        description: `Custom ${newConnCategory} connector feed integration.`,
        endpointUrl: newConnUrl,
        apiKeyRequired: false,
        status: "active",
        enabled: true,
        syncIntervalMinutes: Number(newConnInterval),
        countryFocus: newConnCountry,
        rateLimitPerMin: 300,
      });

      setConnectors(connectorRegistry.getAllConnectors());
      setAddModalOpen(false);
      toast.success(`🎉 Custom Connector ${created.name} registered successfully!`);

      // Reset form
      setNewConnName("");
      setNewConnUrl("");
    } catch (e: any) {
      toast.error(e.message || "Failed to add connector");
    }
  };

  const totalImported = connectors.reduce((acc: any, c: { totalJobsImported: any; }) => acc + c.totalJobsImported, 0);
  const activeCount = connectors.filter((c: { enabled: any; }) => c.enabled).length;
  const avgConfidence = (
    connectors.reduce((acc: any, c: { avgAiConfidence: any; }) => acc + c.avgAiConfidence, 0) / (connectors.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-border/80 bg-card rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Active Global Connectors</span>
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{activeCount} / {connectors.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium">100% Zero-code toggle support</div>
        </Card>

        <Card className="p-5 border-border/80 bg-card rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Total Aggregated Jobs</span>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{totalImported.toLocaleString()}</div>
          <div className="text-[11px] text-muted-foreground">Synchronized from global & local sources</div>
        </Card>

        <Card className="p-5 border-border/80 bg-card rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>AI Confidence Score</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{avgConfidence}%</div>
          <div className="text-[11px] text-muted-foreground">Automated fraud & duplicate filtration</div>
        </Card>

        <Card className="p-5 border-border/80 bg-card rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>System Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">Operational</div>
          <div className="text-[11px] text-muted-foreground">Rate limits & health checks green</div>
        </Card>
      </div>

      {/* CONNECTOR MANAGEMENT LIST HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            <span>Global Job Connectors & Data Feeds</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enable or disable live partner feeds, RSS channels, and ATS connectors without modifying code.
          </p>
        </div>

        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 rounded-xl h-9 px-4">
              <Plus className="w-4 h-4" />
              <span>Add Custom Connector</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <span>Register Custom Connector Feed</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateConnector} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Connector Name</Label>
                <Input
                  placeholder="e.g., East Africa Banking Recruitment Feed"
                  value={newConnName}
                  onChange={(e: { target: { value: any; }; }) => setNewConnName(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Category</Label>
                  <Select value={newConnCategory} onValueChange={(v: any) => setNewConnCategory(v)}>
                    <SelectTrigger className="h-9 text-xs rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="API">API Integration</SelectItem>
                      <SelectItem value="RSS">RSS Feed</SelectItem>
                      <SelectItem value="StructuredData">Schema.org JSON-LD</SelectItem>
                      <SelectItem value="ATS">ATS Webhook</SelectItem>
                      <SelectItem value="PartnerFeed">Partner Feed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Territory / Focus</Label>
                  <Select value={newConnCountry} onValueChange={setNewConnCountry}>
                    <SelectTrigger className="h-9 text-xs rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Global">Worldwide / Global</SelectItem>
                      <SelectItem value="Tanzania">Tanzania</SelectItem>
                      <SelectItem value="East Africa">East Africa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Endpoint / Feed URL</Label>
                <Input
                  placeholder="https://api.example.com/v1/jobs.json"
                  value={newConnUrl}
                  onChange={(e: { target: { value: any; }; }) => setNewConnUrl(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Sync Interval (Minutes)</Label>
                <Input
                  type="number"
                  value={newConnInterval}
                  onChange={(e: { target: { value: any; }; }) => setNewConnInterval(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  min="5"
                  max="1440"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl">
                  Register Connector
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* CONNECTOR CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((c) => (
          <Card key={c.id} className="p-5 border-border/80 bg-card rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] uppercase font-extrabold tracking-wider bg-muted/60">
                      {c.category}
                    </Badge>
                    <Badge className={c.enabled ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
                      {c.enabled ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm text-foreground leading-tight">{c.name}</h3>
                </div>

                <Switch
                  checked={c.enabled}
                  onCheckedChange={() => handleToggle(c.id, c.enabled)}
                />
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Imported Jobs:</span>
                  <span className="font-bold text-foreground">{c.totalJobsImported.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>AI Quality Confidence:</span>
                  <span className="font-bold text-emerald-600">{c.avgAiConfidence}%</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Sync Schedule:</span>
                  <span className="font-medium text-foreground">Every {c.syncIntervalMinutes}m</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
              <div className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span>Last sync: {c.lastSyncAt ? new Date(c.lastSyncAt).toLocaleTimeString() : "Never"}</span>
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={!c.enabled || syncingId === c.id}
                onClick={() => handleManualSync(c.id)}
                className="rounded-xl text-xs h-8 gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingId === c.id ? "animate-spin text-emerald-600" : ""}`} />
                <span>{syncingId === c.id ? "Syncing..." : "Sync Now"}</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* SYNCHRONIZATION AUDIT LOGS TABLE */}
      <Card className="border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
          <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Live Connector Synchronization & Audit Logs</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Audit history of job imports, duplicate detection counts, and processing performance.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead>Connector</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Fetched</TableHead>
                <TableHead className="text-right">Imported</TableHead>
                <TableHead className="text-right">Duplicates</TableHead>
                <TableHead className="text-right">Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {syncLogs.map((log: { id: any; connectorName: any; timestamp: string | number | Date; status: string; jobsFetched: any; jobsImported: any; duplicatesFound: any; executionTimeMs: any; }) => (
                <TableRow key={log.id}>
                  <TableCell className="font-bold text-foreground">{log.connectorName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        log.status === "success"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"
                      }
                    >
                      {log.status === "success" ? "Success" : "Partial Sync"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{log.jobsFetched}</TableCell>
                  <TableCell className="text-right font-extrabold text-emerald-600">{log.jobsImported}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{log.duplicatesFound}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">{log.executionTimeMs}ms</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
