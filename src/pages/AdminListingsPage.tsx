import ListingTable from "../components/panels/ListingTable";
import { useAppStore } from "../stores/useAppStore";

export default function AdminListingsPage() {
  const listings = useAppStore((state) => state.listings);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-teal-600">Inventory</p>
        <h1 className="text-2xl font-semibold text-zinc-900">Metro listings</h1>
        <p className="mt-2 text-sm text-zinc-600">
          View verified housing inventory and manually flag properties for review when needed.
        </p>
      </header>

      <ListingTable listings={listings} />
    </div>
  );
}

