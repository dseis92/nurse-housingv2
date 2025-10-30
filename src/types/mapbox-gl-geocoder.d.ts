declare module "@mapbox/mapbox-gl-geocoder" {
  import type { IControl, Map } from "mapbox-gl";

  interface MapboxGeocoderOptions {
    accessToken: string;
    placeholder?: string;
    marker?: boolean;
    mapboxgl?: typeof import("mapbox-gl");
  }

  type Result = {
    center?: [number, number];
    place_name?: string;
    [key: string]: unknown;
  };

  export default class MapboxGeocoder implements IControl {
    constructor(options: MapboxGeocoderOptions);
    on(type: "result", listener: (event: { result?: Result }) => void): this;
    on(type: "clear", listener: () => void): this;
    on(type: string, listener: (...args: any[]) => void): this;
    off(type: string, listener: (...args: any[]) => void): this;
    addTo(map: Map): this;
    getElement(): HTMLElement;
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
    setProximity(proximity: { longitude: number; latitude: number }): void;
    setTypes(types: string[]): void;
  }
}
