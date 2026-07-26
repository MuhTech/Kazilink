import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck, ShieldAlert, Users2, Building } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — KaziLink Tanzania" },
      {
        name: "description",
        content:
          "Terms of Service for KaziLink Tanzania. Guidelines for job seekers, verified employers, anti-fraud policies, and recruitment standards.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { lang } = useT();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-3 text-center sm:text-left">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs">
            {lang === "sw" ? "Masharti ya Huduma" : "Terms & Conditions"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {lang === "sw" ? "Masharti ya Matumizi ya KaziLink" : "Terms of Service"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Last Updated: July 2026 • Governing employment platform usage in the United Republic of
            Tanzania
          </p>
        </div>

        <Card className="border-border/80 bg-card p-6 sm:p-8 rounded-2xl space-y-6 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>1. Strict Anti-Recruitment Fee Policy</span>
            </h2>
            <p className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-600 dark:text-rose-400 font-semibold">
              KaziLink strictly prohibits any employer or recruiter from requesting money,
              application fees, or bribes from job seekers.
            </p>
            <p>
              Under Tanzanian labor laws, job application processes must remain free for candidates.
              Any company found soliciting fees from applicants will have their account immediately
              terminated and reported to law enforcement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-500" />
              <span>2. Employer Verification & BRELA / TRA Requirements</span>
            </h2>
            <p>
              To post job openings or access candidate applications, enterprise accounts must
              provide legitimate BRELA company registration details and TRA TIN documentation.
            </p>
            <p>
              Verified Employer badges are awarded upon manual verification of company filings by
              KaziLink compliance officers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Users2 className="w-5 h-5 text-emerald-500" />
              <span>3. Candidate Responsibilities</span>
            </h2>
            <p>
              Job seekers must ensure all educational qualifications, work history, and national ID
              details provided on their profiles and resumes are accurate and truthful.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-purple-500" />
              <span>4. Governed Jurisdiction</span>
            </h2>
            <p>
              These terms are governed by the laws of the United Republic of Tanzania. Any legal
              disputes shall be handled by the courts of Dar es Salaam, United Republic of Tanzania.
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
}
