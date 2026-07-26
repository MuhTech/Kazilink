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
import {
  Layout,
  Sparkles,
  ExternalLink,
  Code2,
  FolderGit2,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIPortfolioGeneratorModal({ open, onOpenChange }: Props) {
  const { lang } = useT();
  const { user } = useAuth();

  const [projects, setProjects] = useState([
    {
      title: "Mobile Money Agent Dashboard",
      description: "Real-time analytics portal for agent network across Tanzania.",
      tags: "React, Node.js, PostgreSQL",
      link: "https://github.com/example/project1",
    },
    {
      title: "E-Commerce Logistics App",
      description: "Bilingual Swahili delivery tracking app for Dar es Salaam.",
      tags: "React Native, Tailwind, Supabase",
      link: "https://github.com/example/project2",
    },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newLink, setNewLink] = useState("");

  const addProject = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a project title.");
      return;
    }
    setProjects([
      ...projects,
      { title: newTitle, description: newDesc, tags: newTags, link: newLink },
    ]);
    setNewTitle("");
    setNewDesc("");
    setNewTags("");
    setNewLink("");
    toast.success("Project added to portfolio!");
  };

  const removeProject = (idx: number) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Layout className="w-6 h-6 text-emerald-500" />
            <span>
              {lang === "sw"
                ? "Mtengenezaji wa Wasifu wa Kazi (Portfolio Generator)"
                : "AI Showcase Portfolio Builder"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {lang === "sw"
              ? "Tengeneza ukurasa wako wa mifano ya kazi (Developers, Designers, Architects) wa kushiriki na waajiri."
              : "Generate a standalone showcase portfolio for developers, designers, photographers, and architects."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2 space-y-4">
          <div className="space-y-4 text-xs">
            {/* ADD PROJECT FORM */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
              <span className="font-bold text-foreground">Add Showpiece Project:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Project Title (e.g. M-Pesa Integration)"
                  className="rounded-lg h-8 text-xs"
                />
                <Input
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="Demo / GitHub URL"
                  className="rounded-lg h-8 text-xs"
                />
              </div>

              <Textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief project description..."
                className="rounded-lg text-xs"
              />

              <div className="flex items-center justify-between gap-2">
                <Input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Tech Stack / Tools (e.g. Figma, React, Python)"
                  className="rounded-lg h-8 text-xs flex-1"
                />
                <Button
                  size="sm"
                  onClick={addProject}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg h-8 gap-1 text-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </Button>
              </div>
            </div>

            {/* PROJECT LIST PREVIEW */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">
                  Portfolio Projects ({projects.length}):
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                  Live Public Shareable
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {projects.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border/80 bg-card space-y-2 relative group shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <FolderGit2 className="w-4 h-4 text-emerald-500" />
                        <span>{p.title}</span>
                      </h4>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProject(idx)}
                        className="h-6 w-6 text-muted-foreground hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">{p.description}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.split(",").map((t, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 bg-muted/40"
                          >
                            {t.trim()}
                          </Badge>
                        ))}
                      </div>

                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <span>View Project</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
