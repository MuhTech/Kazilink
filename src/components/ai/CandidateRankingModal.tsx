import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { aiService } from "@/lib/ai/ai-service";
import { useT } from "@/lib/i18n";
import { Sparkles, Trophy, CheckCircle, MapPin, Loader2 } from "lucide-react";
import type { CandidateRanking } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: any;
  applicants: any[];
}

export function CandidateRankingModal({ open, onOpenChange, job, applicants }: Props) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [rankings, setRankings] = useState<CandidateRanking[]>([]);

  useEffect(() => {
    if (open && job && applicants && applicants.length > 0) {
      setLoading(true);
      aiService
        .rankCandidates(job, applicants)
        .then((res) => setRankings(res.sort((a, b) => b.overall_score - a.overall_score)))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, job, applicants]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-5 w-5 text-amber-500" />
            {t.ai.rankCandidates}
          </DialogTitle>
          <DialogDescription>
            {t.ai.rankingDesc} for "{job?.title}"
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            Analyzing candidate qualifications and calculating fit scores…
          </div>
        ) : (
          <div className="space-y-4 py-3">
            {rankings.map((r, index) => (
              <div
                key={r.id || index}
                className="rounded-lg border bg-card p-4 space-y-3 hover:border-primary transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        Rank #{index + 1}
                      </Badge>
                      <h4 className="font-semibold text-base">
                        {r.applicant?.full_name || "Candidate"}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.applicant?.headline || "Applicant"}
                    </p>
                    {r.applicant?.location && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {r.applicant.location}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(r.overall_score)}%
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">
                      Overall Match
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 text-xs pt-1 border-t">
                  <div>
                    <span className="text-muted-foreground block mb-1">Skills Match</span>
                    <Progress value={r.skills_score} className="h-1.5" />
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Experience</span>
                    <Progress value={r.experience_score} className="h-1.5" />
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Education</span>
                    <Progress value={r.education_score} className="h-1.5" />
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Location</span>
                    <Progress value={r.location_score} className="h-1.5" />
                  </div>
                </div>

                {r.explanation && (
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-md flex items-start gap-1.5 mt-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{r.explanation}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
