import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { searchService, TANZANIA_REGIONS } from "@/lib/search/search-service";
import { unifiedGlobalSearchEngine } from "@/lib/search/unified-global-search";
import { aiService } from "@/lib/ai/ai-service";
import { GlobalJobMap } from "@/components/maps/GlobalJobMap";
import {
  Building2,
  MapPin,
  Clock,
  Sparkles,
  BookmarkPlus,
  Search,
  Globe,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { SearchResultItem } from "@/types";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  region: z.string().optional(),
  type: z.string().optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().optional(),
});

export const Route = createFileRoute("/jobs")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Browse & Search Jobs — KaziLink Tanzania" },
      {
        name: "description",
        content:
          "Enterprise job search engine across all Tanzanian regions and global aggregated sources with AI candidate matching.",
      },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const { user } = useAuth();
  const { t, lang } = useT();
  const qc = useQueryClient();

  const [q, setQ] = useState(search.q ?? "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "recommendations" | "map">("all");

  // Fetch AI smart autocomplete suggestions when user types
  useEffect(() => {
    if (!q || q.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchService.getSuggestions(q, lang === "sw" ? "sw" : "en");
      setSuggestions(results);
    }, 150);
    return () => clearTimeout(timer);
  }, [q, lang]);

  const catsQ = useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await supabase.from("job_categories").select("*").eq("active", true).order("sort_order"))
        .data ?? [],
  });

  const profileQ = useQuery({
    queryKey: ["profile-skills", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const p = (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data;
      const skills =
        (await supabase.from("user_skills").select("skill").eq("user_id", user!.id)).data?.map(
          (s) => s.skill,
        ) || [];
      return { ...p, skills };
    },
  });

  const searchResultsQ = useQuery({
    queryKey: ["jobs-global-search", search, lang],
    queryFn: async () => {
      const res = await unifiedGlobalSearchEngine.searchGlobalJobs({
        q: search.q,
        region: search.region,
        type: search.type as any,
        remoteOnly: search.remote,
        salaryMin: search.salaryMin,
        language: lang === "sw" ? "sw" : "en",
      });

      // Log search for analytics
      if (search.q) {
        void searchService.logSearch(user?.id, search.q, search, res.total);
      }

      return res;
    },
  });

  const recommendationsQ = useQuery({
    queryKey: ["ai-job-recommendations", user?.id, searchResultsQ.data?.items],
    enabled: !!user && !!searchResultsQ.data?.items && searchResultsQ.data.items.length > 0,
    queryFn: async () => {
      if (!profileQ.data || !searchResultsQ.data?.items) return [];
      return aiService.getRecommendations(profileQ.data, searchResultsQ.data.items);
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void nav({ search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, q: q || undefined }) });
  };

  const saveSearchAlert = async () => {
    if (!user) return toast.error("Please sign in to save search alerts");
    try {
      const { error } = await supabase.from("saved_searches").insert({
        user_id: user.id,
        name: q ? `Search: ${q}` : "Custom Job Alert",
        query_text: q,
        filters: search,
      });
      if (error) throw error;
      toast.success("Saved search alert created!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const jobs = searchResultsQ.data?.items ?? [];
  const empty = !searchResultsQ.isLoading && jobs.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Global Unified Search Engine</span>
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{t.jobs.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Search local Tanzanian vacancies and aggregated international feeds seamlessly.
            </p>
          </div>
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={saveSearchAlert}
              className="gap-2 shrink-0 rounded-xl"
            >
              <BookmarkPlus className="h-4 w-4 text-primary" /> {t.jobs.saveSearch}
            </Button>
          )}
        </div>

        {/* Search Bar & Filters */}
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={t.jobs.search}
              className="pl-9 rounded-xl bg-card"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between border-b">
                  <span>AI Smart Suggestions</span>
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                </div>
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setQ(sug);
                      setShowSuggestions(false);
                      void nav({ search: (p) => ({ ...p, q: sug }) });
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted/60 transition flex items-center gap-2 text-foreground font-medium"
                  >
                    <Search className="w-3 h-3 text-muted-foreground" />
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Select
            value={search.region ?? "__all__"}
            onValueChange={(v) =>
              nav({
                search: (p: z.infer<typeof searchSchema>) => ({
                  ...p,
                  region: v === "__all__" ? undefined : v,
                }),
              })
            }
          >
            <SelectTrigger className="w-[170px] rounded-xl bg-card">
              <SelectValue placeholder={t.jobs.filterRegion} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t.jobs.allRegions}</SelectItem>
              {TANZANIA_REGIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={search.category ?? "__all__"}
            onValueChange={(v) =>
              nav({
                search: (p: z.infer<typeof searchSchema>) => ({
                  ...p,
                  category: v === "__all__" ? undefined : v,
                }),
              })
            }
          >
            <SelectTrigger className="w-[170px] rounded-xl bg-card">
              <SelectValue placeholder={t.jobs.filterCategory} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t.jobs.allCategories}</SelectItem>
              {catsQ.data?.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={search.type ?? "__all__"}
            onValueChange={(v) =>
              nav({
                search: (p: z.infer<typeof searchSchema>) => ({
                  ...p,
                  type: v === "__all__" ? undefined : v,
                }),
              })
            }
          >
            <SelectTrigger className="w-[160px] rounded-xl bg-card">
              <SelectValue placeholder={t.jobs.filterType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t.jobs.allTypes}</SelectItem>
              {["full_time", "part_time", "contract", "internship", "temporary", "freelance"].map(
                (v) => (
                  <SelectItem key={v} value={v}>
                    {v.replace("_", " ")}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <label className="flex items-center gap-2 rounded-xl border px-3 text-xs font-semibold bg-card">
            <Checkbox
              checked={!!search.remote}
              onCheckedChange={(c) =>
                nav({
                  search: (p: z.infer<typeof searchSchema>) => ({
                    ...p,
                    remote: c ? true : undefined,
                  }),
                })
              }
            />
            {t.jobs.filterRemote}
          </label>
        </form>

        {/* Tabs for All Jobs vs AI Recommendations vs Interactive Map */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="all">
              All Jobs ({searchResultsQ.data?.total || 0})
            </TabsTrigger>
            {user && (
              <TabsTrigger value="recommendations" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> {t.jobs.recommendations}
              </TabsTrigger>
            )}
            <TabsTrigger value="map" className="gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Global Interactive Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-4">
            {searchResultsQ.isLoading && (
              <div className="text-sm text-muted-foreground">{t.empty.loading}</div>
            )}
            {searchResultsQ.isError && (
              <div className="text-sm text-destructive">{t.empty.error}</div>
            )}
            {empty && (
              <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                {t.jobs.empty}
              </div>
            )}

            {jobs.map((j) => (
              <JobCard key={j.id} job={j} t={t} />
            ))}
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6 space-y-4">
            {recommendationsQ.isLoading && (
              <div className="text-sm text-muted-foreground">Calculating AI fit scores…</div>
            )}
            {recommendationsQ.data?.map((rec) => (
              <div
                key={rec.job_id}
                className="rounded-2xl border bg-card p-5 space-y-3 hover:border-emerald-500/50 transition"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="gap-1 bg-emerald-600">
                      <Sparkles className="h-3 w-3" /> {rec.match_score}% AI Fit Match
                    </Badge>
                    <span className="text-xs text-muted-foreground">{rec.reasons.join(" • ")}</span>
                  </div>
                </div>
                <JobCard job={rec.job} t={t} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <GlobalJobMap />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function JobCard({ job, t }: { job: SearchResultItem; t: any }) {
  return (
    <Link
      to="/jobs/$slug"
      params={{ slug: job.slug }}
      className="block rounded-2xl border border-border/80 bg-card p-5 transition hover:border-emerald-500/50 hover:shadow-sm space-y-3"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-foreground">{job.title}</h3>
            {job.ai_score && job.ai_score > 90 && (
              <Badge className="bg-emerald-600 text-white text-[10px] h-5 px-1.5">
                <Zap className="w-3 h-3 mr-0.5" />
                <span>{job.ai_score}% Match</span>
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <Building2 className="h-3.5 w-3.5 text-emerald-600" />
              {job.company_name}
            </span>
            {job.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {job.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {job.employment_type.replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {job.is_remote && (
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 text-[10px]">
              Remote
            </Badge>
          )}
          {job.company_verified && (
            <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-[10px]">
              Verified
            </Badge>
          )}
        </div>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {job.skills.map((skill) => (
            <span key={skill} className="px-2 py-0.5 rounded-md bg-muted/60 text-[11px] font-medium text-muted-foreground">
              {skill}
            </span>
          ))}
        </div>
      )}

      {(job.salary_min || job.salary_max) && (
        <div className="pt-2 border-t border-border/60 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
          {t.jobs.salary}: {job.currency} {Number(job.salary_min ?? 0).toLocaleString()}
          {job.salary_max ? ` – ${Number(job.salary_max).toLocaleString()}` : ""}
        </div>
      )}
    </Link>
  );
}
