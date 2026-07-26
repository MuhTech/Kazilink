import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppNav } from "@/components/AppNav";
import { useT } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us & Support — KaziLink Tanzania" },
      {
        name: "description",
        content:
          "Get in touch with KaziLink Tanzania support, employer inquiries, BRELA verification help, or physical office locations in Dar es Salaam & Dodoma.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { lang } = useT();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Employer Verification",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(
        lang === "sw"
          ? "Ujumbe wako umepokelewa! Timu ya KaziLink itawasiliana nawe hivi karibuni."
          : "Message sent successfully! Our support team will get back to you within 24 hours.",
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "Employer Verification",
        message: "",
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs">
            {lang === "sw" ? "Mawasiliano na Msaada" : "Contact & Support"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {lang === "sw" ? "Tupo Hapa Kukusaidia" : "We're Here to Help You"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {lang === "sw"
              ? "Wasiliana na timu yetu kwa maswali ya uthibitisho wa waajiri, msaada wa akaunti, au ushauri wa kiufundi."
              : "Reach out to our team regarding employer verification, candidate account support, or general inquiries."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CONTACT FORM */}
          <Card className="lg:col-span-7 border-border/80 bg-card rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                <span>{lang === "sw" ? "Tuma Ujumbe" : "Send Us a Message"}</span>
              </CardTitle>
              <CardDescription>
                {lang === "sw"
                  ? "Jaza fomu hii na tutakujibu ndani ya masaa 24 ya kazi."
                  : "Fill in the details below and our team will respond within 24 business hours."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      {lang === "sw" ? "Jina Kamili *" : "Full Name *"}
                    </label>
                    <Input
                      required
                      placeholder="e.g. Baraka Juma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      {lang === "sw" ? "Barua Pepe *" : "Email Address *"}
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="baraka@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      {lang === "sw" ? "Namba ya Simu (+255)" : "Phone Number (+255)"}
                    </label>
                    <Input
                      placeholder="+255 754 000 000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      {lang === "sw" ? "Somo la Ujumbe" : "Subject"}
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs sm:text-sm"
                    >
                      <option value="Employer Verification">
                        Employer Verification (BRELA/TIN)
                      </option>
                      <option value="Job Seeker Support">Job Seeker Support</option>
                      <option value="AI Assistant Feedback">AI Assistant Feedback</option>
                      <option value="Partnership / Enterprise">
                        Partnership / Enterprise Pricing
                      </option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    {lang === "sw" ? "Ujumbe Wako *" : "Your Message *"}
                  </label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Describe how we can assist you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl gap-2 h-11"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {loading
                      ? lang === "sw"
                        ? "Inatuma..."
                        : "Sending Message..."
                      : lang === "sw"
                        ? "Wasilisha Ujumbe"
                        : "Submit Message"}
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* CONTACT INFO & PHYSICAL OFFICES */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border/80 bg-card p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-500" />
                <span>{lang === "sw" ? "Ofisi Zetu Tanzania" : "Physical Offices"}</span>
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">Dar es Salaam Head Office</p>
                    <p className="text-muted-foreground">
                      Millennium Tower II, 14th Floor, Kijitonyama, Victoria, Dar es Salaam
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">Dodoma Administrative Hub</p>
                    <p className="text-muted-foreground">
                      Government City (Mtumba), Building 4, Dodoma
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-border/40 pt-3">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">Phone & WhatsApp Support</p>
                    <p className="text-muted-foreground">+255 754 888 999 / +255 22 212 3456</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">Official Email</p>
                    <p className="text-muted-foreground">
                      support@kazilink.co.tz / msaada@kazilink.co.tz
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">Working Hours</p>
                    <p className="text-muted-foreground">Monday – Friday: 8:00 AM – 5:00 PM EAT</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-emerald-500/30 bg-emerald-500/5 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Recruitment Guarantee</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                KaziLink Tanzania never requests money from job seekers for interview slots or job
                placements. If any employer asks for payment, report them immediately through our
                support channel.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
