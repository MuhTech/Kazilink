import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Briefcase, Bot, Mic, Shield } from "lucide-react";
import { AICareerAssistantModal } from "@/components/ai/AICareerAssistantModal";
import { VoiceAssistantModal } from "@/components/ai/VoiceAssistantModal";
import { AccessibilityToolbar } from "@/components/AccessibilityToolbar";

export function AppNav() {
  const { user, isAdmin, hasRole, loading } = useAuth();
  const { t } = useT();
  const isEmployer = hasRole("employer") || hasRole("recruiter") || isAdmin;

  const [aiOpen, setAiOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground shrink-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Briefcase className="h-4 w-4" aria-hidden />
            </span>
            <span className="hidden sm:inline">{t?.brand || "KaziLink Tanzania"}</span>
          </Link>

          <nav className="flex items-center gap-1 text-sm overflow-x-auto">
            <Link
              to="/jobs"
              className="rounded-md px-2.5 py-2 text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium whitespace-nowrap"
            >
              {t.nav.jobs}
            </Link>
            <Link
              to="/tools"
              className="rounded-md px-2.5 py-2 text-emerald-600 dark:text-emerald-400 font-medium hover:text-foreground [&.active]:font-bold whitespace-nowrap flex items-center gap-1"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>AI Tools</span>
            </Link>
            <Link
              to="/community"
              className="rounded-md px-2.5 py-2 text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium whitespace-nowrap"
            >
              Community
            </Link>
            <Link
              to="/pricing"
              className="rounded-md px-2.5 py-2 text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium whitespace-nowrap"
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="hidden md:inline-block rounded-md px-2.5 py-2 text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium whitespace-nowrap"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="hidden lg:inline-block rounded-md px-2.5 py-2 text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium whitespace-nowrap"
            >
              Contact
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="rounded-md px-2.5 py-2 text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium whitespace-nowrap"
              >
                {t.nav.dashboard}
              </Link>
            )}
            {user && (
              <Link
                to="/applications"
                className="rounded-md px-2.5 py-2 text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium whitespace-nowrap"
              >
                {t.nav.applications}
              </Link>
            )}
            {user && isEmployer && (
              <Link
                to="/employer/jobs"
                className="rounded-md px-2.5 py-2 text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium whitespace-nowrap"
              >
                {t.nav.employer}
              </Link>
            )}
            {user && isAdmin && (
              <>
                <Link
                  to="/admin"
                  className="rounded-md px-2.5 py-2 text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium whitespace-nowrap"
                >
                  {t.nav.admin}
                </Link>
                <Link
                  to="/admin/connectors"
                  className="rounded-md px-2.5 py-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:text-foreground [&.active]:text-foreground [&.active]:font-medium whitespace-nowrap"
                >
                  Global Connectors
                </Link>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setAiOpen(true)}
              title={t.nav.aiAssistant}
            >
              <Bot className="h-4 w-4 text-primary" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setVoiceOpen(true)}
              title={t.nav.voiceSearch}
            >
              <Mic className="h-4 w-4 text-emerald-600" />
            </Button>

            <LanguageSwitcher />
            <ThemeToggle />

            {!loading && !user && (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">{t.nav.signin}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    {t.nav.signup}
                  </Link>
                </Button>
              </>
            )}

            {user && (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                  <Link to="/profile/security" className="gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    {t.nav.security}
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/profile">{t.nav.profile}</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={signOut}>
                  {t.nav.signout}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <AICareerAssistantModal open={aiOpen} onOpenChange={setAiOpen} />
      <VoiceAssistantModal open={voiceOpen} onOpenChange={setVoiceOpen} />
      <AccessibilityToolbar />
    </>
  );
}
