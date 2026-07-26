import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { signInSchema, signUpSchema } from "@/lib/schemas";
import { toast } from "sonner";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — KaziLink Tanzania" },
      { name: "description", content: "Sign in or create your KaziLink Tanzania account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const { t } = useT();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"job_seeker" | "employer">("job_seeker");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) void nav({ to: "/dashboard" });
  }, [user, loading, nav]);

  const signInWithGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (res.error) toast.error(res.error.message);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ email, password, fullName, role });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsed.data.fullName, role: parsed.data.role },
          },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Account created");
      } else {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) {
          toast.error(error.message);
          return;
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? t.auth.welcome : t.auth.createAccount}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.brand}</p>
        </div>

        <Button type="button" variant="outline" onClick={signInWithGoogle}>
          {t.auth.google}
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t.auth.or}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">{t.auth.fullName}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={8}
            />
          </div>
          {mode === "signup" && (
            <div className="space-y-2">
              <Label>{t.auth.role}</Label>
              <RadioGroup
                value={role}
                onValueChange={(v) => setRole(v as typeof role)}
                className="grid grid-cols-2 gap-2"
              >
                <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm has-[[data-state=checked]]:border-primary">
                  <RadioGroupItem value="job_seeker" /> {t.auth.jobSeeker}
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm has-[[data-state=checked]]:border-primary">
                  <RadioGroupItem value="employer" /> {t.auth.employer}
                </label>
              </RadioGroup>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t.empty.loading : mode === "signin" ? t.nav.signin : t.nav.signup}
          </Button>
        </form>

        <button
          type="button"
          className="text-center text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? t.auth.noAccount : t.auth.haveAccount}
        </button>
      </main>
    </div>
  );
}
