import { useMemo, useState } from "react";
import Map, { Marker, NavigationControl, ViewState } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import GeocoderControl from "./GeocoderControl";

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN || (window as any)?.__PUBLIC_CONFIG__?.VITE_MAPBOX_TOKEN;

export type ListingPin = {
  id: string;
  lat: number;
  lng: number;
  title?: string | null;
};

type Props = {
  listings: ListingPin[];
  initial?: Partial<ViewState>;
  heightClass?: string;
};

export default function SearchMap({ listings, initial, heightClass = "h-[75vh]" }: Props) {
  const [viewState, setViewState] = useState<ViewState>(() => ({
    longitude: initial?.longitude ?? -122.4194,
    latitude: initial?.latitude ?? 37.7749,
    zoom: initial?.zoom ?? 11
  }));

  const pins = useMemo(
    () => listings.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng)),
    [listings]
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className="rounded-xl border bg-amber-50 text-amber-900 p-4">
        <p className="font-medium">Mapbox token missing</p>
        <p className="text-sm">
          Add <code>VITE_MAPBOX_TOKEN</code> to <code>.env.local</code> (and restart dev server).
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${heightClass} rounded-2xl overflow-hidden border bg-white`}>
      <Map
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" />

        <GeocoderControl
          accessToken={MAPBOX_TOKEN}
          onResult={(result) => {
            if (!result?.center) return;
            const [lng, lat] = result.center;
            setViewState((v) => ({ ...v, longitude: lng, latitude: lat, zoom: Math.max(v.zoom, 12) }));
          }}
          onClear={() => setViewState((v) => ({ ...v }))}
        />

        {pins.map((p) => (
          <Marker key={p.id} longitude={p.lng} latitude={p.lat} color="#0ea5e9" />
        ))}
      </Map>
    </div>
  );
}
