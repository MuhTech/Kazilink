import { createFileRoute, Link } from "@tanstack/react-router";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { jobSchema, slugify } from "@/lib/schemas";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/employer/jobs")({
  head: () => ({
    meta: [{ title: "Job Postings — KaziLink" }, { name: "robots", content: "noindex" }],
  }),
  component: EmployerJobs,
});

type FormState = {
  company_id: string;
  category_id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  employment_type:
    "full_time" | "part_time" | "contract" | "internship" | "temporary" | "freelance";
  experience_level: "entry" | "junior" | "mid" | "senior" | "lead" | "executive";
  salary_min: string;
  salary_max: string;
  is_remote: boolean;
  application_deadline: string;
  status: "draft" | "published";
  skills: string;
};

const initial: FormState = {
  company_id: "",
  category_id: "",
  title: "",
  description: "",
  requirements: "",
  responsibilities: "",
  location: "",
  employment_type: "full_time",
  experience_level: "mid",
  salary_min: "",
  salary_max: "",
  is_remote: false,
  application_deadline: "",
  status: "draft",
  skills: "",
};

function EmployerJobs() {
  const { user } = useAuth();
  const { t } = useT();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(initial);
  const [busy, setBusy] = useState(false);

  const companiesQ = useQuery({
    queryKey: ["my-companies-min", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from("companies")
          .select("id, name, verification_status")
          .eq("owner_id", user!.id)
      ).data ?? [],
  });

  const catsQ = useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await supabase.from("job_categories").select("*").eq("active", true).order("sort_order"))
        .data ?? [],
  });

  const jobsQ = useQuery({
    queryKey: ["employer-jobs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const compIds =
        (await supabase.from("companies").select("id").eq("owner_id", user!.id)).data?.map(
          (c) => c.id,
        ) ?? [];
      if (compIds.length === 0) return [];
      return (
        (
          await supabase
            .from("jobs")
            .select("id, slug, title, status, applications_count, created_at, companies(name)")
            .in("company_id", compIds)
            .order("created_at", { ascending: false })
        ).data ?? []
      );
    },
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      company_id: form.company_id,
      category_id: form.category_id || null,
      title: form.title,
      description: form.description,
      requirements: form.requirements,
      responsibilities: form.responsibilities,
      location: form.location,
      employment_type: form.employment_type,
      experience_level: form.experience_level,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      is_remote: form.is_remote,
      application_deadline: form.application_deadline || "",
      status: form.status,
      skills: form.skills,
    };
    const parsed = jobSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      const { data: inserted, error } = await supabase
        .from("jobs")
        .insert({
          company_id: parsed.data.company_id,
          category_id: parsed.data.category_id ?? null,
          posted_by: user!.id,
          title: parsed.data.title,
          slug: slugify(parsed.data.title),
          description: parsed.data.description,
          requirements: parsed.data.requirements || null,
          responsibilities: parsed.data.responsibilities || null,
          location: parsed.data.location || null,
          employment_type: parsed.data.employment_type,
          experience_level: parsed.data.experience_level,
          salary_min: parsed.data.salary_min ?? null,
          salary_max: parsed.data.salary_max ?? null,
          is_remote: parsed.data.is_remote,
          application_deadline: parsed.data.application_deadline || null,
          status: parsed.data.status,
          published_at: parsed.data.status === "published" ? new Date().toISOString() : null,
        })
        .select("id")
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      if (parsed.data.skills && inserted) {
        const skills = parsed.data.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 20);
        if (skills.length)
          await supabase
            .from("job_skills")
            .insert(skills.map((s) => ({ job_id: inserted.id, skill: s })));
      }
      toast.success("Job created");
      setForm(initial);
      await qc.invalidateQueries({ queryKey: ["employer-jobs", user?.id] });
    } finally {
      setBusy(false);
    }
  };

  const noCompany = companiesQ.data && companiesQ.data.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_400px]">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">{t.employer.jobs}</h1>
          {noCompany && (
            <div className="mt-4 rounded-lg border bg-muted/40 p-4 text-sm">
              Create a company first:{" "}
              <Link className="text-primary hover:underline" to="/employer/companies">
                {t.company.create}
              </Link>
            </div>
          )}
          <div className="mt-6 space-y-3">
            {jobsQ.data?.length === 0 && (
              <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                {t.empty.none}
              </div>
            )}
            {jobsQ.data?.map((j) => (
              <div
                key={j.id}
                className="flex items-center justify-between rounded-lg border bg-card p-4"
              >
                <div>
                  <Link
                    to="/jobs/$slug"
                    params={{ slug: j.slug }}
                    className="font-semibold hover:underline"
                  >
                    {j.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {j.companies?.name} · {j.applications_count} applicants
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={j.status === "published" ? "default" : "secondary"}>
                    {j.status}
                  </Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/employer/jobs/$id/applicants" params={{ id: j.id }}>
                      {t.employer.applicants}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside>
          <form onSubmit={create} className="space-y-3 rounded-lg border bg-card p-5">
            <h2 className="font-semibold">{t.jobForm.create}</h2>
            <Field label={t.jobForm.company}>
              <Select
                value={form.company_id}
                onValueChange={(v) => setForm({ ...form, company_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {companiesQ.data?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t.jobForm.category}>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm({ ...form, category_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {catsQ.data?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t.jobForm.title}>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                maxLength={160}
              />
            </Field>
            <Field label={t.jobForm.description}>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                maxLength={10000}
              />
            </Field>
            <Field label={t.jobForm.requirements}>
              <Textarea
                rows={3}
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                maxLength={6000}
              />
            </Field>
            <Field label={t.jobForm.responsibilities}>
              <Textarea
                rows={3}
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                maxLength={6000}
              />
            </Field>
            <Field label={t.jobForm.location}>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                maxLength={160}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t.jobForm.type}>
                <Select
                  value={form.employment_type}
                  onValueChange={(v) =>
                    setForm({ ...form, employment_type: v as FormState["employment_type"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "full_time",
                      "part_time",
                      "contract",
                      "internship",
                      "temporary",
                      "freelance",
                    ].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t.jobForm.level}>
                <Select
                  value={form.experience_level}
                  onValueChange={(v) =>
                    setForm({ ...form, experience_level: v as FormState["experience_level"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["entry", "junior", "mid", "senior", "lead", "executive"].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t.jobForm.salaryMin}>
                <Input
                  type="number"
                  min="0"
                  value={form.salary_min}
                  onChange={(e) => setForm({ ...form, salary_min: e.target.value })}
                />
              </Field>
              <Field label={t.jobForm.salaryMax}>
                <Input
                  type="number"
                  min="0"
                  value={form.salary_max}
                  onChange={(e) => setForm({ ...form, salary_max: e.target.value })}
                />
              </Field>
            </div>
            <Field label={t.jobForm.deadline}>
              <Input
                type="date"
                value={form.application_deadline}
                onChange={(e) => setForm({ ...form, application_deadline: e.target.value })}
              />
            </Field>
            <Field label={t.jobForm.skills}>
              <Input
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="React, TypeScript, SQL"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.is_remote}
                onCheckedChange={(c) => setForm({ ...form, is_remote: !!c })}
              />{" "}
              {t.jobForm.remote}
            </label>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={busy || !form.company_id}
                onClick={() => setForm((f) => ({ ...f, status: "draft" }))}
              >
                {t.jobForm.saveDraft}
              </Button>
              <Button
                type="submit"
                variant="default"
                className="flex-1"
                disabled={busy || !form.company_id}
                onClick={() => setForm((f) => ({ ...f, status: "published" }))}
              >
                {t.jobForm.publish}
              </Button>
            </div>
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
