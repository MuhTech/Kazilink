import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Navigation,
  Car,
  Bike,
  Bus,
  Footprints,
  Compass,
  Layers,
  Globe,
} from "lucide-react";
import { calculateHaversineDistance, getTravelTimeEstimates } from "@/lib/geo/distance-utils";
import { toast } from "sonner";

export interface MapLocationProps {
  locationName: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  title?: string;
  companyName?: string;
  showRoutePreview?: boolean;
  onRadiusChange?: (radiusKm: number) => void;
}

// Tanzanian Region Coordinates Map
export const TANZANIA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Dar es Salaam": { lat: -6.7924, lng: 39.2083 },
  Mwanza: { lat: -2.5164, lng: 32.9033 },
  Arusha: { lat: -3.3869, lng: 36.683 },
  Dodoma: { lat: -6.163, lng: 35.7516 },
  Kilimanjaro: { lat: -3.3333, lng: 37.3333 },
  Moshi: { lat: -3.3349, lng: 37.3404 },
  Tanga: { lat: -5.0689, lng: 39.0988 },
  Zanzibar: { lat: -6.1659, lng: 39.2026 },
  Mbeya: { lat: -8.9, lng: 33.45 },
  Morogoro: { lat: -6.8278, lng: 37.6591 },
  Tabora: { lat: -5.0167, lng: 32.8 },
  Kagera: { lat: -1.3333, lng: 31.8167 },
  Kigoma: { lat: -4.8769, lng: 29.6267 },
  Iringa: { lat: -7.77, lng: 35.69 },
  Ruvuma: { lat: -10.6833, lng: 35.65 },
  Lindi: { lat: -9.9971, lng: 39.7129 },
  Mtwara: { lat: -10.2736, lng: 40.1828 },
  Shinyanga: { lat: -3.6639, lng: 33.4211 },
  Mara: { lat: -1.75, lng: 34.0 },
  Singida: { lat: -4.8167, lng: 34.75 },
  Rukwa: { lat: -8.0, lng: 31.5 },
  Manyara: { lat: -4.3167, lng: 35.8167 },
  Geita: { lat: -2.8667, lng: 32.2333 },
  Katavi: { lat: -6.3667, lng: 31.1333 },
  Njombe: { lat: -9.3333, lng: 34.7667 },
  Songwe: { lat: -9.0, lng: 32.8 },
};

export function JobLocationMap({
  locationName,
  region = "Dar es Salaam",
  latitude,
  longitude,
  title = "Job Opportunity Location",
  companyName = "Employer",
  showRoutePreview = true,
  onRadiusChange,
}: MapLocationProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);

  // Determine target coordinates based on props or regional lookup
  const targetCoords =
    latitude && longitude
      ? { lat: latitude, lng: longitude }
      : TANZANIA_COORDINATES[region] ||
        TANZANIA_COORDINATES[locationName] ||
        TANZANIA_COORDINATES["Dar es Salaam"];

  // Detect user GPS
  const detectUserGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);

        // Calculate straight-line distance in km (Haversine formula)
        const dist = calculateHaversineDistance(
          coords.lat,
          coords.lng,
          targetCoords.lat,
          targetCoords.lng,
        );
        setDistanceKm(Math.round(dist * 10) / 10);
        setDetectingGps(false);
        toast.success(`Location detected! Distance to job: ${Math.round(dist * 10) / 10} km`);
      },
      (err) => {
        setDetectingGps(false);
        toast.error("Location permission denied. Showing default region coordinates.");
      },
      { timeout: 10000 },
    );
  };

  const travelEstimates = distanceKm ? getTravelTimeEstimates(distanceKm) : null;
  const travelTimes = travelEstimates
    ? {
        carMins: travelEstimates.carMinutes,
        bodaMins: travelEstimates.bodaMinutes,
        busMins: travelEstimates.busMinutes,
        walkMins: travelEstimates.walkMinutes,
      }
    : null;

  return (
    <Card className="border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span>Job Location & Route Map</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {locationName}, {region} • Interactive GIS Location Map
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={detectUserGPS}
            disabled={detectingGps}
            className="text-xs gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/5"
          >
            <Compass className={`w-3.5 h-3.5 ${detectingGps ? "animate-spin" : ""}`} />
            <span>{detectingGps ? "Detecting GPS..." : "Detect My Distance"}</span>
          </Button>

          <Select value={mapType} onValueChange={(v) => setMapType(v as "standard" | "satellite")}>
            <SelectTrigger className="w-28 h-8 text-xs rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Map View</SelectItem>
              <SelectItem value="satellite">Satellite View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        {/* INTERACTIVE VISUAL EMBED MAP CANVAS */}
        <div className="relative w-full h-72 bg-slate-900 overflow-hidden flex items-center justify-center">
          {/* Tile Background Simulation */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              mapType === "satellite"
                ? "bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950"
                : "bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] bg-slate-900"
            }`}
          />

          {/* OpenStreetMap Iframe for Real Map Tiles */}
          <iframe
            title="Location Map"
            width="100%"
            height="100%"
            className="border-0 relative z-10 opacity-90"
            loading="lazy"
            allowFullScreen
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${targetCoords.lng - 0.08}%2C${targetCoords.lat - 0.08}%2C${targetCoords.lng + 0.08}%2C${targetCoords.lat + 0.08}&layer=mapnik&marker=${targetCoords.lat}%2C${targetCoords.lng}`}
          />

          {/* Overlaid Location Badge */}
          <div className="absolute top-3 left-3 z-20 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-md flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-foreground truncate max-w-[200px]">
              {companyName} • {region}
            </span>
          </div>

          {/* Overlaid Radius Selector */}
          <div className="absolute bottom-3 right-3 z-20 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-md flex items-center gap-2 text-xs">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground font-medium">Radius:</span>
            <select
              value={radiusKm}
              onChange={(e) => {
                const r = Number(e.target.value);
                setRadiusKm(r);
                if (onRadiusChange) onRadiusChange(r);
              }}
              className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>
        </div>

        {/* COMMUTE & TRAVEL TIME METRICS BAR */}
        {distanceKm !== null && travelTimes && (
          <div className="p-4 bg-muted/30 border-t border-border/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Navigation className="w-4 h-4" /> Distance from your location: {distanceKm} km
              </span>
              <Badge
                variant="outline"
                className="text-[10px] border-emerald-500/30 text-emerald-600"
              >
                Commute Suitable
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-card border border-border/60 flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground">Car / Taxi</div>
                  <div className="font-bold text-foreground">~{travelTimes.carMins} mins</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-card border border-border/60 flex items-center gap-2">
                <Bike className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground">Boda Boda</div>
                  <div className="font-bold text-foreground">~{travelTimes.bodaMins} mins</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-card border border-border/60 flex items-center gap-2">
                <Bus className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground">Daladala Bus</div>
                  <div className="font-bold text-foreground">~{travelTimes.busMins} mins</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-card border border-border/60 flex items-center gap-2">
                <Footprints className="w-4 h-4 text-purple-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground">Walking</div>
                  <div className="font-bold text-foreground">~{travelTimes.walkMins} mins</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
