import type { Filters, Listing } from '../types'
export function computeMatch(listing: Listing, f: Filters): number {
  let s = 50
  if (f.pet != null) s += f.pet && listing.features.pet.allowed ? 10 : (f.pet ? -15 : 0)
  if (f.parking != null) s += f.parking && listing.features.parking.available ? 6 : (f.parking ? -8 : 0)
  if (f.ev != null) s += f.ev && listing.features.parking.ev ? 6 : (f.ev ? -6 : 0)
  if (f.largeVehicle != null) s += f.largeVehicle && listing.features.parking.largeVehicle ? 6 : (f.largeVehicle ? -6 : 0)
  if (f.quiet != null) s += f.quiet && listing.features.quiet ? 8 : (f.quiet ? -10 : 0)
  if (f.safe != null) s += f.safe && listing.features.safe ? 8 : (f.safe ? -10 : 0)
  if (f.dates?.start && f.dates?.end) {
    const ok = new Date(listing.availability.start) <= new Date(f.dates.start) &&
               new Date(listing.availability.end) >= new Date(f.dates.end)
    s += ok ? 12 : -25
  }
  return Math.max(0, Math.min(100, Math.round(s)))
}
