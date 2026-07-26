import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Search, BookOpen, TrendingUp, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/search")({
  head: () => ({
    meta: [
      { title: "Search Engine Control — KaziLink Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSearchPage,
});

function AdminSearchPage() {
  const { isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const { t } = useT();
  const qc = useQueryClient();

  const [term, setTerm] = useState("");
  const [synonymsText, setSynonymsText] = useState("");
  const [lang, setLang] = useState<"en" | "sw">("en");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) void nav({ to: "/dashboard" });
  }, [loading, isAdmin, nav]);

  const synonymsQ = useQuery({
    queryKey: ["admin-synonyms"],
    enabled: isAdmin,
    queryFn: async () =>
      (await supabase.from("search_synonyms").select("*").order("created_at", { ascending: false }))
        .data ?? [],
  });

  const trendingQ = useQuery({
    queryKey: ["admin-trending"],
    enabled: isAdmin,
    queryFn: async () =>
      (
        await supabase
          .from("trending_searches")
          .select("*")
          .order("search_count", { ascending: false })
          .limit(20)
      ).data ?? [],
  });

  const addSynonym = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !synonymsText.trim()) {
      return toast.error("Please fill term and synonyms");
    }

    setAdding(true);
    try {
      const synArray = synonymsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const { error } = await supabase.from("search_synonyms").insert({
        term: term.trim().toLowerCase(),
        synonyms: synArray,
        language: lang,
      });
      if (error) throw error;
      toast.success("Synonym mapping added");
      setTerm("");
      setSynonymsText("");
      await qc.invalidateQueries({ queryKey: ["admin-synonyms"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Search className="h-7 w-7 text-primary" /> Enterprise Search & Discovery Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage PostgreSQL tsvector full-text search, bilingual synonyms dictionary, and search
            analytics.
          </p>
        </div>

        {/* Add Synonym Mapping */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Add Bilingual Search Synonym Mapping
            </CardTitle>
            <CardDescription>
              Normalize English and Kiswahili job search terms (e.g. mhasibu = accountant)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addSynonym} className="grid gap-4 sm:grid-cols-[1fr_2fr_auto_auto]">
              <div>
                <Label>Term</Label>
                <Input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="e.g. driver"
                  required
                />
              </div>
              <div>
                <Label>Synonyms (comma separated)</Label>
                <Input
                  value={synonymsText}
                  onChange={(e) => setSynonymsText(e.target.value)}
                  placeholder="dereva, chauffeur, bus driver"
                  required
                />
              </div>
              <div>
                <Label>Language</Label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as "en" | "sw")}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="en">English</option>
                  <option value="sw">Kiswahili</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={adding} className="gap-1">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </form>

            <div className="mt-6 space-y-2">
              {synonymsQ.data?.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm"
                >
                  <div>
                    <span className="font-semibold">{s.term}</span>
                    <span className="text-muted-foreground ml-2">→ {s.synonyms?.join(", ")}</span>
                  </div>
                  <Badge variant="outline">{s.language.toUpperCase()}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending Searches */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Trending Search Terms
            </CardTitle>
            <CardDescription>
              Real-time analytics of most searched terms across Tanzania
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendingQ.data?.map((t) => (
                <Badge key={t.id} variant="secondary" className="px-3 py-1.5 text-xs">
                  {t.term}{" "}
                  <span className="ml-1 text-[10px] text-muted-foreground">({t.search_count})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
