import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { ShieldCheck, Bot, Search as SearchIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — KaziLink" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

function Admin() {
  const { isAdmin, loading, user } = useAuth();
  const nav = useNavigate();
  const { t } = useT();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !isAdmin) void nav({ to: "/dashboard" });
  }, [loading, isAdmin, nav]);

  const pendingQ = useQuery({
    queryKey: ["admin-pending"],
    enabled: isAdmin,
    queryFn: async () =>
      (
        await supabase
          .from("companies")
          .select("*")
          .eq("verification_status", "pending")
          .order("created_at")
      ).data ?? [],
  });
  const settingsQ = useQuery({
    queryKey: ["admin-settings"],
    enabled: isAdmin,
    queryFn: async () => (await supabase.from("app_settings").select("*")).data ?? [],
  });

  const verify = async (id: string, status: "verified" | "rejected") => {
    const { error } = await supabase
      .from("companies")
      .update({
        verification_status: status,
        verified_at: status === "verified" ? new Date().toISOString() : null,
        verified_by: user!.id,
      })
      .eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("audit_logs").insert({
      actor_id: user!.id,
      action: `company.${status}`,
      entity_type: "company",
      entity_id: id,
    });
    toast.success("Updated");
    await qc.invalidateQueries({ queryKey: ["admin-pending"] });
  };

  const toggleSetting = async (key: string, value: boolean) => {
    const { error } = await supabase
      .from("app_settings")
      .update({ value: value as unknown as never, updated_by: user!.id })
      .eq("key", key);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["admin-settings"] });
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{t.admin.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Platform administration, verification, security, and AI oversight
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 border-primary text-primary"
            >
              <Link to="/admin/security">
                <ShieldCheck className="h-4 w-4" /> Security Center
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/admin/ai">
                <Bot className="h-4 w-4 text-primary" /> AI Management
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/admin/search">
                <SearchIcon className="h-4 w-4 text-emerald-600" /> Search Console
              </Link>
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">{t.admin.companies}</h2>
          <div className="mt-4 space-y-2">
            {pendingQ.data?.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                {t.empty.none}
              </div>
            )}
            {pendingQ.data?.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border bg-card p-4"
              >
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.industry} · {c.website}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => verify(c.id, "verified")}>
                    {t.admin.verify}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => verify(c.id, "rejected")}>
                    {t.admin.reject}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">{t.admin.settings}</h2>
          <div className="mt-4 space-y-2">
            {settingsQ.data?.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between rounded-lg border bg-card p-4"
              >
                <div>
                  <div className="font-medium">{s.key.replace(/_/g, " ")}</div>
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(s.updated_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={s.value === true ? "default" : "secondary"}>
                    {String(s.value)}
                  </Badge>
                  <Switch
                    checked={s.value === true}
                    onCheckedChange={(v) => toggleSetting(s.key, v)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
