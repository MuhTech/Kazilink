import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { AppNav } from "@/components/AppNav";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Bot,
  FileText,
  Award,
  Calculator,
  ShieldCheck,
  Zap,
  Users,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import { AIInterviewCoachModal } from "@/components/ai/AIInterviewCoachModal";
import { AICVBuilderModal } from "@/components/ai/AICVBuilderModal";
import { AISalaryCalculatorModal } from "@/components/ai/AISalaryCalculatorModal";
import { AISkillTestModal } from "@/components/ai/AISkillTestModal";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — KaziLink Tanzania" },
      { name: "description", content: "Your KaziLink dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, roles, isAdmin } = useAuth();
  const { t, lang } = useT();
  const isEmployer = roles.includes("employer") || roles.includes("recruiter") || isAdmin;

  const [interviewOpen, setInterviewOpen] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [skillTestOpen, setSkillTestOpen] = useState(false);

  const appsQ = useQuery({
    queryKey: ["dash-apps", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("applications").select("id, status").eq("applicant_id", user!.id))
        .data ?? [],
  });
  const compQ = useQuery({
    queryKey: ["dash-companies", user?.id],
    enabled: !!user && isEmployer,
    queryFn: async () =>
      (
        await supabase
          .from("companies")
          .select("id, name, verification_status")
          .eq("owner_id", user!.id)
      ).data ?? [],
  });

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
              AI-Powered Career Hub
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t.nav.dashboard}</h1>
          <p className="text-sm text-muted-foreground mt-1">Karibu, {user?.email}</p>
        </div>

        {/* METRIC CARDS */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5 border-border/80 bg-card rounded-2xl">
            <div className="text-xs font-semibold text-muted-foreground">{t.nav.applications}</div>
            <div className="mt-2 text-3xl font-bold text-foreground">{appsQ.data?.length ?? 0}</div>
            <Button
              asChild
              variant="link"
              className="mt-2 px-0 text-xs text-emerald-600 font-semibold"
            >
              <Link to="/applications">View All Applications →</Link>
            </Button>
          </Card>

          {isEmployer && (
            <Card className="p-5 border-border/80 bg-card rounded-2xl">
              <div className="text-xs font-semibold text-muted-foreground">{t.company.list}</div>
              <div className="mt-2 text-3xl font-bold text-foreground">
                {compQ.data?.length ?? 0}
              </div>
              <Button
                asChild
                variant="link"
                className="mt-2 px-0 text-xs text-emerald-600 font-semibold"
              >
                <Link to="/employer/companies">Manage Companies →</Link>
              </Button>
            </Card>
          )}

          <Card className="p-5 border-border/80 bg-card rounded-2xl">
            <div className="text-xs font-semibold text-muted-foreground">{t.nav.profile}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              1-Click Unified AI Career Profile
            </div>
            <Button
              asChild
              variant="link"
              className="mt-2 px-0 text-xs text-emerald-600 font-semibold"
            >
              <Link to="/profile">Edit Profile & Skills →</Link>
            </Button>
          </Card>
        </div>

        {/* AI CAREER ECOSYSTEM QUICK TOOLS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span>AI Career Ecosystem Launchpad</span>
            </h2>
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs gap-1">
              <Link to="/tools">
                <span>All AI Tools</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              onClick={() => setInterviewOpen(true)}
              className="p-5 border-border/80 bg-card hover:border-emerald-500/50 transition rounded-2xl cursor-pointer space-y-3 shadow-sm group"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 w-fit">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-emerald-600 transition">
                  {lang === "sw" ? "Mfundisheji wa Usahili" : "AI Interview Coach"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Practice voice interview questions with instant AI scoring.
                </p>
              </div>
            </Card>

            <Card
              onClick={() => setCvOpen(true)}
              className="p-5 border-border/80 bg-card hover:border-emerald-500/50 transition rounded-2xl cursor-pointer space-y-3 shadow-sm group"
            >
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 w-fit">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-blue-600 transition">
                  {lang === "sw" ? "Mtengenezaji wa CV" : "AI CV Builder"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Build ATS-optimized resumes in English or Swahili.
                </p>
              </div>
            </Card>

            <Card
              onClick={() => setSalaryOpen(true)}
              className="p-5 border-border/80 bg-card hover:border-emerald-500/50 transition rounded-2xl cursor-pointer space-y-3 shadow-sm group"
            >
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 w-fit">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-purple-600 transition">
                  {lang === "sw" ? "Kikokotoo cha Mshahara" : "Salary & TRA Tax"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Estimate market pay and net take-home pay after PAYE.
                </p>
              </div>
            </Card>

            <Card
              onClick={() => setSkillTestOpen(true)}
              className="p-5 border-border/80 bg-card hover:border-emerald-500/50 transition rounded-2xl cursor-pointer space-y-3 shadow-sm group"
            >
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 w-fit">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-rose-600 transition">
                  {lang === "sw" ? "Baji za Ujuzi" : "Skill Tests & Badges"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Earn verified skill badges for your candidate profile.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* BOTTOM QUICK NAVIGATION */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5 border-border/80 bg-card rounded-2xl space-y-2">
            <h2 className="text-base font-bold text-foreground">{t.nav.jobs}</h2>
            <p className="text-xs text-muted-foreground">{t.jobs.title}</p>
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold mt-2"
            >
              <Link to="/jobs">{t.home.heroCta}</Link>
            </Button>
          </Card>

          <Card className="p-5 border-border/80 bg-card rounded-2xl space-y-2">
            <h2 className="text-base font-bold text-foreground">Community & Mentorship</h2>
            <p className="text-xs text-muted-foreground">
              Connect with recruiters and experienced career mentors in Tanzania.
            </p>
            <Button asChild variant="outline" className="rounded-xl text-xs font-semibold mt-2">
              <Link to="/community">Join Discussion Hub</Link>
            </Button>
          </Card>
        </div>

        {/* MODALS */}
        <AIInterviewCoachModal open={interviewOpen} onOpenChange={setInterviewOpen} />
        <AICVBuilderModal open={cvOpen} onOpenChange={setCvOpen} />
        <AISalaryCalculatorModal open={salaryOpen} onOpenChange={setSalaryOpen} />
        <AISkillTestModal open={skillTestOpen} onOpenChange={setSkillTestOpen} />
      </main>
    </div>
  );
}
