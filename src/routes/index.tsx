import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppNav } from "@/components/AppNav";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { VoiceAssistantModal } from "@/components/ai/VoiceAssistantModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useT } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TANZANIA_REGIONS } from "@/lib/search/search-service";
import {
  Search,
  MapPin,
  Building2,
  ArrowRight,
  Briefcase,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  TrendingUp,
  Cpu,
  GraduationCap,
  HeartPulse,
  Truck,
  Pickaxe,
  Wheat,
  Bot,
  Mic,
  Smartphone,
  Star,
  ChevronRight,
  Zap,
  Globe,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KaziLink Tanzania — Premier AI-Powered Job & Recruitment Platform" },
      {
        name: "description",
        content:
          "Connecting qualified Tanzanian professionals with top verified employers. Search jobs, build CVs with AI, and get hired across all 31 regions.",
      },
      { property: "og:title", content: "KaziLink Tanzania" },
      {
        property: "og:description",
        content: "Connecting Skills with Opportunities Across Tanzania.",
      },
    ],
  }),
  component: Home,
});

export function Home() {
  const { t, lang } = useT();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Fetch job categories
  const categoriesQ = useQuery({
    queryKey: ["home-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_categories")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch featured / recent jobs
  const jobsQ = useQuery({
    queryKey: ["home-featured-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id, slug, title, location, employment_type, salary_min, salary_max, published_at, is_urgent, is_featured, companies(id, name, logo_url, is_verified)",
        )
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch featured employers
  const companiesQ = useQuery({
    queryKey: ["home-featured-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, logo_url, is_verified, location, industry")
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch live stats from database
  const statsQ = useQuery({
    queryKey: ["home-live-stats"],
    queryFn: async () => {
      const [{ count: totalJobs }, { count: totalCompanies }, { count: totalProfiles }] =
        await Promise.all([
          supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("status", "published"),
          supabase.from("companies").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
        ]);

      return {
        jobsCount: totalJobs || 0,
        companiesCount: totalCompanies || 0,
        profilesCount: totalProfiles || 0,
      };
    },
  });

  // Category Icon Resolver
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "technology-ict":
        return <Cpu className="w-5 h-5 text-emerald-500" />;
      case "banking-finance":
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case "healthcare-medical":
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case "education-teaching":
        return <GraduationCap className="w-5 h-5 text-amber-500" />;
      case "logistics-transport":
        return <Truck className="w-5 h-5 text-indigo-500" />;
      case "mining-energy":
        return <Pickaxe className="w-5 h-5 text-orange-500" />;
      case "agriculture":
        return <Wheat className="w-5 h-5 text-emerald-600" />;
      default:
        return <Briefcase className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <AppNav />

      <main className="space-y-16 pb-16">
        {/* HERO SECTION WITH ANIMATED SLIDESHOW */}
        <HeroSlideshow onOpenVoiceModal={() => setIsVoiceModalOpen(true)} />

        {/* PLATFORM METRICS STAT BAR */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border/60 bg-card/60 backdrop-blur p-4 text-center hover:border-primary/40 transition shadow-sm hover:shadow-md">
              <Users className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {statsQ.data?.profilesCount ? `${statsQ.data.profilesCount}+` : "100+"}
              </p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {lang === "sw" ? "Watafuta Kazi Waliyothibitishwa" : "Active Job Seekers"}
              </p>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur p-4 text-center hover:border-primary/40 transition shadow-sm hover:shadow-md">
              <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {statsQ.data?.companiesCount ? `${statsQ.data.companiesCount}+` : "10+"}
              </p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {lang === "sw" ? "Waajiri Waliyosajiliwa" : "Verified Employers"}
              </p>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur p-4 text-center hover:border-primary/40 transition shadow-sm hover:shadow-md">
              <Briefcase className="w-6 h-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {statsQ.data?.jobsCount ? `${statsQ.data.jobsCount}` : "15+"}
              </p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {lang === "sw" ? "Nafasi za Kazi Zilizopo" : "Live Job Vacancies"}
              </p>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur p-4 text-center hover:border-primary/40 transition shadow-sm hover:shadow-md">
              <Globe className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
              <p className="text-2xl font-bold tracking-tight text-foreground">
                31 {lang === "sw" ? "Mikoa" : "Regions"}
              </p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {lang === "sw" ? "Kote Tanzania Bara & Zanzibar" : "Full Coverage Across Tanzania"}
              </p>
            </Card>
          </div>
        </section>

        {/* POPULAR JOB CATEGORIES */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-500">
                <Zap className="w-4 h-4" />
                <span>{lang === "sw" ? "Sekta Zinazokua Kwa Kasi" : "High Growth Sectors"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                {t.home.featured}
              </h2>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5 self-start md:self-auto">
              <Link to="/jobs">
                <span>{lang === "sw" ? "Angalia Sekta Zote" : "View All Categories"}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoriesQ.data?.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to="/jobs"
                search={{ category: cat.slug }}
                className="group p-5 rounded-2xl border border-border/70 bg-card hover:bg-accent/40 hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 rounded-xl bg-muted/60 w-fit group-hover:bg-primary/10 transition">
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <h3 className="mt-4 font-bold text-foreground text-base group-hover:text-primary transition">
                    {lang === "sw" ? cat.name_sw : cat.name_en}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {lang === "sw"
                      ? `Fursa za kazi katika sekta ya ${cat.name_sw}.`
                      : `Career opportunities in ${cat.name_en}.`}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-medium text-emerald-500 group-hover:translate-x-1 transition-transform">
                  <span>{lang === "sw" ? "Tazama Fursa" : "Explore Openings"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* LATEST VERIFIED JOBS */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-500">
                <Briefcase className="w-4 h-4" />
                <span>{lang === "sw" ? "Nafasi Mpya Za Kazi" : "Fresh Job Openings"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                {lang === "sw"
                  ? "Kazi Mpya Zilizothibitishwa"
                  : "Latest Verified Job Opportunities"}
              </h2>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5 self-start md:self-auto">
              <Link to="/jobs">
                <span>{lang === "sw" ? "Tazama Kazi Zote" : "Browse All Jobs"}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobsQ.data?.map((j) => (
              <Card
                key={j.id}
                className="group border-border/70 bg-card hover:border-primary/60 hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-lg shrink-0">
                        {j.companies?.name?.slice(0, 2).toUpperCase() || "KZ"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <span>{j.companies?.name || "Verified Enterprise"}</span>
                          {j.companies?.is_verified && (
                            <CheckCircle2
                              className="w-3.5 h-3.5 text-emerald-500"
                              aria-label="Verified Employer"
                            />
                          )}
                        </div>
                        <h3 className="font-bold text-foreground text-base group-hover:text-primary transition line-clamp-1 mt-0.5">
                          {j.title}
                        </h3>
                      </div>
                    </div>

                    {j.is_urgent && (
                      <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] uppercase tracking-wider font-semibold">
                        Urgent
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-medium">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {j.location || "Dar es Salaam"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-medium capitalize">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                      {j.employment_type?.replace("_", " ")}
                    </span>
                    {j.salary_min && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                        TZS {Number(j.salary_min).toLocaleString()}
                        {j.salary_max ? ` - ${Number(j.salary_max).toLocaleString()}` : ""}
                      </span>
                    )}
                  </div>
                </CardContent>

                <div className="px-5 py-3.5 bg-muted/30 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {new Date((j as any).published_at ?? (j as any).created_at ?? new Date().toISOString()).toLocaleDateString(
                      lang === "sw" ? "sw-TZ" : "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </span>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="h-8 text-primary font-semibold hover:bg-primary/10 gap-1"
                  >
                    <Link to="/jobs/$slug" params={{ slug: j.slug }}>
                      <span>{t.jobs.apply}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* AI-POWERED CAREER SUITE BANNER */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-card to-accent/10 p-6 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                  <Bot className="w-4 h-4" />
                  <span>KaziLink AI Assistant & Voice Search</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  {lang === "sw"
                    ? "Tengeneza CV na Tafuta Kazi Kwa Sauti ya Kiswahili"
                    : "Build CVs & Voice Search Jobs in English or Kiswahili"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  {lang === "sw"
                    ? "Mfumo wetu wa AI unakusaidia kutoa taarifa kutoka kwenye CV yako kiotomatiki, kupata maoni ya usahili (interviews), na kutafuta kazi kwa kusema kwa sauti."
                    : "Our bilingual AI engine auto-extracts your skills from uploaded resumes, offers instant interview prep in Kiswahili, and lets you search jobs by voice."}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    asChild
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl gap-2"
                  >
                    <Link to="/jobs">
                      <Mic className="w-4 h-4" />
                      <span>
                        {lang === "sw" ? "Jaribu Search Ya Sauti" : "Try Swahili Voice Search"}
                      </span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-border/80 rounded-xl gap-2"
                  >
                    <Link to="/dashboard">
                      <Bot className="w-4 h-4 text-primary" />
                      <span>{lang === "sw" ? "Mshauri wa Kazi wa AI" : "AI Career Advisor"}</span>
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-4 bg-card/90 border border-border/80 p-5 rounded-2xl shadow-md space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">AI Match Score Engine</p>
                    <p className="text-[11px] text-muted-foreground">Algorithmic Fit Matrix</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground">Skills Match</span>
                    <span className="text-emerald-500 font-bold">96%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[96%]" />
                  </div>

                  <div className="flex justify-between font-medium pt-1">
                    <span className="text-muted-foreground">Region Proximity (Dar)</span>
                    <span className="text-blue-500 font-bold">100%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[100%]" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* HOW KAZILINK WORKS (DUAL-TRACK) */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {lang === "sw" ? "Jinsi KaziLink Inavyofanya Kazi" : "How KaziLink Works"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {lang === "sw"
                ? "Hatua tatu rahisi kupata kazi mpya au kuajiri wafanyakazi mahiri nchini Tanzania."
                : "Three simple steps to secure your next role or hire qualified Tanzanian talent."}
            </p>
          </div>

          <Tabs defaultValue="jobseeker" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/60 rounded-xl mb-6">
              <TabsTrigger
                value="jobseeker"
                className="rounded-lg font-semibold text-xs sm:text-sm"
              >
                {lang === "sw" ? "Kwa Wanaotafuta Kazi" : "For Job Seekers"}
              </TabsTrigger>
              <TabsTrigger value="employer" className="rounded-lg font-semibold text-xs sm:text-sm">
                {lang === "sw" ? "Kwa Waajiri & Makampuni" : "For Employers & Enterprises"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jobseeker" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/60 bg-card p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center text-lg">
                  1
                </div>
                <h3 className="font-bold text-base text-foreground">
                  {lang === "sw" ? "Fungua Akaunti & Weka CV" : "Create Profile & Upload CV"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "sw"
                    ? "Pakia CV yako kwa PDF au ongeza ujuzi na elimu yako kwa msaada wa AI."
                    : "Upload your existing resume or let our AI auto-extract your skills and experience."}
                </p>
              </Card>

              <Card className="border-border/60 bg-card p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 font-bold flex items-center justify-center text-lg">
                  2
                </div>
                <h3 className="font-bold text-base text-foreground">
                  {lang === "sw" ? "Omba Kazi za Uhakika" : "Apply to Matching Jobs"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "sw"
                    ? "Tafuta kazi kwa mkoa, sekta, au sauti ya Kiswahili na utume maombi kwa mbofyo mmoja."
                    : "Browse verified vacancies by region, category, or voice search and apply instantly."}
                </p>
              </Card>

              <Card className="border-border/60 bg-card p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center text-lg">
                  3
                </div>
                <h3 className="font-bold text-base text-foreground">
                  {lang === "sw" ? "Fanya Usahili & Pata Ajira" : "Prep Interviews & Get Hired"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "sw"
                    ? "Pata taarifa za usahili (interviews) na ushauri wa AI kufanikisha mkataba wako."
                    : "Receive instant interview invites and leverage AI career tools to land your contract."}
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="employer" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/60 bg-card p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 font-bold flex items-center justify-center text-lg">
                  1
                </div>
                <h3 className="font-bold text-base text-foreground">
                  {lang === "sw" ? "Thibitisha Kampuni Yako" : "Verify Company Profile"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "sw"
                    ? "Sajili kampuni yako ili upate beji ya mwajiri aliyethibitishwa (Verified Employer)."
                    : "Register your organization to earn the official Verified Employer trust badge."}
                </p>
              </Card>

              <Card className="border-border/60 bg-card p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 font-bold flex items-center justify-center text-lg">
                  2
                </div>
                <h3 className="font-bold text-base text-foreground">
                  {lang === "sw" ? "Tangaza Nafasi za Kazi" : "Post Job Openings"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "sw"
                    ? "Weka maelezo ya kazi na upokee maombi kutoka kwa maelfu ya Watanzania."
                    : "Publish job descriptions and reach top candidates across Dar, Arusha, Mwanza & Dodoma."}
                </p>
              </Card>

              <Card className="border-border/60 bg-card/90 p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center text-lg">
                  3
                </div>
                <h3 className="font-bold text-base text-foreground">
                  {lang === "sw" ? "Rangisha Wanaoomba na AI" : "AI Candidate Ranking"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "sw"
                    ? "Tumia AI kutambua watengenezaji bora zaidi kulingana na ujuzi na uzoefu."
                    : "Rank applicants automatically by relevance, skills match, and verified background."}
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* TESTIMONIALS & SUCCESS STORIES */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {lang === "sw" ? "Shuhuda za Watanzania" : "Tanzanian Success Stories"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {lang === "sw"
                ? "Tazama jinsi KaziLink ilivyosaidia watafuta kazi na makampuni kufikia malengo yao."
                : "Real stories from professionals and enterprise recruiters across the nation."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/70 bg-card p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                "
                {lang === "sw"
                  ? "Nilipata kazi yangu ya Senior Accountant ndani ya siku 5 baada ya kupakia CV. Mfumo wa AI wa Kiswahili ulinisaidia sana kujiandaa na usahili!"
                  : "I landed my Senior Accountant role within 5 days of uploading my CV. The AI career advisor helped me prepare for my technical interviews effortlessly."}
                "
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-600 font-bold flex items-center justify-center text-xs">
                  JM
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Josephat Mushi</p>
                  <p className="text-[11px] text-muted-foreground">
                    Senior Accountant — Dar es Salaam
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-border/70 bg-card p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                "
                {lang === "sw"
                  ? "Kama kampuni ya IT Arusha, kupata waandishi wa programu waliyofuzu ilikuwa changamoto. KaziLink AI Candidate Ranking ilituwezesha kuajiri haraka sana."
                  : "As an enterprise in Arusha, finding vetted software developers was tough. KaziLink's AI Candidate Ranking saved our HR team weeks of manual CV reviewing."}
                "
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-600 font-bold flex items-center justify-center text-xs">
                  SK
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Sarah Kimaro</p>
                  <p className="text-[11px] text-muted-foreground">
                    HR Director — Arusha Innovations
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-border/70 bg-card p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                "
                {lang === "sw"
                  ? "Uwezo wa kutafuta kazi kwa sauti ya Kiswahili kutoka kwenye simu yangu ni kitu cha kipekee mno. Nimepata kazi Mwanza bila shida kabisa."
                  : "Being able to search jobs using Swahili voice commands right on my mobile browser was incredible. I secured a logistics supervisor job in Mwanza."}
                "
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-600 font-bold flex items-center justify-center text-xs">
                  AM
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Amina Masanja</p>
                  <p className="text-[11px] text-muted-foreground">Logistics Supervisor — Mwanza</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {lang === "sw" ? "Maswali Yanayoulizwa Mara kwa Mara" : "Frequently Asked Questions"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {lang === "sw"
                ? "Majibu ya haraka kuhusu matumizi ya KaziLink Tanzania."
                : "Quick answers to help you navigate our bilingual employment ecosystem."}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem
              value="item-1"
              className="border border-border/80 rounded-xl px-4 bg-card"
            >
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                {lang === "sw"
                  ? "Je, huduma za KaziLink ni za bure kwa wanaotafuta kazi?"
                  : "Is KaziLink free for job seekers?"}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                {lang === "sw"
                  ? "Naam! Kutafuta kazi, kupakia CV, kupata ushauri wa AI, na kutuma maombi ni bure kabisa kwa watafuta kazi wote Tanzania."
                  : "Yes! Searching jobs, uploading resumes, using our AI Career Advisor, and applying to verified postings is 100% free for all job seekers across Tanzania."}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="border border-border/80 rounded-xl px-4 bg-card"
            >
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                {lang === "sw"
                  ? "Mwaajiri anawezaje kuthibitisha akaunti yake?"
                  : "How do employers get verified?"}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                {lang === "sw"
                  ? "Waajiri wanaweza kutoa namba ya usajili wa BRELA, TIN ya TRA, na barua pepe ya kampuni ili kupata beji ya 'Verified Employer'."
                  : "Employers submit their BRELA registration details, TRA TIN, and corporate email to earn the Verified Employer trust badge."}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="border border-border/80 rounded-xl px-4 bg-card"
            >
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                {lang === "sw"
                  ? "Je, mfumo wa Search ya Sauti unasaidia Kiswahili?"
                  : "Does Voice Search support Kiswahili?"}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                {lang === "sw"
                  ? "Ndiyo, unaweza kubofya aikoni ya maikrofoni kwenye menyu na kuongea kwa Kiswahili au Kiingereza kutafuta kazi kwa haraka."
                  : "Yes, our voice assistant understands natural spoken Kiswahili and English to quickly query positions."}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-4"
              className="border border-border/80 rounded-xl px-4 bg-card"
            >
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                {lang === "sw"
                  ? "KaziLink inafanya kazi katika mikoa gani?"
                  : "Which Tanzanian regions are covered?"}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                {lang === "sw"
                  ? "Tunahudumia mikoa yote 31 ya Tanzania ikiwemo Dar es Salaam, Arusha, Mwanza, Dodoma, Kilimanjaro, Mbeya, Tanga, na Zanzibar."
                  : "We cover all 31 regions of Tanzania including Dar es Salaam, Arusha, Mwanza, Dodoma, Kilimanjaro, Mbeya, Tanga, and Zanzibar."}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card/80 mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="space-y-3 lg:col-span-2">
              <div className="flex items-center gap-2 font-bold text-foreground text-lg">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Briefcase className="h-4 w-4" />
                </span>
                <span>{t.brand}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                {t.tagline}.{" "}
                {lang === "sw"
                  ? "Inaunganisha ujuzi na fursa za ajira nchi nzima kuanzia Dar es Salaam na Dodoma hadi Zanzibar."
                  : "Connecting top talent with enterprise employers across Tanzania from Dar es Salaam to Zanzibar."}
              </p>

              {/* Social & Contact Links */}
              <div className="pt-2 flex items-center gap-3 text-xs font-medium text-muted-foreground">
                <a
                  href="https://wa.me/255754888999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                {lang === "sw" ? "Wanaotafuta Kazi" : "Job Seekers"}
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link to="/jobs" className="hover:text-primary transition">
                    {t.nav.jobs}
                  </Link>
                </li>
                <li>
                  <Link to="/resources" className="hover:text-primary transition">
                    {lang === "sw" ? "Makala & Mwongozo" : "Career Guides"}
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-primary transition">
                    {lang === "sw" ? "Wasifu & CV Yangu" : "My Profile & CV"}
                  </Link>
                </li>
                <li>
                  <Link to="/applications" className="hover:text-primary transition">
                    {t.nav.applications}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                {lang === "sw" ? "Kwa Waajiri" : "Employers"}
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link
                    to="/pricing"
                    className="hover:text-primary transition font-semibold text-emerald-600"
                  >
                    {lang === "sw" ? "Mipango & Gharama" : "Pricing & Plans"}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auth"
                    search={{ mode: "signup" }}
                    className="hover:text-primary transition"
                  >
                    {t.home.employerCta}
                  </Link>
                </li>
                <li>
                  <Link to="/employer/jobs" className="hover:text-primary transition">
                    {lang === "sw" ? "Dhibiti Nafasi za Kazi" : "Manage Job Postings"}
                  </Link>
                </li>
                <li>
                  <Link to="/employer/companies" className="hover:text-primary transition">
                    {lang === "sw" ? "Uthibitisho wa Kampuni" : "Company Verification"}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                {lang === "sw" ? "Kampuni & Sheria" : "Company & Legal"}
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link to="/about" className="hover:text-primary transition">
                    {lang === "sw" ? "Kuhusu KaziLink" : "About Us"}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary transition">
                    {lang === "sw" ? "Mawasiliano & Msaada" : "Contact & Support"}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary transition">
                    {lang === "sw" ? "Sera ya Faragha" : "Privacy Policy"}
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary transition">
                    {lang === "sw" ? "Masharti ya Huduma" : "Terms of Service"}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
            <p>
              © {new Date().getFullYear()} {t.brand}. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5 font-medium">
              <span>Bilingual (English & Swahili)</span>
              <span>•</span>
              <span>Made with ❤️ for Tanzania 🇹🇿</span>
            </p>
          </div>
        </div>
      </footer>

      <VoiceAssistantModal open={isVoiceModalOpen} onOpenChange={setIsVoiceModalOpen} />
    </div>
  );
}
