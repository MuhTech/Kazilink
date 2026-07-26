import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { aiService } from "@/lib/ai/ai-service";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { Bot, Send, User, Sparkles, Loader2, Globe } from "lucide-react";
import type { AICareerChatMessage } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AICareerAssistantModal({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { t, lang, setLang } = useT();
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLang, setChatLang] = useState<"en" | "sw">(lang === "sw" ? "sw" : "en");

  // Keep chatLang in sync if global lang changes
  useEffect(() => {
    if (lang === "en" || lang === "sw") {
      setChatLang(lang);
    }
  }, [lang]);

  const toggleLanguage = () => {
    const nextLang = chatLang === "en" ? "sw" : "en";
    setChatLang(nextLang);
    setLang(nextLang);

    // Append localized system notification message
    const langChangeNotice: AICareerChatMessage = {
      id: "lang-change-" + Date.now(),
      user_id: user?.id || "guest",
      session_id: "s1",
      role: "assistant",
      content:
        nextLang === "sw"
          ? "🌐 Lugha imebadilishwa kuwa Kiswahili. Ninaweza kukusaidia vipi kukuza taaluma yako leo?"
          : "🌐 Language changed to English. How can I assist you with your career goals today?",
      language: nextLang,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, langChangeNotice]);
  };
  const [messages, setMessages] = useState<AICareerChatMessage[]>([
    {
      id: "welcome",
      user_id: user?.id || "guest",
      session_id: "s1",
      role: "assistant",
      content:
        chatLang === "sw"
          ? "Habari! Mimi ni Msaidizi wa Kazi wa KaziLink Tanzania. Ninaweza kukusaidia kuandika CV bora, kujiandaa na usaili, na kuelewa fursa za ajira nchini Tanzania. Naweza kukusaidia vipi leo?"
          : "Hello! I am your KaziLink Tanzania AI Career Assistant. I can help you craft a standout CV, prepare for job interviews, or navigate salary expectations in Tanzania. How can I assist you today?",
      language: chatLang,
      created_at: new Date().toISOString(),
    },
  ]);

  const send = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || loading) return;

    const userMsg = inputMsg.trim();
    setInputMsg("");

    const newMsg: AICareerChatMessage = {
      id: Math.random().toString(),
      user_id: user?.id || "guest",
      session_id: "s1",
      role: "user",
      content: userMsg,
      language: chatLang,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const replyText = await aiService.careerChat(messages, userMsg, chatLang);
      const botMsg: AICareerChatMessage = {
        id: Math.random().toString(),
        user_id: user?.id || "guest",
        session_id: "s1",
        role: "assistant",
        content: replyText,
        language: chatLang,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-card flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base flex items-center gap-2">
                {t.ai.careerAssistantTitle}
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" /> AI
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">{t.ai.careerAssistantSub}</DialogDescription>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1 hover:border-primary transition"
            onClick={toggleLanguage}
          >
            <Globe className="h-3.5 w-3.5 text-emerald-500" />
            {chatLang === "en" ? "English → Kiswahili" : "Kiswahili → English"}
          </Button>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 text-sm ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`rounded-lg px-4 py-2.5 max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border border-border"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg bg-muted px-4 py-2.5 text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  KaziLink AI is thinking…
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={send} className="p-3 border-t bg-card flex gap-2">
          <Input
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={t.ai.typeQuestion}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !inputMsg.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
