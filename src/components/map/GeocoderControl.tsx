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

export default function GeocoderControl({ accessToken, onResult, onClear, placeholder = "Search destinations..." }: GeocoderControlProps) {
  useControl(
    () => {
      const geocoder = new MapboxGeocoder({
        accessToken,
        marker: false,
        placeholder,
        mapboxgl,
      });

      geocoder.on("result", (event) => onResult?.(event.result as { center?: [number, number] }));
      geocoder.on("clear", () => onClear?.());

      return geocoder;
    },
    ({ map }) => {
      map.on("load", () => map.resize());
    }
  );

  return null;
}
