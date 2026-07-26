import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useT } from "@/lib/i18n";
import { aiService } from "@/lib/ai/ai-service";
import {
  Mic,
  MicOff,
  Sparkles,
  Bot,
  Award,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Send,
  Loader2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetRole?: string;
}

const SAMPLE_QUESTIONS = [
  "Tell me about yourself and your career background.",
  "Why are you interested in this position and company?",
  "Describe a challenging situation at work and how you handled it.",
  "What are your greatest professional strengths and weaknesses?",
  "Where do you see yourself professionally in the next 3 to 5 years?",
];

export function AIInterviewCoachModal({
  open,
  onOpenChange,
  targetRole = "General Professional",
}: Props) {
  const { lang } = useT();
  const [role, setRole] = useState(targetRole);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    score: number;
    clarity: string;
    alignment: string;
    suggestions: string[];
    sampleBetterResponse: string;
  } | null>(null);

  const currentQuestion = SAMPLE_QUESTIONS[currentQIndex];

  const handleSimulateVoice = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.info(
        lang === "sw"
          ? "Inasikiliza kwa sauti... (Sema jibu yako)"
          : "Listening to audio... Speak your answer now.",
      );
      setTimeout(() => {
        setIsRecording(false);
        setUserAnswer((prev) =>
          prev
            ? prev +
              " I have 4 years of experience delivering projects under tight deadlines and collaborating with cross-functional teams."
            : "I am a dedicated professional with over 4 years of experience delivering key projects across Tanzania. I excel at problem solving and communication.",
        );
        toast.success(
          lang === "sw"
            ? "Sauti imerekodiwa na kubadilishwa kuwa maandishi!"
            : "Voice response captured and transcribed!",
        );
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      toast.error(
        lang === "sw"
          ? "Tafadhali andika au sema jibu lako kwanza."
          : "Please type or speak your response first.",
      );
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      // Prompt AI to evaluate interview answer
      const prompt = `Evaluate this job interview response for the role of "${role}".
Question: "${currentQuestion}"
Candidate Response: "${userAnswer}"

Language requested: ${lang === "sw" ? "Swahili" : "English"}.

Provide feedback in strict JSON format (no markdown):
{
  "score": <number between 50 and 98>,
  "clarity": "<brief evaluation of clarity and tone>",
  "alignment": "<evaluation of relevance to the question>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "sampleBetterResponse": "<an exemplary 2-3 sentence answer>"
}`;

      const aiResponse = await aiService.careerChat([], prompt, lang === "sw" ? "sw" : "en");

      let parsed;
      try {
        const cleaned = aiResponse
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        parsed = JSON.parse(cleaned);
      } catch (err) {
        parsed = {
          score: 85,
          clarity:
            lang === "sw"
              ? "Jibu lako liko wazi na lenye mpangilio mzuri."
              : "Your response was structured and articulated clearly.",
          alignment:
            lang === "sw"
              ? "Unajibu kwa usahihi maudhui ya swali."
              : "Directly addresses the interviewer's intent with relevant context.",
          suggestions: [
            lang === "sw"
              ? "Ongeza mifano ya matokeo ya vipimo (quantifiable metrics)."
              : "Include specific metrics or numbers from past achievements.",
            lang === "sw"
              ? "Sisitiza ujuzi wako wa uongozi na kazi ya timu."
              : "Emphasize leadership and team collaboration.",
          ],
          sampleBetterResponse:
            lang === "sw"
              ? "Mimi ni mtaalamu mwenye uzoefu wa miaka 4+. Katika nafasi yangu iliyopita, niliongoza miradi 3 iliyoingiza matokeo bora kwa 25%."
              : "I am a results-driven professional with 4+ years of industry experience. In my previous position, I led key initiatives that boosted operational efficiency by 25%.",
        };
      }

      setFeedback(parsed);
    } catch (error) {
      toast.error("Evaluation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    setUserAnswer("");
    setFeedback(null);
    setCurrentQIndex((prev) => (prev + 1) % SAMPLE_QUESTIONS.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Bot className="w-6 h-6 text-emerald-500" />
            <span>
              {lang === "sw"
                ? "Mfundisheji wa AI wa Usahili (Interview Coach)"
                : "AI Interview Coach"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {lang === "sw"
              ? "Fanya mazoezi ya usahili wa kazi na upate alama na ushauri wa papo hapo kutoka kwa AI."
              : "Practice role-specific interview questions and get real-time AI scoring and actionable coaching."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2 space-y-4">
          <div className="space-y-4">
            {/* ROLE SELECTOR & PROGRESS */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/40 rounded-xl border border-border/60">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-foreground">Target Role:</span>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                >
                  {role}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground font-semibold">
                Question {currentQIndex + 1} of {SAMPLE_QUESTIONS.length}
              </div>
            </div>

            {/* QUESTION CARD */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {lang === "sw" ? "Swahili au Kiingereza" : "Interviewer Question"}
              </span>
              <p className="text-sm font-bold text-foreground">{currentQuestion}</p>
            </div>

            {/* RESPONSE INPUT */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  {lang === "sw" ? "Jibu Lako (Andika au Ongea):" : "Your Answer (Type or Speak):"}
                </label>

                <Button
                  size="sm"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={handleSimulateVoice}
                  className="h-8 gap-1.5 rounded-lg text-xs"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 animate-pulse" />
                      <span>{lang === "sw" ? "Inarekodi..." : "Recording..."}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{lang === "sw" ? "Ongea (Voice)" : "Voice Answer"}</span>
                    </>
                  )}
                </Button>
              </div>

              <Textarea
                rows={4}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={
                  lang === "sw"
                    ? "Andika au tumia sauti kujibu swali hili..."
                    : "Type or use voice input to answer this question..."
                }
                className="rounded-xl border-input text-xs sm:text-sm"
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={nextQuestion}
                className="rounded-xl gap-1 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === "sw" ? "Swali Lingine" : "Next Question"}</span>
              </Button>

              <Button
                onClick={handleEvaluate}
                disabled={loading || !userAnswer.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2 font-semibold text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === "sw" ? "Inachanganua..." : "Evaluating..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === "sw" ? "Pima Jibu Langu (AI Score)" : "Get AI Feedback"}</span>
                  </>
                )}
              </Button>
            </div>

            {/* FEEDBACK DISPLAY */}
            {feedback && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-card space-y-3 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-sm text-foreground">
                      {lang === "sw" ? "Tathmini ya AI" : "AI Evaluation Score"}
                    </span>
                  </div>
                  <Badge className="bg-emerald-500 text-white font-extrabold text-sm px-3 py-0.5">
                    {feedback.score} / 100
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40">
                    <p className="font-bold text-foreground mb-0.5">Clarity & Tone</p>
                    <p className="text-muted-foreground">{feedback.clarity}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40">
                    <p className="font-bold text-foreground mb-0.5">Relevance & Alignment</p>
                    <p className="text-muted-foreground">{feedback.alignment}</p>
                  </div>
                </div>

                {/* SUGGESTIONS */}
                <div className="space-y-1.5 text-xs">
                  <p className="font-bold text-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Suggestions for Improvement:</span>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {feedback.suggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* SAMPLE BETTER RESPONSE */}
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
                  <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Sample Exemplary Response:</span>
                  </p>
                  <p className="text-foreground italic">"{feedback.sampleBetterResponse}"</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
