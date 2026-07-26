import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { AppNav } from "@/components/AppNav";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [{ title: "My Applications — KaziLink" }, { name: "robots", content: "noindex" }],
  }),
  component: MyApplications,
});

function MyApplications() {
  const { user } = useAuth();
  const { t } = useT();
  const q = useQuery({
    queryKey: ["my-apps", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from("applications")
          .select("id, status, applied_at, jobs(slug, title, companies(name))")
          .eq("applicant_id", user!.id)
          .order("applied_at", { ascending: false })
      ).data ?? [],
  });

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">{t.nav.applications}</h1>
        <div className="mt-8 space-y-3">
          {q.data?.length === 0 && (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              {t.empty.none}
            </div>
          )}
          {q.data?.map((a) => (
            <Link
              key={a.id}
              to="/jobs/$slug"
              params={{ slug: a.jobs!.slug }}
              className="flex items-center justify-between rounded-lg border bg-card p-4 hover:border-primary"
            >
              <div>
                <div className="font-medium">{a.jobs?.title}</div>
                <div className="text-xs text-muted-foreground">
                  {a.jobs?.companies?.name} · {new Date(a.applied_at).toLocaleDateString()}
                </div>
              </div>
              <Badge variant="secondary">{a.status}</Badge>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
