import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useT } from "@/lib/i18n";
import {
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userSkills?: string[];
  requiredSkills?: string[];
  jobTitle?: string;
}

const FREE_COURSES: Record<
  string,
  { title: string; provider: string; url: string; hours: string }
> = {
  Docker: {
    title: "Docker & Containerization Beginners Guide",
    provider: "FreeCodeCamp",
    url: "https://www.freecodecamp.org",
    hours: "3 hrs",
  },
  Git: {
    title: "Version Control & Git Essential Training",
    provider: "Coursera / Google",
    url: "https://www.coursera.org",
    hours: "4 hrs",
  },
  React: {
    title: "Complete React & Frontend Architecture",
    provider: "FreeCodeCamp",
    url: "https://www.freecodecamp.org",
    hours: "12 hrs",
  },
  AWS: {
    title: "AWS Cloud Practitioner Essentials",
    provider: "Amazon Web Services",
    url: "https://aws.amazon.com/training/",
    hours: "6 hrs",
  },
  Python: {
    title: "Python for Everybody Specialization",
    provider: "University of Michigan / Coursera",
    url: "https://www.coursera.org",
    hours: "8 hrs",
  },
  Accounting: {
    title: "Financial Accounting Fundamentals",
    provider: "Alison Learning",
    url: "https://alison.com",
    hours: "5 hrs",
  },
  Excel: {
    title: "Microsoft Excel Data Analysis & Dashboards",
    provider: "Microsoft Learn",
    url: "https://learn.microsoft.com",
    hours: "4 hrs",
  },
};

export function AISkillsGapModal({
  open,
  onOpenChange,
  userSkills = ["JavaScript", "HTML/CSS", "Communication", "Management"],
  requiredSkills = ["JavaScript", "React", "Docker", "AWS", "Communication"],
  jobTitle = "Target Position",
}: Props) {
  const { lang } = useT();

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const matchedSkills = requiredSkills.filter((s) => userSkillsLower.includes(s.toLowerCase()));
  const missingSkills = requiredSkills.filter((s) => !userSkillsLower.includes(s.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <span>
              {lang === "sw"
                ? "Uchambuzi wa Pengo la Ujuzi (Skills Gap Analysis)"
                : "AI Skills Gap Analysis"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {lang === "sw"
              ? `Uchambuzi wa ujuzi wako dhidi ya vigezo vya nafasi ya ${jobTitle}.`
              : `Comparing your profile skills directly against the requirements for ${jobTitle}.`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2 space-y-4">
          <div className="space-y-4">
            {/* MATCHED SKILLS */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Skills You Possess ({matchedSkills.length} Matched):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map((sk) => (
                  <Badge
                    key={sk}
                    className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px]"
                  >
                    ✓ {sk}
                  </Badge>
                ))}
              </div>
            </div>

            {/* MISSING SKILLS & COURSES */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Missing Requirements ({missingSkills.length} Skills to Learn):</span>
              </div>

              {missingSkills.length === 0 ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  🎉 Perfect match! You meet 100% of the required skills for this job!
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.map((sk) => (
                      <Badge
                        key={sk}
                        variant="outline"
                        className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[11px]"
                      >
                        Missing: {sk}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-xs font-bold text-foreground border-t border-amber-500/20 pt-2 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-500" />
                    <span>Recommended Free Learning Courses:</span>
                  </p>

                  <div className="space-y-2">
                    {missingSkills.map((sk) => {
                      const course = FREE_COURSES[sk] || {
                        title: `${sk} Fundamentals for Professionals`,
                        provider: "Coursera & YouTube Free Learning",
                        url: "https://www.youtube.com",
                        hours: "2-5 hrs",
                      };
                      return (
                        <div
                          key={sk}
                          className="p-3 rounded-lg bg-card border border-border/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-foreground flex items-center gap-1.5">
                              <span>{course.title}</span>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                {course.hours}
                              </Badge>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {course.provider}
                            </span>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="h-7 text-[11px] gap-1 rounded-lg shrink-0"
                          >
                            <a href={course.url} target="_blank" rel="noopener noreferrer">
                              <span>Enroll Free</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
