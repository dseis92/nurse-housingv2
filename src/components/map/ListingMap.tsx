import { useMemo, useState } from "react";
import Map, { Marker, NavigationControl, ViewStateChangeEvent } from "react-map-gl/mapbox";
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
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

export default function ListingMap({ listings }: ListingMapProps) {
  const validListings = useMemo(
    () =>
      listings.filter(
        (listing) => typeof listing.lat === "number" && typeof listing.lng === "number"
      ) as Array<Required<ListingMapProps["listings"][number]>>,
    [listings]
  );

  const [viewState, setViewState] = useState(() => ({
    longitude: validListings[0]?.lng ?? -122.431297,
    latitude: validListings[0]?.lat ?? 37.773972,
    zoom: 11,
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

  const handleMove = (event: ViewStateChangeEvent) => setViewState(event.viewState);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <Map
        {...viewState}
        onMove={handleMove}
        style={{ width: "100%", height: 420 }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" />
        <GeocoderControl
          accessToken={MAPBOX_TOKEN}
          onResult={(result) => {
            if (result.center) {
              setViewState((prev) => ({
                ...prev,
                longitude: result.center[0],
                latitude: result.center[1],
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
            <div className="flex flex-col items-center gap-1">
              <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow">
                ${listing.nightlyPrice ?? ""}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-sky-900/30">
                <Building2 className="h-4 w-4" />
              </span>
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
