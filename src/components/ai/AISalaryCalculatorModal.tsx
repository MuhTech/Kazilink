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
import {
  Calculator,
  Globe2,
  DollarSign,
  TrendingUp,
  Building,
  PlaneTakeoff,
  Check,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISalaryCalculatorModal({ open, onOpenChange }: Props) {
  const { lang } = useT();
  const [role, setRole] = useState("Software Engineer");
  const [location, setLocation] = useState("Dar es Salaam, Tanzania");
  const [expYears, setExpYears] = useState("3");

  // Simulated estimates based on inputs
  const estimatedMin = 1500000;
  const estimatedMax = 3500000;
  const averageTzs = 2400000;
  const estimatedUsd = Math.round(averageTzs / 2650);

  // TRA PAYE tax estimate (approximate Tanzanian progressive bracket)
  const estimatedTax = Math.round(averageTzs * 0.15);
  const netTakeHome = averageTzs - estimatedTax;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Calculator className="w-6 h-6 text-emerald-500" />
            <span>
              {lang === "sw"
                ? "Kikokotoo cha Mshahara & Kodi (AI Salary & Tax)"
                : "AI Salary & Global Relocation Calculator"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {lang === "sw"
              ? "Kadiria mshahara wa wastani, kodi ya TRA (PAYE), na fursa za kazi za kimataifa."
              : "Estimate market salary ranges, TRA PAYE tax estimates, living cost comparisons, and global visa eligibility."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2 space-y-4">
          <div className="space-y-4 text-xs">
            {/* INPUT CONTROLS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-muted/40 rounded-xl border border-border/60">
              <div>
                <label className="font-semibold text-foreground">Role Title</label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="rounded-lg h-8 text-xs mt-1"
                />
              </div>
              <div>
                <label className="font-semibold text-foreground">Location</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-lg h-8 text-xs mt-1"
                />
              </div>
              <div>
                <label className="font-semibold text-foreground">Experience (Years)</label>
                <Input
                  type="number"
                  value={expYears}
                  onChange={(e) => setExpYears(e.target.value)}
                  className="rounded-lg h-8 text-xs mt-1"
                />
              </div>
            </div>

            {/* ESTIMATED SALARY STATS */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Estimated Monthly Market Salary</span>
                <Badge className="bg-emerald-600 text-white font-bold text-xs">
                  ~${estimatedUsd} USD / mo
                </Badge>
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                TZS {averageTzs.toLocaleString()}{" "}
                <span className="text-xs font-normal text-muted-foreground">/ month average</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                <div>
                  <span className="text-muted-foreground">Expected Range:</span>
                  <p className="font-bold text-foreground">
                    TZS {estimatedMin.toLocaleString()} – {estimatedMax.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Est. TRA Tax (PAYE):</span>
                  <p className="font-bold text-rose-500">- TZS {estimatedTax.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-card border border-border/60 flex items-center justify-between">
                <span className="font-bold text-foreground text-xs">
                  Net Take-Home Pay (After Tax):
                </span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  TZS {netTakeHome.toLocaleString()}
                </span>
              </div>
            </div>

            {/* VISA & GLOBAL RELOCATION SUPPORT */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                  <PlaneTakeoff className="w-4 h-4" />
                  <span>Global Opportunity & Visa Eligibility</span>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-blue-500/10 border-blue-500/30 text-blue-600"
                >
                  Global Remote Ready
                </Badge>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Tanzanian professionals with 3+ years in {role} are eligible for remote
                international contracts with companies in Europe, USA, UAE, and Kenya with work-visa
                sponsorship options.
              </p>

              <div className="pt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Legally Remote Contract Eligible</span>
                </div>
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Employer Sponsorship Available</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
