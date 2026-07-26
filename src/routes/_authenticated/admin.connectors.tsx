import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AppNav } from "@/components/AppNav";
import { Badge } from "@/components/ui/badge";
import { Globe, ShieldCheck } from "lucide-react";
import { ConnectorAdminDashboard } from "@/components/admin/ConnectorAdminDashboard";

export const Route = createFileRoute("/_authenticated/admin/connectors")({
  head: () => ({
    meta: [
      { title: "Global Connectors & Job Aggregator — KaziLink Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminConnectorsPage,
});

function AdminConnectorsPage() {
  const { isAdmin, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      void nav({ to: "/dashboard" });
    }
  }, [loading, isAdmin, nav]);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Worldwide Aggregation System</span>
            </Badge>
            <Badge variant="outline" className="text-xs">
              Zero-Code Control
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Global Job Aggregator & Connector Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor connector health, configure RSS/API feeds, and track live deduplication and AI processing metrics.
          </p>
        </div>

        <ConnectorAdminDashboard />
      </main>
    </div>
  );
}
