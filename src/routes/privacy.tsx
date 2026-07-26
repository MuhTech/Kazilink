import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { useT } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — KaziLink Tanzania" },
      {
        name: "description",
        content:
          "Privacy Policy for KaziLink Tanzania. Read how we protect your personal data, resumes, national ID information, and AI opt-out preferences.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang } = useT();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-3 text-center sm:text-left">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs">
            {lang === "sw" ? "Sera ya Faragha" : "Legal & Privacy"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {lang === "sw" ? "Sera ya Faragha ya KaziLink" : "Privacy Policy"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Effective Date: July 2026 • Compliant with Tanzania Personal Data Protection Act (PDPA
            2022)
          </p>
        </div>

        <Card className="border-border/80 bg-card p-6 sm:p-8 rounded-2xl space-y-6 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>1. Information We Collect</span>
            </h2>
            <p>
              To provide employment matching services across Tanzania, KaziLink collects information
              provided directly by users and employers:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Job Seekers:</strong> Full name, phone number (+255), email address, region
                of residence, resumes/CVs, education history, skills, and optional NIDA/National ID
                verification details.
              </li>
              <li>
                <strong>Employers:</strong> Company name, BRELA registration certificates, TRA TIN
                documents, contact details, official office address, and job posting descriptions.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              <span>2. Storage & Security of Verification Documents</span>
            </h2>
            <p>
              All sensitive documents including resumes, BRELA certificates, and TRA TIN documents
              are stored in encrypted, row-level security (RLS) guarded storage buckets
              (`verification-docs` and `resumes`). Access is restricted solely to verified hiring
              managers for positions you apply for, and platform administrators auditing employer
              legitimacy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              <span>3. AI Learning & Personalization Preferences</span>
            </h2>
            <p>
              KaziLink operates a Continuous Learning Engine that improves search suggestions and
              job matching based on anonymized user interaction trends.
            </p>
            <p>
              <strong>User Control & AI Opt-Out:</strong> Job seekers can opt out of AI learning at
              any time through their{" "}
              <Link to="/profile/security" className="text-primary underline font-medium">
                Security & Privacy Settings
              </Link>
              . Opting out will disable AI recommendation profiling while keeping core search and
              application features fully functional.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>4. Data Rights & Contact</span>
            </h2>
            <p>
              Under the Tanzania Personal Data Protection Act, you have the right to request access
              to, correction of, or permanent deletion of your personal profile data and uploaded
              resumes.
            </p>
            <p>
              For privacy requests or data inquiries, contact our Data Protection Officer at:{" "}
              <strong className="text-foreground">privacy@kazilink.co.tz</strong>.
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
}
