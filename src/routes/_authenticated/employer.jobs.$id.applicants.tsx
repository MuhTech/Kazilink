import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { AppNav } from "@/components/AppNav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/employer/jobs/$id/applicants")({
  head: () => ({
    meta: [{ title: "Applicants — KaziLink" }, { name: "robots", content: "noindex" }],
  }),
  component: Applicants,
});

const STATUSES = [
  "submitted",
  "reviewing",
  "shortlisted",
  "interview",
  "offered",
  "hired",
  "rejected",
  "withdrawn",
] as const;

function Applicants() {
  const { id } = Route.useParams();
  const { t } = useT();
  const qc = useQueryClient();

  const jobQ = useQuery({
    queryKey: ["emp-job", id],
    queryFn: async () =>
      (await supabase.from("jobs").select("id, title, companies(name)").eq("id", id).maybeSingle())
        .data,
  });

  const appsQ = useQuery({
    queryKey: ["applicants", id],
    queryFn: async () => {
      const { data: apps } = await supabase
        .from("applications")
        .select("id, status, applied_at, cover_letter, resume_path, applicant_id")
        .eq("job_id", id)
        .order("applied_at", { ascending: false });
      if (!apps?.length) return [];
      const ids = Array.from(new Set(apps.map((a) => a.applicant_id)));
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, headline, location, phone")
        .in("id", ids);
      const byId = new Map((profs ?? []).map((p) => [p.id, p]));
      return apps.map((a) => ({ ...a, profile: byId.get(a.applicant_id) }));
    },
  });

  const updateStatus = async (appId: string, status: (typeof STATUSES)[number]) => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", appId);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      await qc.invalidateQueries({ queryKey: ["applicants", id] });
    }
  };

  const downloadResume = async (path: string) => {
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 60);
    if (error) {
      toast.error(error.message);
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">{t.employer.applicants}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {jobQ.data?.title} — {jobQ.data?.companies?.name}
        </p>
        <div className="mt-8 space-y-3">
          {appsQ.data?.length === 0 && (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              {t.empty.none}
            </div>
          )}
          {appsQ.data?.map((a) => (
            <div key={a.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{a.profile?.full_name ?? "Anonymous"}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.profile?.headline} · {a.profile?.location}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Applied {new Date(a.applied_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.resume_path && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadResume(a.resume_path!)}
                    >
                      Resume
                    </Button>
                  )}
                  <Select
                    value={a.status}
                    onValueChange={(v) => updateStatus(a.id, v as (typeof STATUSES)[number])}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {a.cover_letter && (
                <p className="mt-3 whitespace-pre-line rounded-md bg-muted/40 p-3 text-sm">
                  {a.cover_letter}
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
