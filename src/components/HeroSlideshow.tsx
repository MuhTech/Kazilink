import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import { TANZANIA_REGIONS } from "@/lib/search/search-service";
import {
  Search,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Briefcase,
  Users,
  ShieldCheck,
  TrendingUp,
  Globe,
  Mic,
} from "lucide-react";

export interface SlideItem {
  id: string;
  imageUrl: string;
  titleEn: string;
  titleSw: string;
  categoryEn: string;
  categorySw: string;
  location: string;
}

const HERO_SLIDES: SlideItem[] = [
  {
    id: "tech-office",
    imageUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=85",
    titleEn: "Software Engineers & Tech Leaders in Dar es Salaam",
    titleSw: "Wandishi wa Programu na Viongozi wa Teknolojia Dar es Salaam",
    categoryEn: "Technology & Innovation",
    categorySw: "Teknolojia na Ubunifu",
    location: "Dar es Salaam, Tanzania",
  },
  {
    id: "engineering",
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=85",
    titleEn: "Civil Engineers & Infrastructure Specialists",
    titleSw: "Wajenzi na Wataalamu wa Miundombinu",
    categoryEn: "Engineering & Construction",
    categorySw: "Uhandisi na Ujenzi",
    location: "Dodoma & Arusha, Tanzania",
  },
  {
    id: "healthcare",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2000&q=85",
    titleEn: "Medical Doctors & Healthcare Professionals",
    titleSw: "Madaktari na Wataalamu wa Afya",
    categoryEn: "Healthcare & Medicine",
    categorySw: "Huduma za Afya na Tiba",
    location: "Mwanza & Kilimanjaro",
  },
  {
    id: "agribusiness",
    imageUrl:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000&q=85",
    titleEn: "Modern Agriculture & Agribusiness Managers",
    titleSw: "Kilimo cha Kasa na Wataalamu wa Kilimo-Biashara",
    categoryEn: "Agriculture & Forestry",
    categorySw: "Kilimo na Maliasili",
    location: "Morogoro & Iringa",
  },
  {
    id: "education",
    imageUrl:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=2000&q=85",
    titleEn: "Educators & Corporate Trainers",
    titleSw: "Walimu na Wakufunzi wa Makampuni",
    categoryEn: "Education & Research",
    categorySw: "Elimu na Utafiti",
    location: "Zanzibar & Tanga",
  },
];

interface HeroSlideshowProps {
  onOpenVoiceModal?: () => void;
}

export function HeroSlideshow({ onOpenVoiceModal }: HeroSlideshowProps) {
  const { t, lang } = useT();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRegion, setSearchRegion] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = HERO_SLIDES[currentIndex];

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
      }, 6000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section
      className="relative overflow-hidden w-full min-h-[640px] sm:min-h-[700px] lg:min-h-[750px] flex items-center border-b border-border"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* BACKGROUND SLIDESHOW WITH KEN BURNS EFFECT */}
      <div className="absolute inset-0 z-0 bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.img
              src={currentSlide.imageUrl}
              alt={lang === "sw" ? currentSlide.titleSw : currentSlide.titleEn}
              loading="lazy"
              initial={{ scale: 1 }}
              animate={{ scale: 1.08 }}
              transition={{ duration: 6.5, ease: "easeOut" }}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Multi-layer Premium Gradient Overlay for Extreme Contrast & Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-black/60 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
      </div>

      {/* HERO CONTENT */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Top Announcement Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-emerald-400 text-xs font-semibold tracking-wide shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>KaziLink Tanzania 🇹🇿 — Bilingual AI Employment Portal</span>
            <span className="hidden sm:inline-block border-l border-emerald-500/30 pl-2 text-[11px] text-emerald-300/80">
              {lang === "sw" ? currentSlide.categorySw : currentSlide.categoryEn}
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md leading-[1.12]"
          >
            {t.tagline}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-slate-200/90 max-w-2xl mx-auto leading-relaxed drop-shadow"
          >
            {lang === "sw"
              ? "Jukwaa kuu la ajira nchini Tanzania. Tafuta kazi za uhakika, tengeneza CV na AI, au ajiri wafanyakazi wenye ujuzi katika mikoa yote 31."
              : "Tanzania's premier career network. Connect with verified employers, build AI-enhanced CVs, and find opportunities across all 31 regions."}
          </motion.p>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Card className="mt-8 border-white/20 bg-slate-950/85 backdrop-blur-xl shadow-2xl rounded-2xl p-3.5 sm:p-5 text-left border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  window.location.href = `/jobs?q=${encodeURIComponent(searchQuery)}${searchRegion ? `&region=${encodeURIComponent(searchRegion)}` : ""}`;
                }}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                {/* Search Input */}
                <div className="sm:col-span-5 relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder={
                      lang === "sw"
                        ? "Jina la kazi, ujuzi, au kampuni..."
                        : "Job title, skills, or company..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 border-slate-800 bg-slate-900/90 text-white placeholder:text-slate-400 text-sm rounded-xl focus-visible:ring-emerald-500"
                  />
                  {onOpenVoiceModal && (
                    <button
                      type="button"
                      onClick={onOpenVoiceModal}
                      title="Voice Search"
                      className="absolute right-3 top-2.5 p-1 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition"
                    >
                      <Mic className="w-4 h-4 animate-pulse" />
                    </button>
                  )}
                </div>

                {/* Region Select */}
                <div className="sm:col-span-4 relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <select
                    value={searchRegion}
                    onChange={(e) => setSearchRegion(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 border border-slate-800 rounded-xl bg-slate-900/90 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-white">
                      {lang === "sw" ? "Mikoa yote Tanzania" : "All Regions in Tanzania"}
                    </option>
                    {TANZANIA_REGIONS.map((r) => (
                      <option key={r} value={r} className="bg-slate-900 text-white">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit CTA */}
                <div className="sm:col-span-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-lg gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>{t.home.heroCta}</span>
                  </Button>
                </div>
              </form>

              {/* Quick Tags */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="font-semibold text-slate-400">
                  {lang === "sw" ? "Inatafutwa sana:" : "Popular searches:"}
                </span>
                {[
                  "Software Engineer",
                  "Dar es Salaam",
                  "Finance & Banking",
                  "Agribusiness",
                  "Mining",
                ].map((tag) => (
                  <Link
                    key={tag}
                    to="/jobs"
                    search={{ q: tag }}
                    className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900/70 hover:bg-slate-800 hover:border-emerald-500/50 text-slate-200 transition"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* SLIDESHOW CONTROLS & CAPTION */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300"
          >
            {/* Slide Title Badge */}
            <div className="flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-medium text-slate-200">
                {lang === "sw" ? currentSlide.titleSw : currentSlide.titleEn}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{currentSlide.location}</span>
            </div>

            {/* Prev/Next & Dots */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? "w-6 bg-emerald-500"
                        : "w-2 bg-slate-600 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                aria-label="Next Slide"
                className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? "Play slideshow" : "Pause slideshow"}
                className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition ml-1"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
