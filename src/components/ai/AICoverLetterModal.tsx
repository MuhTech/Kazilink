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
import { FileCode, Sparkles, Copy, CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle?: string;
  companyName?: string;
}

export function AICoverLetterModal({
  open,
  onOpenChange,
  jobTitle = "Position",
  companyName = "Company",
}: Props) {
  const { lang } = useT();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);

  const generateCoverLetter = async () => {
    setLoading(true);
    setCoverLetter(null);

    try {
      const prompt = `Write a persuasive, tailored cover letter for candidate "${user?.user_metadata?.full_name || "Applicant"}" applying for the role of "${jobTitle}" at "${companyName}".
Language: ${lang === "sw" ? "Swahili" : "English"}.
Keep it concise (3 paragraphs), professional, highlighting strong enthusiasm, reliability, and technical competence.`;

      const result = await aiService.careerChat([], prompt, lang === "sw" ? "sw" : "en");
      setCoverLetter(result);
      toast.success(
        lang === "sw" ? "Barua ya Maombi imetengenezwa!" : "Cover Letter generated successfully!",
      );
    } catch (err) {
      toast.error("Failed to generate cover letter.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      toast.success("Copied cover letter to clipboard!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="w-6 h-6 text-emerald-500" />
            <span>
              {lang === "sw"
                ? "Kutengeneza Barua ya Maombi (Cover Letter)"
                : "AI Cover Letter Generator"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {lang === "sw"
              ? `Tengeneza barua mahususi ya maombi ya kazi kwa ajili ya ${jobTitle} katika ${companyName}.`
              : `Automatically write a personalized cover letter tailored for ${jobTitle} at ${companyName}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
          <div>
            <span className="text-muted-foreground">Applying for: </span>
            <span className="font-bold text-foreground">{jobTitle}</span>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          >
            {companyName}
          </Badge>
        </div>

        <ScrollArea className="flex-1 pr-2">
          {!coverLetter ? (
            <div className="py-8 text-center space-y-4">
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {lang === "sw"
                  ? "Bofya kitufe hapa chini kutengeneza barua ya maombi iliyorekebishwa kwa kutumia taarifa zako za wasifu."
                  : "Click the button below to generate a customized cover letter using your stored AI career profile."}
              </p>
              <Button
                onClick={generateCoverLetter}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2 font-semibold text-xs px-6 py-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === "sw" ? "Inaandika Barua..." : "Drafting Cover Letter..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === "sw" ? "Tengeneza Barua Sasa" : "Generate Cover Letter"}</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                {coverLetter}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateCoverLetter}
                  className="rounded-xl text-xs gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </Button>

                <Button
                  onClick={copyToClipboard}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2 font-semibold text-xs"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy to Clipboard</span>
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
