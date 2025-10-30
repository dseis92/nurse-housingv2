import SearchMap, { ListingPin } from "@/components/map/SearchMap";
import { useAppStore } from "@/stores/useAppStore";

export default function MapPage() {
  // Pull your listings; adjust selector if needed to your store shape
  const listings = useAppStore((state) => state.listings ?? []);
  const pins: ListingPin[] =
    (listings || []).map((l: any) => ({
      id: String(l.id ?? l.listing_id ?? crypto.randomUUID()),
      lat: Number(l.lat ?? l.latitude ?? l.coords?.lat ?? 0),
      lng: Number(l.lng ?? l.longitude ?? l.coords?.lng ?? 0),
      title: l.title ?? l.name ?? null
    })) || [];

  return (
    <div className="min-h-screen w-full bg-neutral-50">
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-semibold">Map Search</h1>
          <p className="text-sm text-neutral-600">Search destinations and explore available listings on the map.</p>
        </div>
        <SearchMap listings={pins} />
      </div>
    </div>
  );
}
