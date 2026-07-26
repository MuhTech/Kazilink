import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { useT } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Sparkles,
  Building2,
  ShieldCheck,
  Bot,
  Zap,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Employer Pricing & Plans — KaziLink Tanzania" },
      {
        name: "description",
        content:
          "Transparent pricing plans for Tanzanian employers and HR teams. Free posting tier, AI Candidate Ranking, and enterprise recruitment suites.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { lang } = useT();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs">
            {lang === "sw" ? "Gharama na Mipango ya Waajiri" : "Employer Recruitment Plans"}
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {lang === "sw"
              ? "Gharama za Wazi kwa Waajiri na Makampuni"
              : "Simple, Transparent Hiring Plans"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {lang === "sw"
              ? "Wanaotafuta kazi hutumia KaziLink BURE kabisa. Waajiri hupata nafasi za bure na vifurushi vya AI vya kuongeza kasi ya kuajiri."
              : "Job seekers use KaziLink 100% free. Employers get free postings with optional AI candidate ranking and verification suites."}
          </p>
        </div>

        {/* PRICING TIERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* FREE STARTER */}
          <Card className="border-border/80 bg-card p-6 rounded-2xl flex flex-col justify-between shadow-sm relative">
            <div className="space-y-4">
              <div>
                <Badge variant="outline" className="text-xs mb-2">
                  Starter
                </Badge>
                <h3 className="text-xl font-bold text-foreground">Free Employer</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Ideal for small businesses and first-time job postings in Tanzania.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">TZS 0</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>

              <div className="border-t border-border/60 pt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Up to 2 Active Job Postings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Basic BRELA Verification Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Standard Application Inbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Regional Job Map Display</span>
                </div>
              </div>
            </div>

            <Button asChild className="mt-8 w-full rounded-xl" variant="outline">
              <Link to="/auth" search={{ mode: "signup" }}>
                <span>Get Started Free</span>
              </Link>
            </Button>
          </Card>

          {/* PROFESSIONAL (POPULAR) */}
          <Card className="border-emerald-500/80 bg-card p-6 rounded-2xl flex flex-col justify-between shadow-md relative ring-2 ring-emerald-500/20">
            <Badge className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] uppercase tracking-wider font-bold">
              Most Popular
            </Badge>

            <div className="space-y-4">
              <div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs mb-2">
                  Growth
                </Badge>
                <h3 className="text-xl font-bold text-foreground">Pro Recruiter</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  For growing Tanzanian enterprises needing fast AI candidate matching.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">TZS 150,000</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>

              <div className="border-t border-border/60 pt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Active Job Postings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Priority BRELA & TRA Verified Employer Badge</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>AI Candidate Ranking & Fit Scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Urgent & Featured Hiring Badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Bilingual Swahili/English Applicant Filtering</span>
                </div>
              </div>
            </div>

            <Button
              asChild
              className="mt-8 w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2 font-semibold"
            >
              <Link to="/auth" search={{ mode: "signup" }}>
                <span>Activate Pro Recruiter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </Card>

          {/* ENTERPRISE */}
          <Card className="border-border/80 bg-card p-6 rounded-2xl flex flex-col justify-between shadow-sm relative">
            <div className="space-y-4">
              <div>
                <Badge variant="outline" className="text-xs mb-2">
                  Custom
                </Badge>
                <h3 className="text-xl font-bold text-foreground">Enterprise & Govt</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Tailored HR solutions for corporate groups, NGOs, and public institutions.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-foreground">Custom Quote</span>
              </div>

              <div className="border-t border-border/60 pt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Dedicated Recruitment Account Manager</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Custom HR & ATS Integration via API</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Bulk Verification of Candidate Credentials</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>SLA & Dedicated WhatsApp Emergency Desk</span>
                </div>
              </div>
            </div>

            <Button asChild className="mt-8 w-full rounded-xl" variant="outline">
              <Link to="/contact">
                <span>Contact Enterprise Team</span>
              </Link>
            </Button>
          </Card>
        </div>

        {/* FAQ BOX */}
        <Card className="border-border/80 bg-muted/20 p-6 sm:p-8 rounded-2xl space-y-3 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <HelpCircle className="w-4 h-4 text-emerald-500" />
            <span>Are there any hidden fees for job seekers?</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            None whatsoever. Job seekers apply and prepare for interviews 100% free of charge.
            KaziLink’s revenue model is strictly B2B subscription services for enterprise employers.
          </p>
        </Card>
      </main>
    </div>
  );
}
