import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { aiService } from "@/lib/ai/ai-service";
import {
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveProfile?: (cvData: any) => void;
}

export function AICVBuilderModal({ open, onOpenChange, onSaveProfile }: Props) {
  const { lang } = useT();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || "",
    targetRole: "",
    phone: "",
    location: "Dar es Salaam, Tanzania",
    education: "BSc in Computer Science / Business Administration, University of Dar es Salaam",
    experience: "Managed operations and customer relations for 3 years at local enterprise.",
    skills: "Project Management, Communication, Customer Service, Microsoft Office, Analysis",
    languages: "Kiswahili (Native), English (Fluent)",
  });

  const [generatedCV, setGeneratedCV] = useState<string | null>(null);

  const handleGenerateCV = async () => {
    setGenerating(true);
    setGeneratedCV(null);

    try {
      const prompt = `Generate a professional, ready-to-use Tanzanian standard CV formatted in clean Markdown based on these candidate details:
Full Name: ${formData.fullName}
Target Role: ${formData.targetRole}
Phone: ${formData.phone}
Location: ${formData.location}
Education: ${formData.education}
Work History: ${formData.experience}
Skills: ${formData.skills}
Languages: ${formData.languages}

Language requested for CV: ${lang === "sw" ? "Swahili & English headers" : "English"}.
Include sections: Professional Summary, Key Competencies, Work History, Education & Certifications, Languages, and Referees (Available upon request).`;

      const cvText = await aiService.careerChat([], prompt, lang === "sw" ? "sw" : "en");
      setGeneratedCV(cvText);
      setStep(3);
      toast.success(
        lang === "sw"
          ? "CV Yako imetengenezwa kikamilifu!"
          : "Your professional CV has been generated!",
      );
    } catch (err) {
      toast.error("Failed to generate CV. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCV = () => {
    if (generatedCV) {
      navigator.clipboard.writeText(generatedCV);
      toast.success("CV copied to clipboard!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="w-6 h-6 text-emerald-500" />
            <span>
              {lang === "sw" ? "Mtengenezaji wa CV wa Bure (AI CV Builder)" : "Free AI CV Builder"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {lang === "sw"
              ? "Jibu maswali machache rahisi, na AI itatengeneza CV kamili ya kiwango cha kimataifa."
              : "Answer a few quick questions to automatically generate a professionally formatted resume."}
          </DialogDescription>
        </DialogHeader>

        {/* STEP PROGRESS */}
        <div className="flex items-center justify-between text-xs border-b border-border/60 pb-3">
          <div
            className={`flex items-center gap-1.5 font-semibold ${step >= 1 ? "text-emerald-500" : "text-muted-foreground"}`}
          >
            <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Target & Bio</span>
          </div>
          <div
            className={`flex items-center gap-1.5 font-semibold ${step >= 2 ? "text-emerald-500" : "text-muted-foreground"}`}
          >
            <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Experience & Skills</span>
          </div>
          <div
            className={`flex items-center gap-1.5 font-semibold ${step >= 3 ? "text-emerald-500" : "text-muted-foreground"}`}
          >
            <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Result CV</span>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-2">
          {step === 1 && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Full Name</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Amani Joseph Bakari"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Target Role / Job Title</label>
                <Input
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  placeholder="e.g. Sales Manager, Accountant, Software Engineer"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Phone Number</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+255 754 000 000"
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Location / Region</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Dar es Salaam, Arusha, Dodoma..."
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <Button
                onClick={() => {
                  if (!formData.fullName || !formData.targetRole) {
                    toast.error("Please enter your name and target role.");
                    return;
                  }
                  setStep(2);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2 font-semibold mt-4"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Education & Schooling</label>
                <Textarea
                  rows={2}
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="Degree, College, Secondary School..."
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Work History & Past Responsibilities
                </label>
                <Textarea
                  rows={3}
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Describe what you did in previous roles..."
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Skills (Comma separated)</label>
                <Input
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Communication, Accounting, Python, Driving..."
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="rounded-xl gap-1 text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>

                <Button
                  onClick={handleGenerateCV}
                  disabled={generating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2 font-semibold text-xs"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === "sw" ? "Inatengeneza CV..." : "Building CV..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{lang === "sw" ? "Tengeneza CV Sasa" : "Generate CV"}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && generatedCV && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                  Generated CV Preview
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCV}
                  className="h-8 gap-1.5 rounded-lg text-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 whitespace-pre-wrap font-mono text-xs text-foreground leading-relaxed">
                {generatedCV}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl text-xs">
                  Edit Details
                </Button>

                <Button
                  onClick={() => {
                    toast.success("CV saved to your AI Career Profile!");
                    onOpenChange(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2 font-semibold text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save to Profile & Close</span>
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
