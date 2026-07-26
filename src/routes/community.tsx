import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { useT } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  Share2,
  Search,
  Plus,
  Send,
  Award,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Career Community & Mentorship — KaziLink Tanzania" },
      {
        name: "description",
        content:
          "Connect with professionals, ask career advice, find industry mentors, and discuss job opportunities across Tanzania.",
      },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { lang } = useT();
  const [searchTerm, setSearchTerm] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newBody, setNewBody] = useState("");

  const [posts, setPosts] = useState([
    {
      id: "1",
      author: "David Mollel",
      role: "Senior Software Architect • Arusha",
      topic: "How to negotiate tech salaries in Tanzania for 2026",
      body: "Many candidates accept the first offer without researching market rates. Using the KaziLink AI Salary Calculator gave me benchmark data to negotiate +25% higher.",
      likes: 24,
      replies: 8,
      category: "Salary & Negotiations",
      time: "2 hours ago",
    },
    {
      id: "2",
      author: "Amina Rashid",
      role: "HR & Talent Partner • Dar es Salaam",
      topic: "Top 3 things recruiters look for in a Tanzanian CV",
      body: "1. Quantifiable achievements (numbers). 2. Clear contact & NIDA/Passport verification. 3. Verified skill badges.",
      likes: 42,
      replies: 15,
      category: "CV & Interviews",
      time: "5 hours ago",
    },
  ]);

  const handleCreatePost = () => {
    if (!newTopic.trim()) {
      toast.error("Please enter a discussion title.");
      return;
    }

    setPosts([
      {
        id: Date.now().toString(),
        author: "You (Member)",
        role: "Job Seeker • Tanzania",
        topic: newTopic,
        body: newBody || "Looking forward to insights from the community!",
        likes: 1,
        replies: 0,
        category: "General Career Advice",
        time: "Just now",
      },
      ...posts,
    ]);

    setNewTopic("");
    setNewBody("");
    toast.success("Discussion topic published to the KaziLink community!");
  };

  const handleLike = (id: string) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <AppNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs mb-2">
              KaziLink Community & Mentorship
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {lang === "sw"
                ? "Jukwaa la Wataalamu & Mshauri (Mentors)"
                : "Career Community & Mentorship"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Connect with experienced professionals, recruiters, and mentors across Tanzania.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search discussions..."
                className="pl-9 w-60 rounded-xl h-9 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN POSTS FEED */}
          <div className="lg:col-span-2 space-y-6">
            {/* CREATE POST CARD */}
            <Card className="border-border/80 bg-card p-4 rounded-2xl space-y-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Start a Career Discussion</span>
              </h3>
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Discussion Title / Question (e.g. Tips for Software Engineering interview at Vodacom)"
                className="rounded-xl text-xs h-9"
              />
              <Textarea
                rows={2}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Share your details or questions..."
                className="rounded-xl text-xs"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleCreatePost}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-1.5 text-xs font-semibold px-4"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Topic</span>
                </Button>
              </div>
            </Card>

            {/* POSTS LIST */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="border-border/80 bg-card p-5 rounded-2xl space-y-3 hover:border-emerald-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-emerald-500/30">
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                          {post.author.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{post.author}</h4>
                        <p className="text-[11px] text-muted-foreground">{post.role}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-muted/40">
                      {post.category}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground">{post.topic}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{post.body}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 hover:text-emerald-500 transition font-medium"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.likes} Helpful</span>
                      </button>
                      <span className="flex items-center gap-1 font-medium">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.replies} Replies</span>
                      </span>
                    </div>

                    <span>{post.time}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* SIDEBAR MENTORS */}
          <div className="space-y-6">
            <Card className="border-border/80 bg-card p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>Featured Mentors</span>
                </h3>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                  Verified
                </Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
                  <p className="font-bold text-foreground">Josephine Kimario</p>
                  <p className="text-[11px] text-muted-foreground">
                    Head of People • Bank of Africa Tanzania
                  </p>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-emerald-600 border-emerald-500/30"
                  >
                    HR & Career Prep
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
                  <p className="font-bold text-foreground">Eng. Faraji Khalfan</p>
                  <p className="text-[11px] text-muted-foreground">DevOps Lead • NMB Bank Plc</p>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-emerald-600 border-emerald-500/30"
                  >
                    Cloud & Software
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
