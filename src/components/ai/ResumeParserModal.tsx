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
import { aiService } from "@/lib/ai/ai-service";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { Sparkles, FileText, UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ParsedResume } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onParsed?: (parsed: ParsedResume) => void;
}

export function ResumeParserModal({ open, onOpenChange, onParsed }: Props) {
  const { user } = useAuth();
  const { t } = useT();
  const [resumeText, setResumeText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<ParsedResume | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setParsing(true);
    try {
      const text = await file.text();
      setResumeText(text);
      const parsed = await aiService.parseResume(text);
      setResult(parsed);
      toast.success(t.ai.parseSuccess);
    } catch (err: any) {
      toast.error("Failed to parse file text: " + (err.message || "Unknown error"));
    } finally {
      setParsing(false);
    }
  };

  const handleParseText = async () => {
    if (!resumeText.trim()) {
      toast.error("Please paste resume text first.");
      return;
    }
    setParsing(true);
    try {
      const parsed = await aiService.parseResume(resumeText);
      setResult(parsed);
      toast.success(t.ai.parseSuccess);
    } catch (err: any) {
      toast.error("Parsing error: " + err.message);
    } finally {
      setParsing(false);
    }
  };

  const applyToProfile = async () => {
    if (!result || !user) return;
    try {
      const updatePayload: any = {};
      if (result.fullName) updatePayload.full_name = result.fullName;
      if (result.phone) updatePayload.phone = result.phone;
      if (result.location) updatePayload.location = result.location;
      if (result.headline) updatePayload.headline = result.headline;
      if (result.summary) updatePayload.bio = result.summary;

      await supabase.from("profiles").update(updatePayload).eq("id", user.id);

      if (result.skills && result.skills.length > 0) {
        const userSkillsInsert = result.skills.map((skill) => ({
          user_id: user.id,
          skill: skill.trim(),
          source: "ai_extracted" as const,
        }));
        await supabase
          .from("user_skills")
          .upsert(userSkillsInsert, { onConflict: "user_id,skill" });
      }

      toast.success("Profile automatically updated with AI extracted details!");
      if (onParsed) onParsed(result);
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Error saving profile: " + err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            {t.ai.parseResumeTitle}
          </DialogTitle>
          <DialogDescription>{t.ai.parseResumeDesc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="rounded-lg border-2 border-dashed p-6 text-center hover:border-primary transition">
            <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">
              Click to upload resume file (PDF / DOCX / TXT)
            </p>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="mt-3 block w-full text-xs text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Or Paste Resume Plain Text
            </label>
            <Textarea
              rows={5}
              placeholder="Paste CV content here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <Button
              onClick={handleParseText}
              disabled={parsing || !resumeText.trim()}
              className="w-full gap-2"
            >
              {parsing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {parsing ? t.ai.parsing : "Extract Resume Profile Details"}
            </Button>
          </div>

          {result && (
            <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Extracted Candidate Profile
                </h4>
                <Badge variant="outline">AI Verified</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  <strong>{result.fullName || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <strong>{result.email || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  <strong>{result.phone || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>{" "}
                  <strong>{result.location || "N/A"}</strong>
                </div>
              </div>

              {result.headline && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Headline:</span> {result.headline}
                </div>
              )}

              {result.skills && result.skills.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">
                    Extracted Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {result.skills.map((s, idx) => (
                      <Badge key={idx} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={applyToProfile} className="w-full mt-2">
                Apply Extracted Details to KaziLink Profile
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
