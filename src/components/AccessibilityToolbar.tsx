import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Eye, Type, SunMoon, Volume2, Keyboard, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function AccessibilityToolbar() {
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xl">("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showKbHelp, setShowKbHelp] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === "large") {
      root.style.fontSize = "18px";
    } else if (fontSize === "xl") {
      root.style.fontSize = "20px";
    } else {
      root.style.fontSize = "16px";
    }
  }, [fontSize]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  }, [highContrast]);

  const resetAll = () => {
    setFontSize("normal");
    setHighContrast(false);
    setSoundEnabled(false);
    document.documentElement.style.fontSize = "16px";
    document.documentElement.classList.remove("high-contrast");
    toast.info("Accessibility settings reset to default.");
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full bg-card/90 border-primary/40 shadow-lg hover:bg-card flex items-center gap-2 text-xs font-semibold px-3 py-2"
            aria-label="Accessibility settings"
          >
            <Eye className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Accessibility</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-72 p-4 rounded-2xl shadow-xl space-y-4 bg-card border-border"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-500" />
              <span>Accessibility Suite</span>
            </h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={resetAll}
              title="Reset Settings"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </div>

          {/* Text Sizing */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-emerald-500" />
              Text Sizing
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                size="sm"
                variant={fontSize === "normal" ? "default" : "outline"}
                onClick={() => setFontSize("normal")}
                className="text-xs h-8 rounded-lg"
              >
                100%
              </Button>
              <Button
                size="sm"
                variant={fontSize === "large" ? "default" : "outline"}
                onClick={() => setFontSize("large")}
                className="text-xs h-8 rounded-lg"
              >
                112%
              </Button>
              <Button
                size="sm"
                variant={fontSize === "xl" ? "default" : "outline"}
                onClick={() => setFontSize("xl")}
                className="text-xs h-8 rounded-lg"
              >
                125%
              </Button>
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <SunMoon className="w-3.5 h-3.5 text-blue-500" />
              High Contrast Mode
            </span>
            <Button
              size="sm"
              variant={highContrast ? "default" : "outline"}
              onClick={() => setHighContrast(!highContrast)}
              className="h-7 text-xs px-2.5 rounded-lg"
            >
              {highContrast ? "ON" : "OFF"}
            </Button>
          </div>

          {/* Screen Reader Cues */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-purple-500" />
              Audio Navigation Cues
            </span>
            <Button
              size="sm"
              variant={soundEnabled ? "default" : "outline"}
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                toast.success(
                  soundEnabled ? "Audio cues disabled" : "Audio navigation cues enabled",
                );
              }}
              className="h-7 text-xs px-2.5 rounded-lg"
            >
              {soundEnabled ? "ON" : "OFF"}
            </Button>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="pt-2 border-t border-border/60">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKbHelp(!showKbHelp)}
              className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-between h-8 px-2"
            >
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-amber-500" />
                Keyboard Shortcuts
              </span>
              <Badge variant="outline" className="text-[10px] px-1.5">
                Press ?
              </Badge>
            </Button>

            {showKbHelp && (
              <div className="mt-2 p-2 rounded-xl bg-muted/40 text-[11px] space-y-1 text-muted-foreground">
                <p>
                  <strong>/</strong> Focus Search Bar
                </p>
                <p>
                  <strong>Tab</strong> Navigate Controls
                </p>
                <p>
                  <strong>Esc</strong> Close Modals
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
