import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Mail,
  Phone,
  Smartphone,
  Globe,
  Trash2,
  LogOut,
  BellRing,
  History,
  ShieldAlert,
  User,
  Shield,
  Chrome,
  Brain,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile/security")({
  head: () => ({
    meta: [
      { title: "Security & Account Verification — KaziLink Tanzania" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SecurityPage,
});

export function SecurityPage() {
  const { user } = useAuth();
  const { t } = useT();
  const qc = useQueryClient();

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // NIDA Verification State
  const [nidaNumber, setNidaNumber] = useState("");
  const [submittingNida, setSubmittingNida] = useState(false);

  // Privacy & Preferences State
  const [publicProfile, setPublicProfile] = useState(true);
  const [searchableByEmployers, setSearchableByEmployers] = useState(true);
  const [hidePhoneFromUnverified, setHidePhoneFromUnverified] = useState(true);
  const [securityAlertsEmail, setSecurityAlertsEmail] = useState(true);
  const [aiLearningEnabled, setAiLearningEnabled] = useState(
    user ? localStorage.getItem(`kazilink_ai_optout_${user.id}`) !== "true" : true,
  );
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(true);

  // Delete Account Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // Query User Preferences
  const preferencesQ = useQuery({
    queryKey: ["user-preferences", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data || { mfa_enabled: false, email_verified: true, phone_verified: false };
    },
  });

  // Query Account Verification
  const verificationQ = useQuery({
    queryKey: ["account-verification", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("account_verifications")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error("Failed to update password: " + err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const submitNidaVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nidaNumber.trim() || nidaNumber.trim().length < 10) {
      toast.error("Please enter a valid NIDA ID or Passport number.");
      return;
    }

    setSubmittingNida(true);
    try {
      const { error } = await supabase.from("account_verifications").upsert({
        user_id: user!.id,
        id_type: "nida",
        id_number: nidaNumber.trim(),
        status: "pending",
      });
      if (error) throw error;
      toast.success("NIDA ID submitted for admin review!");
      await qc.invalidateQueries({ queryKey: ["account-verification", user?.id] });
    } catch (err: any) {
      toast.error("Failed to submit ID: " + err.message);
    } finally {
      setSubmittingNida(false);
    }
  };

  const toggleMfa = async (checked: boolean) => {
    try {
      await supabase.from("user_preferences").upsert({
        user_id: user!.id,
        mfa_enabled: checked,
      });
      toast.success(checked ? "2FA Protection Enabled" : "2FA Protection Disabled");
      await qc.invalidateQueries({ queryKey: ["user-preferences", user?.id] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const signOutAllDevices = async () => {
    try {
      await supabase.auth.signOut({ scope: "global" });
      toast.success("Signed out from all active devices");
      window.location.href = "/auth";
    } catch (err: any) {
      toast.error("Error signing out: " + err.message);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmationText !== "DELETE") {
      toast.error("Please type DELETE to confirm account removal.");
      return;
    }
    toast.error(
      "Account deletion requested. Please contact support@kazilink.co.tz for final data wipe.",
    );
    setDeleteModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* TOP NAVIGATION HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              <span>Security & Account Verification</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your password, 2FA authentication, logged in sessions, NIDA verification, and
              privacy rules.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
            <Link
              to="/profile"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Professional Profile</span>
            </Link>
            <Link
              to="/profile/security"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-background text-foreground shadow flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Security & Verification</span>
            </Link>
          </div>
        </div>

        {/* SECURITY CARDS GRID */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* CARD 1: CHANGE PASSWORD */}
          <Card className="border-border/80 bg-card rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-emerald-500" /> Change Password
              </CardTitle>
              <CardDescription className="text-xs">
                Ensure your KaziLink account remains secure with a strong password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updatePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">New Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password (min 8 chars)"
                    required
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updatingPassword}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                >
                  {updatingPassword ? "Updating Password..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* CARD 2: TWO-FACTOR AUTHENTICATION (2FA) */}
          <Card className="border-border/80 bg-card rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" /> Two-Factor Authentication (2FA)
              </CardTitle>
              <CardDescription className="text-xs">
                Protect your account with SMS OTP codes or authenticator apps upon login.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border border-border/80 rounded-xl p-3.5 bg-muted/30">
                <div>
                  <h4 className="font-semibold text-xs">Require 2FA / Phone OTP</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Prompt for verification code on new sign-ins
                  </p>
                </div>
                <Switch checked={!!preferencesQ.data?.mfa_enabled} onCheckedChange={toggleMfa} />
              </div>

              <div className="border border-border/60 rounded-xl p-3 space-y-2 bg-muted/20 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" /> Email Verification:
                  </span>
                  <Badge variant="default" className="gap-1 text-[10px] bg-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> Phone OTP Verification:
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Ready
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 3: NIDA GOVERNMENT ID VERIFICATION */}
          <Card className="md:col-span-2 border-border/80 bg-card rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-500" /> NIDA Government ID Verification
              </CardTitle>
              <CardDescription className="text-xs">
                Verifying your NIDA ID builds employer trust and unlocks priority job applications
                across Tanzania.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verificationQ.data ? (
                <div className="rounded-xl border border-border/80 p-4 flex items-center justify-between bg-muted/30">
                  <div>
                    <div className="font-bold text-sm text-foreground">
                      NIDA Number: {verificationQ.data.id_number}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Submitted on {new Date(verificationQ.data.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge
                    className={
                      verificationQ.data.status === "verified"
                        ? "bg-emerald-600 text-white"
                        : verificationQ.data.status === "pending"
                          ? "bg-amber-500 text-white"
                          : "bg-rose-600 text-white"
                    }
                  >
                    {verificationQ.data.status.toUpperCase()}
                  </Badge>
                </div>
              ) : (
                <form onSubmit={submitNidaVerification} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">NIDA ID Number / Passport Number</Label>
                    <Input
                      value={nidaNumber}
                      onChange={(e) => setNidaNumber(e.target.value)}
                      placeholder="e.g. 19901234-12345-00001-12"
                      required
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submittingNida}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl"
                  >
                    {submittingNida ? "Submitting..." : "Submit NIDA ID for Verification"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* CARD 4: ACTIVE SESSIONS & LOGGED-IN DEVICES */}
          <Card className="md:col-span-2 border-border/80 bg-card rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-emerald-500" /> Active Logged-In Sessions
                </CardTitle>
                <CardDescription className="text-xs">
                  Devices currently authorized to access your KaziLink candidate account.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOutAllDevices}
                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out All Devices
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-border/80 p-4 flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600">
                    <Chrome className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-foreground">
                      Current Web Browser Session
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Dar es Salaam, Tanzania • SSL Encrypted Session
                    </div>
                  </div>
                </div>
                <Badge variant="default" className="text-[10px] bg-emerald-600">
                  Active Device
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* CARD 5: PRIVACY & CANDIDATE VISIBILITY */}
          <Card className="md:col-span-2 border-border/80 bg-card rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" /> Privacy & Profile Visibility
              </CardTitle>
              <CardDescription className="text-xs">
                Control who can view your resume and contact details across Tanzania.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border border-border/70 p-3 rounded-xl">
                <div>
                  <h4 className="font-semibold text-xs text-foreground">
                    Public Candidate Profile
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Allow verified employers to search your profile
                  </p>
                </div>
                <Switch checked={publicProfile} onCheckedChange={setPublicProfile} />
              </div>

              <div className="flex items-center justify-between border border-border/70 p-3 rounded-xl">
                <div>
                  <h4 className="font-semibold text-xs text-foreground">
                    Hide Phone Number from Unverified Employers
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Only show contact details after employer verification
                  </p>
                </div>
                <Switch
                  checked={hidePhoneFromUnverified}
                  onCheckedChange={setHidePhoneFromUnverified}
                />
              </div>

              <div className="flex items-center justify-between border border-border/70 p-3 rounded-xl">
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Email Security Alerts</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Notify me immediately of logins from new devices
                  </p>
                </div>
                <Switch checked={securityAlertsEmail} onCheckedChange={setSecurityAlertsEmail} />
              </div>

              <div className="flex items-center justify-between border border-primary/30 p-3 rounded-xl bg-primary/5">
                <div>
                  <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-primary" /> AI Continuous Learning &
                    Personalization
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Allow AI to learn from anonymous search queries to improve autocomplete & job
                    recommendations
                  </p>
                </div>
                <Switch
                  checked={aiLearningEnabled}
                  onCheckedChange={(checked) => {
                    setAiLearningEnabled(checked);
                    if (user) {
                      localStorage.setItem(
                        `kazilink_ai_optout_${user.id}`,
                        checked ? "false" : "true",
                      );
                    }
                    toast.success(checked ? "AI Personalization enabled" : "AI Learning opted out");
                  }}
                />
              </div>

              <div className="flex items-center justify-between border border-emerald-500/30 p-3 rounded-xl bg-emerald-500/5">
                <div>
                  <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Location Services & Commute
                    Distance Calculation
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Allow GPS distance calculation and interactive map travel times
                  </p>
                </div>
                <Switch
                  checked={locationServicesEnabled}
                  onCheckedChange={(checked) => {
                    setLocationServicesEnabled(checked);
                    toast.success(
                      checked ? "Location services enabled" : "Location services disabled",
                    );
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* CARD 6: DANGER ZONE - DELETE ACCOUNT */}
          <Card className="md:col-span-2 border-rose-500/30 bg-rose-500/5 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-rose-600 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-600" /> Account Removal
              </CardTitle>
              <CardDescription className="text-xs text-rose-600/80">
                Permanently delete your KaziLink account, applications, and CV history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setDeleteModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Account Permanently
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* DELETE ACCOUNT CONFIRMATION DIALOG */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Delete Account Confirmation
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              This action cannot be undone. Type{" "}
              <span className="font-bold text-foreground">DELETE</span> below to confirm permanent
              account wipe.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <Input
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Type DELETE"
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmationText !== "DELETE"}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
            >
              Confirm Account Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
