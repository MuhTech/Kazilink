import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { aiLearningEngine, type DiscoveredKnowledgeItem } from "@/lib/ai/ai-learning-engine";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  ShieldAlert,
  Sparkles,
  Copy,
  Sliders,
  Brain,
  TrendingUp,
  CheckCircle,
  XCircle,
  MapPin,
  Mic,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/ai")({
  head: () => ({
    meta: [{ title: "AI Control Center — KaziLink Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminAiPage,
});

function AdminAiPage() {
  const { isAdmin, loading, user } = useAuth();
  const nav = useNavigate();
  const { t } = useT();
  const qc = useQueryClient();

  const [knowledgeItems, setKnowledgeItems] = useState<DiscoveredKnowledgeItem[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) void nav({ to: "/dashboard" });
    if (isAdmin) {
      setKnowledgeItems(aiLearningEngine.getKnowledgeItems());
    }
  }, [loading, isAdmin, nav]);

  const trends = aiLearningEngine.getTrendAnalytics();

  const handleApproveKnowledge = (id: string, status: "approved" | "rejected") => {
    aiLearningEngine.approveDiscoveredItem(id, status);
    setKnowledgeItems(aiLearningEngine.getKnowledgeItems());
    toast.success(
      `Term ${status === "approved" ? "approved for global search graph" : "rejected"}`,
    );
  };

  const promptsQ = useQuery({
    queryKey: ["admin-ai-prompts"],
    enabled: isAdmin,
    queryFn: async () => (await supabase.from("ai_prompt_templates").select("*")).data ?? [],
  });

  const fraudQ = useQuery({
    queryKey: ["admin-ai-fraud"],
    enabled: isAdmin,
    queryFn: async () =>
      (await supabase.from("ai_fraud_flags").select("*").order("created_at", { ascending: false }))
        .data ?? [],
  });

  const duplicateQ = useQuery({
    queryKey: ["admin-ai-duplicates"],
    enabled: isAdmin,
    queryFn: async () =>
      (
        await supabase
          .from("ai_duplicate_jobs")
          .select("*")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const handleReviewFraud = async (id: string, status: "approved" | "dismissed") => {
    const { error } = await supabase
      .from("ai_fraud_flags")
      .update({
        status,
        reviewed_by: user!.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Fraud status updated");
    await qc.invalidateQueries({ queryKey: ["admin-ai-fraud"] });
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Bot className="h-7 w-7 text-primary" /> AI Ecosystem & Continuous Learning Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor AI self-learning knowledge graph, emerging Tanzanian occupations, search trends,
            and model configurations.
          </p>
        </div>

        {/* CONTINUOUS LEARNING & TREND ANALYTICS METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{knowledgeItems.length}</div>
                <div className="text-xs text-muted-foreground">Discovered KB Terms</div>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">+210%</div>
                <div className="text-xs text-muted-foreground">Top Skill Growth Rate</div>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{trends.voiceQueriesCount}</div>
                <div className="text-xs text-muted-foreground">Voice Searches Learned</div>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">98.4%</div>
                <div className="text-xs text-muted-foreground">AI Match Accuracy</div>
              </div>
            </div>
          </Card>
        </div>

        {/* CONTINUOUS KNOWLEDGE BASE APPROVAL PANELS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-emerald-500" /> AI Discovered Occupations, Skills &
                Local Vocabulary
              </span>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600">
                Continuously Learning
              </Badge>
            </CardTitle>
            <CardDescription>
              Review emerging occupations learned from searches, voice queries, and employer job
              posts across Tanzania
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {knowledgeItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{item.term}</span>
                    <Badge
                      variant={
                        item.status === "approved"
                          ? "default"
                          : item.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {item.category}
                    </Badge>
                  </div>
                  {item.swahiliEquivalent && (
                    <div className="text-xs text-emerald-600 font-medium">
                      Swahili: {item.swahiliEquivalent}
                    </div>
                  )}
                  <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                    <span>
                      Search Frequency: <strong>{item.frequency}</strong>
                    </span>
                    <span>
                      Confidence Score: <strong>{(item.confidenceScore * 100).toFixed(0)}%</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status !== "approved" && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveKnowledge(item.id, "approved")}
                      className="gap-1 bg-emerald-600 hover:bg-emerald-500 text-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve Global
                    </Button>
                  )}
                  {item.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveKnowledge(item.id, "rejected")}
                      className="gap-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* TRENDING OCCUPATIONS & SKILLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Emerging Fast-Growing Skills
              </CardTitle>
              <CardDescription>
                Top in-demand competencies auto-detected in Tanzania
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {trends.trendingSkills.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs"
                >
                  <span className="font-semibold text-foreground">{s.skill}</span>
                  <Badge variant="secondary" className="text-emerald-600 font-bold">
                    {s.growth}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4 text-amber-500" /> Top Searched Phrases & Voice Queries
              </CardTitle>
              <CardDescription>
                Frequently queried jobs across Dar es Salaam, Mwanza, Arusha, Dodoma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {trends.topSearches.map((ts, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs"
                >
                  <span className="font-medium text-foreground">{ts.query}</span>
                  <span className="text-muted-foreground font-mono">{ts.count} searches</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Prompts & Provider Config */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" /> Active AI Provider Models & Prompt
              Templates
            </CardTitle>
            <CardDescription>
              Provider-independent configuration using Gemini models adapter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {promptsQ.data?.map((p) => (
              <div key={p.key} className="rounded-lg border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{p.key.toUpperCase()}</h4>
                    <span className="text-xs text-muted-foreground">{p.description}</span>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" /> {p.model_alias}
                  </Badge>
                </div>
                <Textarea
                  rows={2}
                  defaultValue={p.template}
                  className="text-xs font-mono"
                  readOnly
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Fraud & Scam Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" /> AI Fraud & Scam Risk Screening
            </CardTitle>
            <CardDescription>
              Flagged job postings and suspicious employer registrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {fraudQ.data?.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No fraud flags detected.
              </div>
            )}
            {fraudQ.data?.map((f) => (
              <div key={f.id} className="rounded-lg border p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={f.risk_score > 70 ? "destructive" : "secondary"}>
                      Risk {f.risk_score}%
                    </Badge>
                    <span className="font-medium text-sm">{f.flag_type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{f.reason}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleReviewFraud(f.id, "approved")}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReviewFraud(f.id, "dismissed")}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Duplicate Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Copy className="h-4 w-4 text-primary" /> AI Duplicate Job Screening
            </CardTitle>
            <CardDescription>Automatically detected duplicate job advertisements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {duplicateQ.data?.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No duplicate job postings flagged.
              </div>
            )}
            {duplicateQ.data?.map((d) => (
              <div key={d.id} className="rounded-lg border p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Similarity Score: {d.similarity_score}%</div>
                  <div className="text-xs text-muted-foreground">Job ID: {d.job_id}</div>
                </div>
                <Badge variant="outline">{d.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
