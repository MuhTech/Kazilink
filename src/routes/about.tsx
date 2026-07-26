import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { useT } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  ShieldCheck,
  Globe,
  Bot,
  Users,
  CheckCircle2,
  Building2,
  Award,
  Sparkles,
  MapPin,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — KaziLink Tanzania" },
      {
        name: "description",
        content:
          "Learn about KaziLink Tanzania, our mission to connect skilled job seekers with verified employers across all 31 regions using bilingual AI.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { lang } = useT();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* HERO SECTION */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs">
            {lang === "sw" ? "Dhamira Yetu" : "Our Mission"}
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {lang === "sw"
              ? "Kuunganisha Ujuzi na Fursa za Ajira Tanzania"
              : "Bridging Talent and Opportunity Across Tanzania"}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            {lang === "sw"
              ? "KaziLink ni jukwaa la kwanza la ajira nchini Tanzania linalotumia Akili Bandia (AI) ya Kiswahili na Kiingereza kusaidia watafuta kazi na waajiri waliyothibitishwa kupatana kwa haraka na uwazi."
              : "KaziLink is Tanzania’s premier employment ecosystem leveraging bilingual AI (Swahili & English) to connect job seekers with verified employers across all 31 regions with transparency and trust."}
          </p>
        </section>

        {/* CORE PILLARS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/80 bg-card p-6 rounded-2xl space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">
              {lang === "sw" ? "Uthibitisho wa Mwajiri" : "Verified Employers"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {lang === "sw"
                ? "Kila mwajiri anapitiwa kupitia namba ya usajili wa BRELA na TRA TIN ili kulinda watafuta kazi dhidi ya utapeli wa ada za ajira."
                : "Every employer is vetted through BRELA registration and TRA TIN records to protect job seekers from scam recruitment fees."}
            </p>
          </Card>

          <Card className="border-border/80 bg-card p-6 rounded-2xl space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">
              {lang === "sw" ? "Kiswahili na Kiingereza" : "100% Bilingual Platform"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {lang === "sw"
                ? "Jukwaa zima na Msaidizi wa Sauti ya AI vinafanya kazi kwa Kiswahili fasaha na Kiingereza ili kumwezesha kila Mtanzania."
                : "The entire interface, search engine, and AI voice assistant support both Kiswahili and English seamlessly."}
            </p>
          </Card>

          <Card className="border-border/80 bg-card p-6 rounded-2xl space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">
              {lang === "sw" ? "Uchambuzi wa AI wa Ujuzi" : "AI Candidate Matching"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {lang === "sw"
                ? "Teknolojia yetu ya AI inasoma CV kiotomatiki na kuweka daraja la uwazi bila upendeleo wowote."
                : "Our AI engine parses resumes instantly, calculates fit scores transparently, and reduces hiring timelines from weeks to days."}
            </p>
          </Card>
        </section>

        {/* REGIONAL FOOTPRINT */}
        <section className="bg-card border border-border/80 rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <Badge variant="outline" className="text-xs">
                {lang === "sw" ? "Upatikanaji Nchi Nzima" : "Nationwide Reach"}
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {lang === "sw"
                  ? "Kuhudumia Mikoa Yote 31 ya Tanzania Bara na Zanzibar"
                  : "Serving All 31 Administrative Regions Across Mainland & Zanzibar"}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lang === "sw"
                  ? "Kutoka vituo vya biashara vya Dar es Salaam, Dodoma, Arusha, na Mwanza hadi maeneo ya kilimo na uchimbaji madini Geita, Mbeya na Morogoro, KaziLink inawezesha fursa kufika popote."
                  : "From economic hubs in Dar es Salaam, Dodoma, Arusha, and Mwanza to agricultural and mining corridors in Geita, Mbeya, and Morogoro, KaziLink connects talent wherever opportunity lies."}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Dar es Salaam</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Dodoma (Capital)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Arusha & Moshi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Mwanza & Lake Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Mbeya & Southern Highlands</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Zanzibar (Unguja & Pemba)</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-muted/30 border border-border/60 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-500" />
                <span>Our Impact Vision</span>
              </h3>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="p-3 bg-card rounded-xl border border-border/40">
                  <p className="font-bold text-foreground">Zero Illegal Candidate Charges</p>
                  <p>Strict anti-fraud enforcement for 100% free job seeker access.</p>
                </div>
                <div className="p-3 bg-card rounded-xl border border-border/40">
                  <p className="font-bold text-foreground">Local Occupation Recognition</p>
                  <p>
                    Recognizing emerging roles like Solar Technicians, Drone Operators, & Boda
                    Dispatchers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="text-center space-y-4 pt-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            {lang === "sw" ? "Ready to start your journey?" : "Ready to start your journey?"}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2"
            >
              <Link to="/jobs">
                <Briefcase className="w-4 h-4" />
                <span>{lang === "sw" ? "Tafuta Kazi" : "Find Jobs"}</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl gap-2">
              <Link to="/contact">
                <span>{lang === "sw" ? "Mawasiliano" : "Contact Us"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
