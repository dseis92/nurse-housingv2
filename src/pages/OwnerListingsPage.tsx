import ListingTable from "../components/panels/ListingTable";
import { useAppStore } from "../stores/useAppStore";

export default function OwnerListingsPage() {
  const listings = useAppStore((state) => state.listings);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-sky-600">Portfolio</p>
        <h1 className="text-2xl font-semibold text-slate-900">Manage listings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Update availability, snooze units, or launch Boost to rise to the top of swipe queues.
        </p>
      </header>
      <ListingTable listings={listings} />
    </div>
  );
}

