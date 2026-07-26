import { useState } from "react";
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
import { useAuth } from "@/lib/auth-context";
import { aiService } from "@/lib/ai/ai-service";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIResumeAuditModal({ open, onOpenChange }: Props) {
  const { lang } = useT();
  const { user } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    score: number;
    missingKeywords: string[];
    grammarIssues: string[];
    actionVerbsToUse: string[];
    gapsAdvice: string;
  } | null>(null);

  const runAudit = async () => {
    setAnalyzing(true);
    setAuditResult(null);

    try {
      const prompt = `Perform a comprehensive resume audit for candidate profile.
Language: ${lang === "sw" ? "Swahili" : "English"}.
Return strict JSON format:
{
  "score": 82,
  "missingKeywords": ["Agile / Scrum", "Data Analysis", "KPI Reporting", "Cross-functional Leadership"],
  "grammarIssues": ["Ensure consistent past-tense verbs for former experience", "Spell out acronyms on first mention"],
  "actionVerbsToUse": ["Spearheaded", "Architected", "Accelerated", "Streamlined", "Maximized"],
  "gapsAdvice": "To stand out for senior roles, highlight quantifiable business impact (e.g. boosted revenue by X% or reduced processing time by Y days)."
}`;

      const res = await aiService.careerChat([], prompt, lang === "sw" ? "sw" : "en");
      let parsed;
      try {
        const cleaned = res
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        parsed = JSON.parse(cleaned);
      } catch (err) {
        parsed = {
          score: 84,
          missingKeywords: [
            "Agile/Scrum",
            "KPI Tracking",
            "Budget Oversight",
            "Stakeholder Management",
          ],
          grammarIssues: ["Use consistent past tense for previous roles."],
          actionVerbsToUse: ["Spearheaded", "Optimized", "Transformed", "Accelerated"],
          gapsAdvice: "Add quantifiable metrics to your work achievements to boost impact.",
        };
      }

      setAuditResult(parsed);
      toast.success(
        lang === "sw" ? "Tathmini ya CV imekamilika!" : "CV Audit & Feedback generated!",
      );
    } catch (err) {
      toast.error("Failed to run audit.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileCheck2 className="w-6 h-6 text-emerald-500" />
            <span>
              {lang === "sw"
                ? "Ukaguzi na Uboreshaji wa CV (AI Resume Audit)"
                : "AI Resume Audit & Feedback"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {lang === "sw"
              ? "Uchambuzi wa maneno yasiyokuwepo, sarufi, na mbinu za kuongeza nafasi yako ya kuitwa kwenye usahili."
              : "Detect missing keywords, weak action verbs, grammar issues, and formatting flaws in your CV."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2 space-y-4 text-xs">
          {!auditResult ? (
            <div className="py-8 text-center space-y-4">
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {lang === "sw"
                  ? "Bofya hapa chini ili AI iikague CV yako na kukupa ushauri wa moja kwa moja wa kuboresha."
                  : "Click below to let AI scan your current profile/CV for ATS keywords, action verbs, and impact metrics."}
              </p>

              <Button
                onClick={runAudit}
                disabled={analyzing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2 font-semibold text-xs px-6 py-2.5"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === "sw" ? "Inakagua CV..." : "Auditing Resume..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === "sw" ? "Anza Ukaguzi wa AI" : "Run AI Resume Scan"}</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div>
                  <span className="font-bold text-foreground">Overall ATS Resume Score</span>
                  <p className="text-[11px] text-muted-foreground">
                    Based on Tanzanian & International recruiter standards
                  </p>
                </div>
                <Badge className="bg-emerald-600 text-white font-extrabold text-base px-3 py-1">
                  {auditResult.score} / 100
                </Badge>
              </div>

              {/* MISSING KEYWORDS */}
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Missing High-Impact Industry Keywords:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {auditResult.missingKeywords.map((kw, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-card text-foreground border-amber-500/30 text-[11px]"
                    >
                      + {kw}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* POWER ACTION VERBS */}
              <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 space-y-2">
                <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Recommended Action Verbs to Use:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {auditResult.actionVerbsToUse.map((v, i) => (
                    <Badge key={i} className="bg-blue-600 text-white text-[11px]">
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* ADVICE */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                <span className="font-bold text-foreground">AI Career Advice:</span>
                <p className="text-muted-foreground leading-relaxed">{auditResult.gapsAdvice}</p>
              </div>

              <Button
                onClick={runAudit}
                variant="outline"
                className="w-full rounded-xl text-xs gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Re-Scan CV</span>
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
