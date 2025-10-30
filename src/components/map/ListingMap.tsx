import { useEffect, useMemo, useState } from "react";
import Map, { Marker, NavigationControl, type ViewState, type ViewStateChangeEvent } from "react-map-gl/mapbox";
import GeocoderControl from "./GeocoderControl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Building2 } from "lucide-react";

interface ListingMapProps {
  listings: Array<{
    id: string;
    title: string;
    lat?: number | null;
    lng?: number | null;
    nightlyPrice?: number;
  }>;
  height?: number | string;
  activeListingId?: string | null;
  onSelect?: (listingId: string) => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

type MapViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
};

type NormalizedListing = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  nightlyPrice?: number;
};

export default function ListingMap({ listings, height, activeListingId, onSelect }: ListingMapProps) {
  const validListings = useMemo<NormalizedListing[]>(() => {
    return listings.reduce<NormalizedListing[]>((accumulator, listing) => {
      if (typeof listing.lat !== "number" || typeof listing.lng !== "number") return accumulator;
      accumulator.push({
        id: listing.id,
        title: listing.title,
        lat: listing.lat,
        lng: listing.lng,
        nightlyPrice: listing.nightlyPrice,
      });
      return accumulator;
    }, []);
  }, [listings]);

  const [viewState, setViewState] = useState<MapViewState>(() => ({
    longitude: validListings[0]?.lng ?? -122.431297,
    latitude: validListings[0]?.lat ?? 37.773972,
    zoom: 11,
    bearing: 0,
    pitch: 0,
  }));

  const bounds = useMemo(() => {
    if (!validListings.length) return null;
    const lats = validListings.map((item) => item.lat);
    const lngs = validListings.map((item) => item.lng);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [validListings]);

  useEffect(() => {
    if (!activeListingId) return;
    const target = validListings.find((listing) => listing.id === activeListingId);
    if (!target) return;
    setViewState((prev) => ({
      ...prev,
      longitude: target.lng,
      latitude: target.lat,
      zoom: Math.max(prev.zoom, 12),
    }));
  }, [activeListingId, validListings]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        Map preview requires <code>VITE_MAPBOX_TOKEN</code> in your environment.
      </div>
    );
  }

  if (validListings.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-sm text-slate-500">
        Listings do not include coordinates yet. Add <code>lat</code> and <code>lng</code> values in Supabase to see them on
        the map.
      </div>
    );
  }

  const handleMove = (event: ViewStateChangeEvent) => {
    const next = event.viewState as ViewState;
    setViewState({
      longitude: next.longitude,
      latitude: next.latitude,
      zoom: next.zoom,
      bearing: next.bearing,
      pitch: next.pitch,
    });
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <Map
        {...viewState}
        onMove={handleMove}
        style={{ width: "100%", height: typeof height === "number" ? `${height}px` : height ?? "420px" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" />
        <GeocoderControl
          accessToken={MAPBOX_TOKEN}
          onResult={(result) => {
            if (result.center) {
              const [lng, lat] = result.center;
              setViewState((prev) => ({
                ...prev,
                longitude: lng,
                latitude: lat,
                zoom: 12,
              }));
            }
          }}
          onClear={() => {
            if (bounds) {
              setViewState((prev) => ({
                ...prev,
                longitude: (bounds.minLng + bounds.maxLng) / 2,
                latitude: (bounds.minLat + bounds.maxLat) / 2,
              }));
            }
          }}
        />
        {validListings.map((listing) => (
          <Marker
            key={listing.id}
            longitude={listing.lng}
            latitude={listing.lat}
            anchor="bottom"
          >
            <button
              type="button"
              onClick={() => onSelect?.(listing.id)}
              className="flex flex-col items-center gap-1 focus:outline-none"
            >
              <span
                className={[
                  "rounded-full px-2 py-1 text-xs font-semibold shadow transition",
                  listing.id === activeListingId
                    ? "bg-[var(--nh-accent)] text-white shadow-[0_10px_20px_rgba(255,56,92,0.25)]"
                    : "bg-white text-slate-700",
                ].join(" ")}
              >
                ${listing.nightlyPrice ?? ""}
              </span>
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg transition",
                  listing.id === activeListingId
                    ? "scale-110 bg-[var(--nh-accent)] shadow-[0_12px_24px_rgba(255,56,92,0.35)]"
                    : "bg-sky-600 shadow-sky-900/30",
                ].join(" ")}
              >
                <Building2 className="h-4 w-4" />
              </span>
            </button>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
