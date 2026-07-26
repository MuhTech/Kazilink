import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { useT } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Sparkles,
  Briefcase,
  FileText,
  MapPin,
  TrendingUp,
  ArrowRight,
  Bot,
} from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Career Resources & Job Guides — KaziLink Tanzania" },
      {
        name: "description",
        content:
          "Tanzanian career advice, CV writing guides in Kiswahili and English, interview tips, and regional job market insights.",
      },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { lang } = useT();

  const articles = [
    {
      id: "cv-writing-tanzania",
      title:
        lang === "sw"
          ? "Jinsi ya Kuandika CV Inayopata Kazi Tanzania"
          : "How to Write a Standard Tanzanian CV that Gets Interviews",
      category: "CV & Resume Tips",
      readTime: "5 min read",
      excerpt:
        lang === "sw"
          ? "Jifunze mpangilio sahihi wa CV kwa soko la Tanzania, kuanzia taarifa za elimu, uzoefu, na marejeo (referrees)."
          : "Discover key formatting rules for Tanzanian hiring managers, from referee contact structures to highlighting regional experience.",
    },
    {
      id: "interview-prep-swahili",
      title:
        lang === "sw"
          ? "Mbinu za Kufanikiwa Kwenye Usahili wa Kazi (Interviews)"
          : "Mastering Job Interviews in Both Kiswahili & English",
      category: "Interview Prep",
      readTime: "7 min read",
      excerpt:
        lang === "sw"
          ? "Maswali yanayoulizwa mara kwa mara kwenye usahili wa makampuni ya Dar es Salaam na Arusha, na jinsi ya kujibu kwa kujiamini."
          : "Common interview questions across corporate and public sectors in Tanzania, with bilingual preparation strategies.",
    },
    {
      id: "dar-job-market-2026",
      title:
        lang === "sw"
          ? "Sekta Zinazokua Kwa Kasi Tanzania Mwaka 2026"
          : "High Growth Employment Sectors in Tanzania for 2026",
      category: "Market Insights",
      readTime: "6 min read",
      excerpt:
        lang === "sw"
          ? "Uchambuzi wa fursa katika TEHAMA, Benki, Kilimo Biashara, Uchimbaji Madini (Geita & Kahama), na Usafirishaji."
          : "Analysis of hiring surges across ICT, Renewable Energy, Logistics, Mining corridors, and Agribusiness.",
    },
    {
      id: "ai-career-tools-guide",
      title:
        lang === "sw"
          ? "Jinsi ya Kutumia AI ya KaziLink Kupata Ajira Haraka"
          : "Leveraging KaziLink AI Tools to Boost Your Job Matches",
      category: "Platform Guide",
      readTime: "4 min read",
      excerpt:
        lang === "sw"
          ? "Jifunze jinsi AI yetu inavyochanganua CV yako na kukupa ushauri wa papo hapo wa Kiswahili."
          : "A step-by-step guide to using our Swahili voice search and automatic resume skill extraction.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs">
            {lang === "sw" ? "Makala na Mwongozo wa Kazi" : "Career Advice & Resources"}
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {lang === "sw"
              ? "Mwongozo wa Kufanikiwa Katika Soko la Ajira Tanzania"
              : "Empowering Your Career Journey in Tanzania"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {lang === "sw"
              ? "Makala, ushauri wa CV, na mbinu za usahili zilizoandaliwa mahususi kwa ajili ya mazingira ya kazi ya Tanzania."
              : "Expert career guides, resume tips, and job market trends tailored specifically for Tanzanian professionals."}
          </p>
        </div>

        {/* AI CAREER ASSISTANT BANNER */}
        <Card className="border-primary/30 bg-gradient-to-r from-emerald-500/10 via-card to-blue-500/10 p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <Bot className="w-4 h-4" />
              <span>Interactive AI Advisor</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {lang === "sw"
                ? "Unahitaji Ushauri wa Papo Hapo?"
                : "Need Personalized Career Advice?"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl">
              {lang === "sw"
                ? "Uliza msaidizi wetu wa AI swali lolote kuhusu CV, mshahara wa Tanzania, au maandalizi ya usahili kwa Kiswahili au Kiingereza."
                : "Ask our bilingual AI Career Advisor any question about resume formatting, salary expectations in Dar or Dodoma, or interview prep."}
            </p>
          </div>

          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2 font-semibold shrink-0"
          >
            <Link to="/jobs">
              <Sparkles className="w-4 h-4" />
              <span>{lang === "sw" ? "Uliza AI Sasa" : "Launch AI Assistant"}</span>
            </Link>
          </Button>
        </Card>

        {/* ARTICLES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art) => (
            <Card
              key={art.id}
              className="border-border/80 bg-card p-6 rounded-2xl space-y-4 hover:border-primary/50 transition shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="text-[11px] font-semibold text-emerald-600 border-emerald-500/30"
                  >
                    {art.category}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">{art.readTime}</span>
                </div>
                <h3 className="font-bold text-lg text-foreground hover:text-primary transition">
                  {art.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                <span>{lang === "sw" ? "Soma Zaidi" : "Read Full Guide"}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
