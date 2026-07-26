import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { useTheme } from "@/lib/theme-provider";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TANZANIA_REGIONS } from "@/lib/search/search-service";
import { profileSchema } from "@/lib/schemas";
import { toast } from "sonner";
import {
  User,
  Shield,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  UploadCloud,
  Mail,
  Phone,
  MapPin,
  X,
  Bot,
} from "lucide-react";
import { ResumeParserModal } from "@/components/ai/ResumeParserModal";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Candidate Profile — KaziLink Tanzania" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  gradYear: string;
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueYear: string;
}

export function ProfilePage() {
  const { user } = useAuth();
  const { t, setLang } = useT();
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    bio: "",
    location: "",
    headline: "",
    preferred_language: "en" as "en" | "sw",
  });
  const [saving, setSaving] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  // Extended Profile Local State (Persisted in localStorage per user)
  const [skills, setSkills] = useState<string[]>([
    "Software Development",
    "Financial Analysis",
    "Project Management",
    "English & Kiswahili Translation",
  ]);
  const [newSkillInput, setNewSkillInput] = useState("");

  const [experiences, setExperiences] = useState<WorkExperience[]>([
    {
      id: "exp-1",
      title: "Senior Accountant",
      company: "National Microfinance Bank (NMB)",
      location: "Dar es Salaam",
      startDate: "2022-01",
      endDate: "Present",
      isCurrent: true,
      description: "Managed financial reporting, internal audits, and TRA tax compliance.",
    },
  ]);

  const [educations, setEducations] = useState<Education[]>([
    {
      id: "edu-1",
      institution: "University of Dar es Salaam (UDSM)",
      degree: "Bachelor of Commerce in Finance",
      field: "Finance & Accounting",
      gradYear: "2021",
    },
  ]);

  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: "cert-1",
      name: "CPA (Tanzania)",
      issuer: "National Board of Accountants and Auditors (NBAA)",
      issueYear: "2022",
    },
  ]);

  const [portfolioLinks, setPortfolioLinks] = useState({
    website: "https://myportfolio.co.tz",
    linkedin: "https://linkedin.com/in/tanzanian-professional",
    github: "https://github.com/tanzanian-dev",
  });

  const [resumeFileName, setResumeFileName] = useState<string | null>("CV_Professional_2026.pdf");

  // Fetch Supabase Profile
  const profileQ = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profileQ.data) {
      setForm({
        full_name: profileQ.data.full_name ?? "",
        phone: profileQ.data.phone ?? "",
        bio: profileQ.data.bio ?? "",
        location: profileQ.data.location ?? "",
        headline: profileQ.data.headline ?? "",
        preferred_language: (profileQ.data.preferred_language as "en" | "sw") ?? "en",
      });
    }
  }, [profileQ.data]);

  // Load custom local attributes
  useEffect(() => {
    if (user?.id) {
      const savedSkills = localStorage.getItem(`kazilink_skills_${user.id}`);
      if (savedSkills) {
        try {
          setSkills(JSON.parse(savedSkills));
        } catch {
          // ignore invalid cache
        }
      }

      const savedExp = localStorage.getItem(`kazilink_exp_${user.id}`);
      if (savedExp) {
        try {
          setExperiences(JSON.parse(savedExp));
        } catch {
          // ignore invalid cache
        }
      }

      const savedEdu = localStorage.getItem(`kazilink_edu_${user.id}`);
      if (savedEdu) {
        try {
          setEducations(JSON.parse(savedEdu));
        } catch {
          // ignore invalid cache
        }
      }
    }
  }, [user?.id]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user!.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setLang(parsed.data.preferred_language);

      // Persist extended fields
      if (user?.id) {
        localStorage.setItem(`kazilink_skills_${user.id}`, JSON.stringify(skills));
        localStorage.setItem(`kazilink_exp_${user.id}`, JSON.stringify(experiences));
        localStorage.setItem(`kazilink_edu_${user.id}`, JSON.stringify(educations));
      }

      toast.success(t.profile.saved);
      await qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (skills.includes(newSkillInput.trim())) {
      toast.error("Skill already added");
      return;
    }
    setSkills([...skills, newSkillInput.trim()]);
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      id: "exp-" + Date.now(),
      title: "Position Title",
      company: "Company Name",
      location: "Dar es Salaam",
      startDate: "2023-01",
      endDate: "Present",
      isCurrent: true,
      description: "Key responsibilities and achievements.",
    };
    setExperiences([newExp, ...experiences]);
  };

  const handleAddEducation = () => {
    const newEdu: Education = {
      id: "edu-" + Date.now(),
      institution: "Institution Name",
      degree: "Bachelor's Degree",
      field: "Field of Study",
      gradYear: "2024",
    };
    setEducations([newEdu, ...educations]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
      toast.success(`Resume uploaded: ${file.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* PROFILE HEADER & SUB-NAVIGATION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                {form.full_name || "My Professional Profile"}
              </h1>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Candidate
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {form.headline || "Tanzanian Professional Candidate"}
            </p>
          </div>

          {/* Navigation Pill: Profile vs Security */}
          <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
            <Link
              to="/profile"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-background text-foreground shadow flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Professional Profile</span>
            </Link>
            <Link
              to="/profile/security"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Security & Verification</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR: AVATAR & RESUME STATUS */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border/80 bg-card p-6 text-center space-y-4 rounded-2xl shadow-sm">
              <div className="relative inline-block">
                <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-blue-600 text-white font-bold text-3xl flex items-center justify-center shadow-lg border-4 border-background">
                  {form.full_name ? form.full_name.slice(0, 2).toUpperCase() : "KZ"}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-foreground">
                  {form.full_name || "Job Seeker"}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  {form.location || "Dar es Salaam, Tanzania"}
                </p>
              </div>

              <div className="pt-2 border-t border-border/60 text-xs text-left space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{form.phone || "+255 700 000 000"}</span>
                </div>
              </div>
            </Card>

            {/* RESUME / CV CARD */}
            <Card className="border-border/80 bg-card p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" /> Resume / CV
                </h4>
                <Badge variant="outline" className="text-[10px]">
                  PDF / Word
                </Badge>
              </div>

              {resumeFileName ? (
                <div className="p-3 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-between text-xs">
                  <div className="truncate font-medium text-foreground">{resumeFileName}</div>
                  <Badge variant="default" className="text-[10px] bg-emerald-600">
                    Uploaded
                  </Badge>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No CV file uploaded yet.</p>
              )}

              <div className="space-y-2">
                <label className="cursor-pointer inline-flex items-center justify-center w-full h-10 px-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold gap-2 transition">
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload New Resume File</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResumeModalOpen(true)}
                  className="w-full text-xs gap-2 rounded-xl"
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-500" /> Auto-Parse Resume with AI
                </Button>
              </div>
            </Card>

            {/* SKILLS QUICK BADGES CARD */}
            <Card className="border-border/80 bg-card p-5 rounded-2xl space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Top Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs py-1 px-2.5 rounded-lg flex items-center gap-1"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-500 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Input
                  placeholder="Add skill (e.g. Accounting)"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  className="h-8 text-xs rounded-lg"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                />
                <Button
                  size="sm"
                  type="button"
                  onClick={handleAddSkill}
                  className="h-8 px-3 rounded-lg text-xs"
                >
                  Add
                </Button>
              </div>
            </Card>
          </div>

          {/* RIGHT CONTENT: DETAILED PROFILE EDIT FORM */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="personal" className="w-full space-y-6">
              <TabsList className="grid w-full grid-cols-4 p-1 bg-muted/60 rounded-xl">
                <TabsTrigger value="personal" className="text-xs font-semibold rounded-lg">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="experience" className="text-xs font-semibold rounded-lg">
                  Experience
                </TabsTrigger>
                <TabsTrigger value="education" className="text-xs font-semibold rounded-lg">
                  Education
                </TabsTrigger>
                <TabsTrigger value="portfolio" className="text-xs font-semibold rounded-lg">
                  Links & Certs
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: BASIC & CONTACT INFO */}
              <TabsContent value="personal">
                <Card className="border-border/80 bg-card p-6 rounded-2xl shadow-sm space-y-6">
                  <form onSubmit={saveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t.profile.fullName}</Label>
                        <Input
                          value={form.full_name}
                          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                          required
                          maxLength={120}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t.profile.headline}</Label>
                        <Input
                          placeholder="e.g. Civil Engineer | Senior Accountant"
                          value={form.headline}
                          onChange={(e) => setForm({ ...form, headline: e.target.value })}
                          maxLength={160}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t.profile.phone}</Label>
                        <Input
                          placeholder="+255 7xx xxx xxx"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          maxLength={32}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t.profile.location} (Mkoa)</Label>
                        <Select
                          value={form.location || "Dar es Salaam"}
                          onValueChange={(v) => setForm({ ...form, location: v })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TANZANIA_REGIONS.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t.profile.bio}</Label>
                      <Textarea
                        rows={4}
                        placeholder="Brief summary of your background, experience, and career goals..."
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        maxLength={1000}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label>{t.profile.language}</Label>
                        <Select
                          value={form.preferred_language}
                          onValueChange={(v) =>
                            setForm({ ...form, preferred_language: v as "en" | "sw" })
                          }
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="sw">Kiswahili</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Interface Theme / Mandhari</Label>
                        <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light Mode (Mwangaza)</SelectItem>
                            <SelectItem value="dark">Dark Mode (Giza)</SelectItem>
                            <SelectItem value="system">System Default</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
                    >
                      {saving ? t.empty.loading : t.profile.save}
                    </Button>
                  </form>
                </Card>
              </TabsContent>

              {/* TAB 2: WORK EXPERIENCE */}
              <TabsContent value="experience">
                <Card className="border-border/80 bg-card p-6 rounded-2xl shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" /> Work Experience
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Highlight your professional history across Tanzanian and international
                        companies.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddExperience}
                      className="gap-1 rounded-xl text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Experience
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {experiences.map((exp, idx) => (
                      <div
                        key={exp.id}
                        className="p-4 rounded-xl border border-border/70 bg-muted/30 space-y-3 relative"
                      >
                        <button
                          type="button"
                          onClick={() => setExperiences(experiences.filter((e) => e.id !== exp.id))}
                          className="absolute top-3 right-3 text-muted-foreground hover:text-rose-500 transition"
                          title="Delete Experience"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            placeholder="Job Title"
                            value={exp.title}
                            onChange={(e) => {
                              const updated = [...experiences];
                              updated[idx].title = e.target.value;
                              setExperiences(updated);
                            }}
                            className="h-9 text-xs rounded-lg"
                          />
                          <Input
                            placeholder="Company Name"
                            value={exp.company}
                            onChange={(e) => {
                              const updated = [...experiences];
                              updated[idx].company = e.target.value;
                              setExperiences(updated);
                            }}
                            className="h-9 text-xs rounded-lg"
                          />
                        </div>

                        <Textarea
                          placeholder="Key responsibilities & accomplishments..."
                          value={exp.description}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[idx].description = e.target.value;
                            setExperiences(updated);
                          }}
                          rows={2}
                          className="text-xs rounded-lg"
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                  >
                    Save Experience Changes
                  </Button>
                </Card>
              </TabsContent>

              {/* TAB 3: EDUCATION */}
              <TabsContent value="education">
                <Card className="border-border/80 bg-card p-6 rounded-2xl shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-500" /> Education & Academic
                        Credentials
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Add universities, colleges, and training institutes.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddEducation}
                      className="gap-1 rounded-xl text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Education
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {educations.map((edu, idx) => (
                      <div
                        key={edu.id}
                        className="p-4 rounded-xl border border-border/70 bg-muted/30 space-y-3 relative"
                      >
                        <button
                          type="button"
                          onClick={() => setEducations(educations.filter((e) => e.id !== edu.id))}
                          className="absolute top-3 right-3 text-muted-foreground hover:text-rose-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            placeholder="Institution (e.g., UDSM, UDOM)"
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = [...educations];
                              updated[idx].institution = e.target.value;
                              setEducations(updated);
                            }}
                            className="h-9 text-xs rounded-lg"
                          />
                          <Input
                            placeholder="Degree / Qualification"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...educations];
                              updated[idx].degree = e.target.value;
                              setEducations(updated);
                            }}
                            className="h-9 text-xs rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                  >
                    Save Education Credentials
                  </Button>
                </Card>
              </TabsContent>

              {/* TAB 4: PORTFOLIO & CERTIFICATES */}
              <TabsContent value="portfolio">
                <Card className="border-border/80 bg-card p-6 rounded-2xl shadow-sm space-y-6">
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" /> Portfolio & Social Links
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Share your professional website, LinkedIn, and GitHub profile.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Personal Website / Portfolio URL</Label>
                      <Input
                        value={portfolioLinks.website}
                        onChange={(e) =>
                          setPortfolioLinks({ ...portfolioLinks, website: e.target.value })
                        }
                        className="h-9 text-xs rounded-lg"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">LinkedIn Profile URL</Label>
                      <Input
                        value={portfolioLinks.linkedin}
                        onChange={(e) =>
                          setPortfolioLinks({ ...portfolioLinks, linkedin: e.target.value })
                        }
                        className="h-9 text-xs rounded-lg"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">GitHub / Project Repository URL</Label>
                      <Input
                        value={portfolioLinks.github}
                        onChange={(e) =>
                          setPortfolioLinks({ ...portfolioLinks, github: e.target.value })
                        }
                        className="h-9 text-xs rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/60">
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-amber-500" /> Professional Certificates &
                      Licenses
                    </h4>
                    <div className="space-y-3">
                      {certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="p-3 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-foreground">{cert.name}</p>
                            <p className="text-muted-foreground text-[11px]">
                              {cert.issuer} • {cert.issueYear}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            Active
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                  >
                    Save Profile Links
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <ResumeParserModal open={resumeModalOpen} onOpenChange={setResumeModalOpen} />
    </div>
  );
}
