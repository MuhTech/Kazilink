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
import {
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUIZZES = [
  {
    id: "js",
    title: "JavaScript & Frontend Engineering",
    category: "Software Development",
    questions: [
      {
        q: "Which keyword creates a block-scoped variable in modern JavaScript?",
        options: ["var", "let", "define", "global"],
        correct: 1,
      },
      {
        q: "What does Promises.all() return when all input promises resolve?",
        options: [
          "First resolved promise",
          "An array of all resolved values",
          "A boolean true",
          "Null",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "tax",
    title: "Tanzanian Tax & Accounting Standards (TRA)",
    category: "Accounting & Finance",
    questions: [
      {
        q: "What is the standard Value Added Tax (VAT) rate in Tanzania?",
        options: ["10%", "18%", "20%", "15%"],
        correct: 1,
      },
      {
        q: "Which system is used by TRA for electronic tax filing?",
        options: ["EFD System / TAFIS", "NIDA Hub", "BRELA Portal", "PAYE Express"],
        correct: 0,
      },
    ],
  },
];

export function AISkillTestModal({ open, onOpenChange }: Props) {
  const { lang } = useT();
  const [selectedQuiz, setSelectedQuiz] = useState<(typeof QUIZZES)[0] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [testResult, setTestResult] = useState<{ score: number; passed: boolean } | null>(null);

  const startQuiz = (q: (typeof QUIZZES)[0]) => {
    setSelectedQuiz(q);
    setAnswers({});
    setTestResult(null);
  };

  const submitQuiz = () => {
    if (!selectedQuiz) return;
    let correctCount = 0;
    selectedQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) {
        correctCount++;
      }
    });

    const total = selectedQuiz.questions.length;
    const scorePct = Math.round((correctCount / total) * 100);
    const passed = scorePct >= 70;

    setTestResult({ score: scorePct, passed });
    if (passed) {
      toast.success(
        lang === "sw"
          ? `Umeshafanikiwa Jaribio! Umepata Badge ya ${selectedQuiz.title}`
          : `Congratulations! You earned the Verified Skill Badge for ${selectedQuiz.title}`,
      );
    } else {
      toast.error(
        lang === "sw"
          ? "Hukufikisha alama za kupita (70%). Jaribu tena!"
          : "Passing score is 70%. Try again!",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Award className="w-6 h-6 text-amber-500" />
            <span>
              {lang === "sw"
                ? "Jaribio la Ujuzi na Baji za AI"
                : "AI Skill Testing & Verified Badges"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {lang === "sw"
              ? "Pima ujuzi wako wa kitaalamu na upate Baji Iliyothibitishwa (Verified Skill Badge) kwenye wasifu wako."
              : "Take short skill assessments to earn verified digital badges displayed on your candidate profile."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2 space-y-4">
          {!selectedQuiz ? (
            <div className="space-y-3">
              <span className="text-xs font-bold text-foreground">Select an Assessment:</span>
              <div className="grid grid-cols-1 gap-3">
                {QUIZZES.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-4 rounded-xl border border-border/80 bg-card hover:border-emerald-500/50 transition flex items-center justify-between gap-3"
                  >
                    <div>
                      <Badge
                        variant="outline"
                        className="text-[10px] text-emerald-600 border-emerald-500/30 mb-1"
                      >
                        {quiz.category}
                      </Badge>
                      <h4 className="font-bold text-sm text-foreground">{quiz.title}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {quiz.questions.length} Questions • Verified Digital Badge
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => startQuiz(quiz)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs shrink-0"
                    >
                      Start Test
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedQuiz(null)}
                  className="h-7 text-xs"
                >
                  ← Back to Skill List
                </Button>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                  {selectedQuiz.title}
                </Badge>
              </div>

              {!testResult ? (
                <div className="space-y-4">
                  {selectedQuiz.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3"
                    >
                      <p className="font-bold text-xs text-foreground">
                        {qIdx + 1}. {q.q}
                      </p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => setAnswers({ ...answers, [qIdx]: oIdx })}
                            className={`w-full text-left p-2.5 rounded-lg border text-xs transition flex items-center justify-between ${
                              answers[qIdx] === oIdx
                                ? "border-emerald-500 bg-emerald-500/10 font-semibold text-emerald-600"
                                : "border-border/60 hover:bg-card text-muted-foreground"
                            }`}
                          >
                            <span>{opt}</span>
                            {answers[qIdx] === oIdx && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={submitQuiz}
                    disabled={Object.keys(answers).length < selectedQuiz.questions.length}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs"
                  >
                    Submit Skill Assessment
                  </Button>
                </div>
              ) : (
                <div className="py-6 text-center space-y-4 animate-in fade-in">
                  {testResult.passed ? (
                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 max-w-sm mx-auto">
                      <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
                      <h3 className="text-xl font-bold text-foreground">Badge Earned!</h3>
                      <p className="text-xs text-muted-foreground">
                        You scored {testResult.score}%. The Verified Digital Badge for "
                        {selectedQuiz.title}" has been attached to your profile.
                      </p>
                      <Badge className="bg-emerald-600 text-white text-xs px-3 py-1">
                        ✓ VERIFIED SKILL BADGE
                      </Badge>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3 max-w-sm mx-auto">
                      <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
                      <h3 className="text-xl font-bold text-foreground">
                        Score: {testResult.score}%
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        You need 70% to pass. Review the learning materials and try again.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTestResult(null)}
                        className="rounded-xl text-xs gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Quiz</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
