import type { Listing } from '../../types'

export const LISTINGS: Listing[] = [
  {
    id: 'l1',
    title: 'Quiet 1BR Loft Seeking Day-Sleeper',
    intro: '5-min drive to Aspirus. Blackout curtains. Loves pets and long naps.',
    photos: [
      'https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1200&auto=format&fit=crop'
    ],
    coords: { lat: 44.966, lon: -89.642 },
    hospitalDistanceMin: 6,
    weeklyAllIn: 420,
    fees: { rentWeekly: 360, utilitiesWeekly: 25, cleaningWeekly: 10, parkingWeekly: 15, petWeekly: 10 },
    features: {
      quiet: true, safe: true,
      pet: { allowed: true, maxSize: 'large', breedRestrictions: false },
      parking: { available: true, largeVehicle: true, ev: false },
      instantBook: true, daySleeperFriendly: true
    },
    availability: { start: '2025-10-01', end: '2026-03-01' }
  },
  {
    id: 'l2',
    title: 'Sunny Studio Ready to Commit',
    intro: '7-min to Mercy. EV charger. Prefers tidy night-shifters.',
    photos: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=1200&auto=format&fit=crop'
    ],
    coords: { lat: 44.957, lon: -89.633 },
    hospitalDistanceMin: 8,
    weeklyAllIn: 465,
    fees: { rentWeekly: 395, utilitiesWeekly: 30, cleaningWeekly: 10, parkingWeekly: 20, petWeekly: 10 },
    features: {
      quiet: true, safe: true,
      pet: { allowed: true, maxSize: 'medium', breedRestrictions: true },
      parking: { available: true, largeVehicle: false, ev: true },
      instantBook: false, daySleeperFriendly: true
    },
    availability: { start: '2025-11-01', end: '2026-02-28' }
  }
]
