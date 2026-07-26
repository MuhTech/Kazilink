import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n";
import {
  Mic,
  MicOff,
  Sparkles,
  Search,
  AlertCircle,
  RotateCcw,
  Volume2,
  Check,
  Languages,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectQuery?: (query: string) => void;
}

export function VoiceAssistantModal({ open, onOpenChange, onSelectQuery }: Props) {
  const { t, lang } = useT();
  const nav = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "listening" | "processing" | "error" | "unsupported"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [transcript, setTranscript] = useState("");
  const [selectedLang, setSelectedLang] = useState<"sw-TZ" | "en-US">(
    lang === "sw" ? "sw-TZ" : "en-US",
  );

  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("unsupported");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = selectedLang;

      rec.onstart = () => {
        setIsListening(true);
        setStatus("listening");
        setErrorMessage("");
      };

      rec.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const phrase = event.results[i][0].transcript;
          currentTranscript += phrase;
        }
        if (currentTranscript) {
          setTranscript(currentTranscript);
          setStatus("processing");
        }
      };

      rec.onerror = (event: any) => {
        console.error("SpeechRecognition error:", event.error);
        setIsListening(false);
        setStatus("error");

        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setErrorMessage(
            selectedLang === "sw-TZ"
              ? "Haki ya maikrofoni imekataliwa. Tafadhali ruhusu maikrofoni kwenye browser yako."
              : "Microphone permission denied. Please allow microphone access in your browser settings.",
          );
        } else if (event.error === "no-speech") {
          setErrorMessage(
            selectedLang === "sw-TZ"
              ? "Hukusema kitu chochote. Bofya maikrofoni na uongee tena."
              : "No speech detected. Please click microphone and try speaking again.",
          );
        } else if (event.error === "network") {
          setErrorMessage(
            selectedLang === "sw-TZ"
              ? "Tatizo la mtandao. Tafadhali hakikisha upo mtandaoni."
              : "Network connection error while processing speech.",
          );
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        if (status === "listening" || status === "processing") {
          setStatus("idle");
        }
      };

      recognitionRef.current = rec;
    } catch (err: any) {
      console.error("Error creating SpeechRecognition instance:", err);
      setStatus("unsupported");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [selectedLang]);

  // Restart recognition if language changed while open
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLang;
    }
  }, [selectedLang]);

  const startListening = () => {
    if (!recognitionRef.current) {
      setStatus("unsupported");
      return;
    }
    setTranscript("");
    setErrorMessage("");
    try {
      recognitionRef.current.start();
    } catch (err: any) {
      // If already started or stopped
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 100);
      } catch (e) {
        console.error("Cannot start speech recognition:", e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setIsListening(false);
    setStatus("idle");
  };

  const handleExecuteSearch = () => {
    if (!transcript.trim()) {
      toast.error(
        selectedLang === "sw-TZ"
          ? "Tafadhali sema au andika neno la kutafuta."
          : "Please speak or enter a search query.",
      );
      return;
    }
    onOpenChange(false);
    if (onSelectQuery) {
      onSelectQuery(transcript.trim());
    } else {
      void nav({ to: "/jobs", search: { q: transcript.trim() } });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center p-6 border-border/80 bg-card rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
            <span>{selectedLang === "sw-TZ" ? "Tafuta Kazi Kwa Sauti" : "Voice Job Search"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {selectedLang === "sw-TZ"
              ? "Sema mfano: 'Natafuta kazi ya udaktari Dar es Salaam' au 'Software Engineer'"
              : "Speak naturally, e.g., 'Accountant jobs in Arusha' or 'Mining Engineer'"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center gap-5">
          {/* Language Switcher */}
          <div className="flex items-center justify-center gap-2 bg-muted p-1 rounded-xl">
            <button
              onClick={() => setSelectedLang("sw-TZ")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedLang === "sw-TZ"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇹🇿 Swahili (sw-TZ)
            </button>
            <button
              onClick={() => setSelectedLang("en-US")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedLang === "en-US"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇬🇧 English (en-US)
            </button>
          </div>

          {/* Microphone Pulse Circle */}
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <div className="absolute h-32 w-32 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
                <div className="absolute h-28 w-28 rounded-full bg-emerald-500/30 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 h-24 w-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                isListening
                  ? "bg-rose-600 text-white ring-4 ring-rose-200 dark:ring-rose-900 scale-105"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/60"
              }`}
            >
              {isListening ? (
                <MicOff className="h-10 w-10 animate-bounce" />
              ) : (
                <Mic className="h-10 w-10" />
              )}
            </button>
          </div>

          {/* Equalizer Audio Waveform Animation while listening */}
          {isListening && (
            <div className="flex items-end justify-center gap-1 h-8 my-1">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-emerald-500 rounded-full animate-pulse"
                  style={{
                    height: `${Math.floor(Math.random() * 24) + 8}px`,
                    animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Status Badge */}
          <div>
            {status === "listening" && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs px-3 py-1 animate-pulse">
                🎙️{" "}
                {selectedLang === "sw-TZ" ? "Inasikiliza... Sema sasa" : "Listening... Speak now"}
              </Badge>
            )}
            {status === "processing" && (
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs px-3 py-1">
                ⚡ {selectedLang === "sw-TZ" ? "Inatambua maneno..." : "Recognizing speech..."}
              </Badge>
            )}
            {status === "idle" && !transcript && (
              <Badge variant="outline" className="text-xs">
                {selectedLang === "sw-TZ" ? "Bofya maikrofoni kuanza" : "Click microphone to speak"}
              </Badge>
            )}
            {status === "unsupported" && (
              <Badge variant="destructive" className="text-xs gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Browser Not Supported
              </Badge>
            )}
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="w-full rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-semibold">
                  {selectedLang === "sw-TZ" ? "Hitilafu ya Maikrofoni:" : "Microphone Notice:"}
                </p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Live Transcript Display Box */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>
                {selectedLang === "sw-TZ" ? "Maneno Yaliyotambuliwa:" : "Recognized Text:"}
              </span>
              {transcript && typeof window !== "undefined" && "speechSynthesis" in window && (
                <button
                  type="button"
                  onClick={() => {
                    const utter = new SpeechSynthesisUtterance(transcript);
                    utter.lang = selectedLang;
                    window.speechSynthesis.speak(utter);
                  }}
                  className="text-emerald-600 hover:text-emerald-500 font-medium inline-flex items-center gap-1 transition"
                  title="Sikiliza (Read Aloud)"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{selectedLang === "sw-TZ" ? "Sikiliza" : "Read Aloud"}</span>
                </button>
              )}
            </div>
            <Input
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={
                isListening
                  ? selectedLang === "sw-TZ"
                    ? "Inasikiliza..."
                    : "Listening..."
                  : selectedLang === "sw-TZ"
                    ? "Matokeo yataonekana hapa..."
                    : "Spoken transcript will appear here..."
              }
              className="h-12 border-border/80 bg-muted/40 font-medium text-sm text-foreground rounded-xl"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTranscript("");
                startListening();
              }}
              className="rounded-xl text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{selectedLang === "sw-TZ" ? "Futa & Jaribu Tena" : "Reset & Retry"}</span>
            </Button>

            <Button
              type="button"
              onClick={handleExecuteSearch}
              disabled={!transcript.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{selectedLang === "sw-TZ" ? "Tafuta Kazi" : "Search Jobs"}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
