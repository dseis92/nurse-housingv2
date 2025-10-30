import { useControl } from "react-map-gl/mapbox";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import mapboxgl from "mapbox-gl";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

interface GeocoderControlProps {
  accessToken: string;
  onResult?: (result: { center?: [number, number] }) => void;
  onClear?: () => void;
  placeholder?: string;
}

type GeocoderResult = { center?: [number, number] };

export default function GeocoderControl({
  accessToken,
  onResult,
  onClear,
  placeholder = "Search destinations...",
}: GeocoderControlProps) {
  useControl<MapboxGeocoder>(
    (_context: unknown) => {
      const geocoder = new MapboxGeocoder({
        accessToken,
        marker: false,
        placeholder,
        mapboxgl: mapboxgl as unknown as typeof import("mapbox-gl"),
      });

      geocoder.on("result", (event: { result?: GeocoderResult }) => onResult?.(event.result ?? {}));
      geocoder.on("clear", () => onClear?.());

      return geocoder;
    },
    ({ map }: { map: any }) => {
      map?.on("load", () => map.resize());
    }
  );

  return null;
}
