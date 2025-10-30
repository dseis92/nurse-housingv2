import ListingTable from "../components/panels/ListingTable";
import { useAppStore } from "../stores/useAppStore";

export default function AdminListingsPage() {
  const listings = useAppStore((state) => state.listings);

  return (
    <div className="space-y-8">
      <header className="rounded-[36px] border border-[var(--nh-border)] bg-white/95 p-8 shadow-[var(--nh-shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">Inventory</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--nh-text-primary)]">Metro listings</h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--nh-text-secondary)]">
          View verified housing inventory and manually flag properties for review when needed.
        </p>
      </header>

      <ListingTable listings={listings} />
    </div>
  );
}
