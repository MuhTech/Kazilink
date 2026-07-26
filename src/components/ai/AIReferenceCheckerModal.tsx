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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useT } from "@/lib/i18n";
import { UserCheck, Send, CheckCircle2, ShieldCheck, Mail, Building } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIReferenceCheckerModal({ open, onOpenChange }: Props) {
  const { lang } = useT();

  const [refereeName, setRefereeName] = useState("");
  const [refereeCompany, setRefereeCompany] = useState("");
  const [refereeEmail, setRefereeEmail] = useState("");
  const [sentRequests, setSentRequests] = useState([
    {
      name: "Eng. Baraka Mwita",
      company: "Vodacom Tanzania",
      email: "baraka@vodacom.co.tz",
      status: "Confirmed ✓",
      date: "Yesterday",
    },
  ]);

  const handleSendRequest = () => {
    if (!refereeName || !refereeEmail) {
      toast.error("Please provide referee name and work email.");
      return;
    }

    setSentRequests([
      ...sentRequests,
      {
        name: refereeName,
        company: refereeCompany || "Enterprise",
        email: refereeEmail,
        status: "Pending Email Confirm ✉️",
        date: "Just now",
      },
    ]);

    toast.success(`Reference request sent securely to ${refereeEmail}!`);
    setRefereeName("");
    setRefereeCompany("");
    setRefereeEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <UserCheck className="w-6 h-6 text-emerald-500" />
            <span>
              {lang === "sw"
                ? "Uhakiki wa Marejeo (AI Reference Checker)"
                : "Automated AI Reference Verification"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {lang === "sw"
              ? "Tuma maombi salama kwa waajiri wako wa zamani kuthibitisha uzoefu na utendaji wako wa kazi."
              : "Send secure digital reference requests to former managers and colleagues to confirm employment."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2 space-y-4 text-xs">
          <div className="space-y-4">
            {/* SEND REQUEST FORM */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
              <span className="font-bold text-foreground">Request Reference Endorsement:</span>

              <div className="space-y-2">
                <Input
                  value={refereeName}
                  onChange={(e) => setRefereeName(e.target.value)}
                  placeholder="Manager / Referee Full Name"
                  className="rounded-lg h-8 text-xs"
                />
                <Input
                  value={refereeCompany}
                  onChange={(e) => setRefereeCompany(e.target.value)}
                  placeholder="Company Name (e.g. Tigo Tanzania, CRDB)"
                  className="rounded-lg h-8 text-xs"
                />
                <Input
                  type="email"
                  value={refereeEmail}
                  onChange={(e) => setRefereeEmail(e.target.value)}
                  placeholder="Referee Official Work Email"
                  className="rounded-lg h-8 text-xs"
                />
              </div>

              <Button
                onClick={handleSendRequest}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg gap-2 font-semibold h-8 text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Automated Digital Reference Invite</span>
              </Button>
            </div>

            {/* SENT REQUESTS LIST */}
            <div className="space-y-2">
              <span className="font-bold text-foreground">
                Verification Requests ({sentRequests.length}):
              </span>
              <div className="space-y-2">
                {sentRequests.map((req, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-border/60 bg-card flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-foreground">{req.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {req.company} • {req.email}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        req.status.includes("Confirmed")
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                      }`}
                    >
                      {req.status}
                    </Badge>
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
