import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { useT } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Bot,
  FileText,
  Award,
  Calculator,
  Layout,
  UserCheck,
  FileCheck2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Video,
} from "lucide-react";

import { AIInterviewCoachModal } from "@/components/ai/AIInterviewCoachModal";
import { AICVBuilderModal } from "@/components/ai/AICVBuilderModal";
import { AICoverLetterModal } from "@/components/ai/AICoverLetterModal";
import { AISkillsGapModal } from "@/components/ai/AISkillsGapModal";
import { AISalaryCalculatorModal } from "@/components/ai/AISalaryCalculatorModal";
import { AIPortfolioGeneratorModal } from "@/components/ai/AIPortfolioGeneratorModal";
import { AISkillTestModal } from "@/components/ai/AISkillTestModal";
import { AIReferenceCheckerModal } from "@/components/ai/AIReferenceCheckerModal";
import { AIResumeAuditModal } from "@/components/ai/AIResumeAuditModal";
import { AICareerAssistantModal } from "@/components/ai/AICareerAssistantModal";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "AI Career Ecosystem Tools — KaziLink Tanzania" },
      {
        name: "description",
        content:
          "Suite of AI career tools: AI CV Builder, Interview Coach, Cover Letter Generator, Skills Gap Analysis, Salary Calculator, and Skill Testing.",
      },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  const { lang } = useT();

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const toolsList = [
    {
      id: "interview",
      title:
        lang === "sw"
          ? "Mfundisheji wa Usahili (AI Interview Coach)"
          : "AI Interview Practice Coach",
      desc:
        lang === "sw"
          ? "Fanya mazoezi ya maswali ya usahili kwa sauti na upate alama na ushauri."
          : "Simulate real interviews, practice spoken answers, and receive instant 0-100 scoring.",
      icon: Bot,
      color: "text-emerald-500",
      badge: "Voice & Text",
    },
    {
      id: "cv-builder",
      title: lang === "sw" ? "Mtengenezaji wa CV wa Bure" : "Free AI CV Builder",
      desc:
        lang === "sw"
          ? "Tengeneza CV iliyopangiliwa vizuri kwa kujibu maswali machache tu."
          : "Generate a professional, ATS-formatted resume in minutes without form repetition.",
      icon: FileText,
      color: "text-blue-500",
      badge: "Free Tool",
    },
    {
      id: "cover-letter",
      title: lang === "sw" ? "Mwandishi wa Barua za Maombi" : "AI Cover Letter Writer",
      desc:
        lang === "sw"
          ? "Andika barua za maombi ya kazi zilizoandaliwa mahususi kwa kila nafasi."
          : "Auto-draft tailored cover letters matching target job descriptions in English or Swahili.",
      icon: Sparkles,
      color: "text-purple-500",
      badge: "Instant Draft",
    },
    {
      id: "skills-gap",
      title: lang === "sw" ? "Uchambuzi wa Pengo la Ujuzi" : "AI Skills Gap Analysis",
      desc:
        lang === "sw"
          ? "Pima ujuzi wako na uunganishwe na kozi za bure za Coursera, Google & Cisco."
          : "Compare your profile against job requirements and get direct free learning course matches.",
      icon: BookOpen,
      color: "text-amber-500",
      badge: "Free Courses",
    },
    {
      id: "salary",
      title: lang === "sw" ? "Kikokotoo cha Mshahara na Kodi" : "AI Salary & Relocation Calculator",
      desc:
        lang === "sw"
          ? "Kadiria viwango vya mshahara, kodi ya TRA (PAYE) na fursa za kazi za kimataifa."
          : "Estimate role salary ranges, calculate TRA PAYE tax deductions, and check visa eligibility.",
      icon: Calculator,
      color: "text-indigo-500",
      badge: "TAX & Visa",
    },
    {
      id: "skill-test",
      title: lang === "sw" ? "Majaribio ya Ujuzi & Baji za AI" : "AI Skill Tests & Badges",
      desc:
        lang === "sw"
          ? "Fanya majaribio mafupi ya elimu na upate Baji Iliyothibitishwa (Verified Badge)."
          : "Take quick skill assessments to earn verified digital badges displayed on your profile.",
      icon: Award,
      color: "text-rose-500",
      badge: "Verified Badge",
    },
    {
      id: "portfolio",
      title: lang === "sw" ? "Mtengenezaji wa Portfolio" : "Showcase Portfolio Builder",
      desc:
        lang === "sw"
          ? "Tengeneza ukurasa wa mifano ya kazi kwa ajili ya Developers, Designers & Architects."
          : "Build a shareable showcase portfolio displaying projects, GitHub repos, and live demos.",
      icon: Layout,
      color: "text-cyan-500",
      badge: "Shareable Link",
    },
    {
      id: "reference",
      title: lang === "sw" ? "Uhakiki wa Marejeo (Reference Checker)" : "AI Reference Verification",
      desc:
        lang === "sw"
          ? "Tuma maombi ya kidijitali kwa waajiri wako wa zamani kuthibitisha uzoefu wako."
          : "Automate digital reference confirmation requests to former managers and mentors.",
      icon: UserCheck,
      color: "text-teal-500",
      badge: "Automated",
    },
    {
      id: "resume-audit",
      title: lang === "sw" ? "Ukaguzi wa CV (Resume Audit)" : "AI Resume Audit & Feedback",
      desc:
        lang === "sw"
          ? "Kagua maneno yasiyokuwepo (keywords), sarufi, na mbinu za kuboresha CV."
          : "Detect missing keywords, weak impact verbs, and formatting flaws before applying.",
      icon: FileCheck2,
      color: "text-orange-500",
      badge: "ATS Scan",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <AppNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs">
            {lang === "sw" ? "Vifaa vya AI vya Taaluma" : "AI Career Ecosystem Tools"}
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {lang === "sw"
              ? "Zana za AI za Kukuza Taaluma Yako Tanzania"
              : "Smart Tools to Master Your Career"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {lang === "sw"
              ? "Kuanzia utengenezaji wa CV, mazoezi ya usahili wa sauti, hadi kikokotoo cha mshahara na kodi."
              : "Everything you need to discover, prepare for, and secure meaningful work locally and internationally."}
          </p>
        </div>

        {/* TOOLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {toolsList.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Card
                key={tool.id}
                className="border-border/80 bg-card p-6 rounded-2xl space-y-4 hover:border-emerald-500/50 transition shadow-sm flex flex-col justify-between group cursor-pointer"
                onClick={() => setActiveModal(tool.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-muted/50 border border-border/40">
                      <IconComponent className={`w-6 h-6 ${tool.color}`} />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    >
                      {tool.badge}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-lg text-foreground group-hover:text-emerald-600 transition">
                    {tool.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-emerald-600">
                  <span>{lang === "sw" ? "Fungua Zana Hii" : "Launch Tool"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* MODALS */}
      <AIInterviewCoachModal
        open={activeModal === "interview"}
        onOpenChange={(op) => !op && setActiveModal(null)}
      />
      <AICVBuilderModal
        open={activeModal === "cv-builder"}
        onOpenChange={(op) => !op && setActiveModal(null)}
      />
      <AICoverLetterModal
        open={activeModal === "cover-letter"}
        onOpenChange={(op) => !op && setActiveModal(null)}
      />
      <AISkillsGapModal
        open={activeModal === "skills-gap"}
        onOpenChange={(op) => !op && setActiveModal(null)}
      />
      <AISalaryCalculatorModal
        open={activeModal === "salary"}
        onOpenChange={(op) => !op && setActiveModal(null)}
      />
      <AISkillTestModal
        open={activeModal === "skill-test"}
        onOpenChange={(op) => !op && setActiveModal(null)}
      />
      <AIPortfolioGeneratorModal
        open={activeModal === "portfolio"}
        onOpenChange={(op) => !op && setActiveModal(null)}
      />
      <AIReferenceCheckerModal
        open={activeModal === "reference"}
        onOpenChange={(op) => !op && setActiveModal(null)}
      />
      <AIResumeAuditModal
        open={activeModal === "resume-audit"}
        onOpenChange={(op) => !op && setActiveModal(null)}
      />
    </div>
  );
}
