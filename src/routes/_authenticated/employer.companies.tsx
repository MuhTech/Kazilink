import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { companySchema, slugify } from "@/lib/schemas";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/employer/companies")({
  head: () => ({
    meta: [{ title: "Companies — KaziLink" }, { name: "robots", content: "noindex" }],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const { user } = useAuth();
  const { t } = useT();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    industry: "",
    company_size: "",
    website: "",
    description: "",
    location: "",
  });
  const [busy, setBusy] = useState(false);

  const q = useQuery({
    queryKey: ["my-companies", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from("companies")
          .select("*")
          .eq("owner_id", user!.id)
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = companySchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.from("companies").insert({
        ...parsed.data,
        owner_id: user!.id,
        slug: slugify(parsed.data.name),
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Company created — pending verification");
      setForm({
        name: "",
        industry: "",
        company_size: "",
        website: "",
        description: "",
        location: "",
      });
      await qc.invalidateQueries({ queryKey: ["my-companies", user?.id] });
    } finally {
      setBusy(false);
    }
  };

  const statusVariant = (s: string) =>
    s === "verified" ? "default" : s === "rejected" ? "destructive" : "secondary";

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">{t.company.list}</h1>
          <div className="mt-6 space-y-3">
            {q.data?.length === 0 && (
              <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                {t.empty.none}
              </div>
            )}
            {q.data?.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border bg-card p-4"
              >
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.industry} · {c.location}
                  </div>
                </div>
                <Badge variant={statusVariant(c.verification_status) as never}>
                  {t.company[c.verification_status as "pending" | "verified" | "rejected"]}
                </Badge>
              </div>
            ))}
          </div>
        </section>
        <aside>
          <form onSubmit={create} className="space-y-3 rounded-lg border bg-card p-5">
            <h2 className="font-semibold">{t.company.create}</h2>
            <Field label={t.company.name}>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={160}
              />
            </Field>
            <Field label={t.company.industry}>
              <Input
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                maxLength={80}
              />
            </Field>
            <Field label={t.company.size}>
              <Input
                value={form.company_size}
                onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                maxLength={40}
                placeholder="e.g. 11-50"
              />
            </Field>
            <Field label={t.company.website}>
              <Input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                maxLength={255}
                placeholder="https://"
              />
            </Field>
            <Field label={t.profile.location}>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                maxLength={160}
              />
            </Field>
            <Field label={t.company.description}>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={4000}
              />
            </Field>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? t.empty.loading : t.company.create}
            </Button>
          </form>
        </aside>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
