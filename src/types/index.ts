export type FeeBreakdown = {
  rentWeekly: number; utilitiesWeekly: number; cleaningWeekly: number; parkingWeekly: number; petWeekly: number
}
export type Listing = {
  id: string; title: string; intro: string; photos: string[];
  coords: { lat: number; lon: number }; hospitalDistanceMin: number;
  weeklyAllIn: number; fees: FeeBreakdown;
  features: {
    quiet: boolean; safe: boolean;
    pet: { allowed: boolean; maxSize?: 'small'|'medium'|'large'; breedRestrictions?: boolean };
    parking: { available: boolean; largeVehicle?: boolean; ev?: boolean };
    instantBook: boolean; daySleeperFriendly: boolean
  };
  availability: { start: string; end: string }
}
export type Filters = {
  dates: { start?: string; end?: string };
  hospital?: string; pet?: boolean; parking?: boolean; ev?: boolean; largeVehicle?: boolean; quiet?: boolean; safe?: boolean
}
export type UserProfile = { name: string; assignmentHospital?: string; verified: boolean }
