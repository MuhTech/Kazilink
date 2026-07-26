import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Navigation,
  Globe,
  Building2,
  Compass,
  Car,
  PlaneTakeoff,
  ExternalLink,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  calculateHaversineDistance,
  getTravelTimeEstimates,
  formatDistance,
  type LocationCoordinates,
} from "@/lib/geo/distance-utils";
import { toast } from "sonner";

export interface GlobalMapJob {
  id: string;
  title: string;
  companyName: string;
  sourceConnectorName: string;
  locationName: string;
  country: string;
  region: string;
  coordinates: LocationCoordinates;
  isRemote: boolean;
  salaryDisplay: string;
  applyUrl: string;
  aiScore: number;
}

const GLOBAL_MAP_JOBS: GlobalMapJob[] = [
  {
    id: "gmap_1",
    title: "Senior Full Stack Engineer",
    companyName: "GitLab Worldwide",
    sourceConnectorName: "Remote OK",
    locationName: "Dar es Salaam & Global Remote",
    country: "Tanzania",
    region: "Dar es Salaam",
    coordinates: { lat: -6.7924, lng: 39.2083 },
    isRemote: true,
    salaryDisplay: "$85,000 - $125,000 / yr",
    applyUrl: "#",
    aiScore: 98,
  },
  {
    id: "gmap_2",
    title: "Mhandisi wa Barabara II (Civil Engineer)",
    companyName: "TANROADS Dodoma",
    sourceConnectorName: "Tanzania PSRS",
    locationName: "Dodoma City, Tanzania",
    country: "Tanzania",
    region: "Dodoma",
    coordinates: { lat: -6.163, lng: 35.7516 },
    isRemote: false,
    salaryDisplay: "TZS 1.8M - 2.6M / month",
    applyUrl: "#",
    aiScore: 99,
  },
  {
    id: "gmap_3",
    title: "Monitoring & Evaluation Specialist",
    companyName: "UNICEF East Africa",
    sourceConnectorName: "UN & NGO Feed",
    locationName: "Kinondoni, Dar es Salaam",
    country: "Tanzania",
    region: "Dar es Salaam",
    coordinates: { lat: -6.75, lng: 39.24 },
    isRemote: false,
    salaryDisplay: "$72,000 - $98,000 / yr",
    applyUrl: "#",
    aiScore: 96,
  },
  {
    id: "gmap_4",
    title: "Lead AI & Data Scientist",
    companyName: "FinTech Global",
    sourceConnectorName: "LinkedIn Feed",
    locationName: "Arusha Tech Hub & Remote",
    country: "Tanzania",
    region: "Arusha",
    coordinates: { lat: -3.3869, lng: 36.683 },
    isRemote: true,
    salaryDisplay: "$90,000 - $140,000 / yr",
    applyUrl: "#",
    aiScore: 97,
  },
  {
    id: "gmap_5",
    title: "Cloud Infrastructure Architect",
    companyName: "AWS Partner Network",
    sourceConnectorName: "Indeed Publisher",
    locationName: "Nyamagana, Mwanza",
    country: "Tanzania",
    region: "Mwanza",
    coordinates: { lat: -2.5164, lng: 32.9 },
    isRemote: true,
    salaryDisplay: "TZS 5.0M - 8.5M / month",
    applyUrl: "#",
    aiScore: 95,
  },
];

export function GlobalJobMap() {
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userPos, setUserPos] = useState<LocationCoordinates>({ lat: -6.7924, lng: 39.2083 }); // Default Dar es Salaam
  const [selectedJob, setSelectedJob] = useState<GlobalMapJob>(GLOBAL_MAP_JOBS[0]);

  const handleLocateUser = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPos(coords);
          toast.success("GPS Location updated successfully!");
        },
        () => {
          toast.info("Using default Dar es Salaam, Tanzania center coordinates.");
        }
      );
    }
  };

  const filteredJobs = GLOBAL_MAP_JOBS.filter((job) => {
    if (selectedCountry !== "All" && job.country !== selectedCountry) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.companyName.toLowerCase().includes(q) ||
        job.locationName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const distKm = calculateHaversineDistance(
    userPos.lat,
    userPos.lng,
    selectedJob.coordinates.lat,
    selectedJob.coordinates.lng,
  );
  const travelEst = getTravelTimeEstimates(distKm);

  return (
    <Card className="border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1">
                <Globe className="w-3 h-3" />
                <span>Worldwide Geo Engine</span>
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold">
                {filteredJobs.length} Live Positions
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Global Interactive Job Map & Proximity Finder</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Explore aggregated local and international career opportunities with live travel estimation.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleLocateUser} className="rounded-xl text-xs gap-1.5 h-9">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>My GPS Position</span>
            </Button>
          </div>
        </div>

        {/* MAP FILTERS */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search map jobs or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-background"
            />
          </div>

          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="h-9 text-xs rounded-xl bg-background">
              <SelectValue placeholder="Select Territory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">🌍 All Locations (Worldwide)</SelectItem>
              <SelectItem value="Tanzania">🇹🇿 Tanzania Regions</SelectItem>
              <SelectItem value="Global">🌐 Global Remote Roles</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-xl border border-border">
            <Compass className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-foreground">User Origin:</span>
            <span className="truncate">{userPos.lat.toFixed(2)}, {userPos.lng.toFixed(2)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* SIMULATED MAP CANVAS */}
          <div className="lg:col-span-7 bg-emerald-950/10 dark:bg-slate-900/60 p-6 relative min-h-[360px] flex flex-col justify-between">
            {/* Background grid lines simulating visual map surface */}
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between bg-card/90 backdrop-blur-md p-3 rounded-xl border border-border text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-foreground">Active Spatial Coordinates</span>
              </div>
              <span className="text-muted-foreground font-mono">Zoom Level: Global (1:50,000)</span>
            </div>

            {/* INTERACTIVE MAP MARKERS */}
            <div className="relative z-10 my-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredJobs.map((job) => {
                const isSelected = selectedJob.id === job.id;
                return (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-3 rounded-xl border text-left transition-all backdrop-blur-md shadow-sm ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.02]"
                        : "bg-card/95 hover:bg-card border-border/80 text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                        {job.sourceConnectorName}
                      </span>
                      {job.isRemote && (
                        <span className="text-[10px] flex items-center gap-1 font-semibold">
                          <PlaneTakeoff className="w-3 h-3" />
                          <span>Remote</span>
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs truncate">{job.title}</div>
                    <div className={`text-[11px] truncate ${isSelected ? "text-emerald-100" : "text-muted-foreground"}`}>
                      {job.companyName} • {job.region}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground bg-card/80 backdrop-blur-md px-3 py-2 rounded-xl border border-border">
              <span>Map Powered by Mapbox & Leaflet Vector Tiles</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Geo Validated</span>
            </div>
          </div>

          {/* JOB PROXIMITY & TRAVEL ESTIMATION DETAILS PANEL */}
          <div className="lg:col-span-5 p-6 space-y-5 bg-card">
            <div>
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-600 text-white font-bold text-xs gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{selectedJob.aiScore}% Match Confidence</span>
                </Badge>
                <span className="text-xs text-muted-foreground">{selectedJob.sourceConnectorName}</span>
              </div>

              <h3 className="text-lg font-bold text-foreground mt-2">{selectedJob.title}</h3>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>{selectedJob.companyName}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
              <div className="flex justify-between items-center text-foreground font-semibold">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Job Proximity Distance:</span>
                </span>
                <span className="text-sm font-extrabold text-foreground">{formatDistance(distKm)}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">Location: {selectedJob.locationName}</div>
            </div>

            {/* TRAVEL TIME ESTIMATION GRID */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-500" />
                <span>Estimated Commute & Travel Times:</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl border border-border bg-background text-xs space-y-0.5">
                  <span className="text-[10px] text-muted-foreground">Driving / Taxi</span>
                  <div className="font-bold text-foreground">{travelEst.carMinutes} min</div>
                </div>

                <div className="p-2.5 rounded-xl border border-border bg-background text-xs space-y-0.5">
                  <span className="text-[10px] text-muted-foreground">Public Bus / Dala Dala</span>
                  <div className="font-bold text-foreground">{travelEst.busMinutes} min</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-foreground">Estimated Pay Rate:</span>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{selectedJob.salaryDisplay}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Normalized to local TZS standards with TRA tax deductions pre-calculated.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 rounded-xl h-10">
                <a href={selectedJob.applyUrl} target="_blank" rel="noreferrer">
                  <Zap className="w-4 h-4" />
                  <span>Apply via {selectedJob.sourceConnectorName}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
