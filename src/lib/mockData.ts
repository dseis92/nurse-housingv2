import { v4 as uuid } from "uuid";
import type {
  AvailabilityBlock,
  Conversation,
  Contract,
  Hold,
  Listing,
  ListingMedia,
  Match,
  Message,
  NursePreferences,
  NurseProfile,
  OwnerProfile,
  SafetyBadge,
  User,
  Verification,
} from "../types";

const now = new Date();

const createDate = (offsetDays: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};

const nursePreferences: NursePreferences = {
  maxBudgetMonthly: 2800,
  minSafetyScore: 80,
  commute: {
    maxMinutes: 25,
    avoidBridges: true,
    avoidTolls: true,
    overnightParkingNeeded: true,
  },
  living: {
    pets: true,
    petType: "dog",
    privateEntrance: true,
    femaleOnlyPreferred: false,
    roommatesAllowed: false,
  },
  amenities: ["Washer/Dryer", "Desk", "Fast Wi-Fi", "Gym", "Secure Entry"],
};

export const mockUsers: User[] = [
  {
    id: "user_nurse_1",
    role: "nurse",
    fullName: "Jordan Carter, RN",
    email: "jordan@nursehome.io",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    phone: "+1-415-555-0101",
    createdAt: createDate(-40),
  },
  {
    id: "user_owner_1",
    role: "owner",
    fullName: "Avery Properties",
    email: "hello@averyhomes.com",
    avatarUrl: "https://i.pravatar.cc/150?img=14",
    phone: "+1-415-555-0199",
    createdAt: createDate(-200),
  },
  {
    id: "user_admin_1",
    role: "admin",
    fullName: "Ops Team",
    email: "ops@nursehome.io",
    createdAt: createDate(-365),
  },
];

export const mockNurseProfiles: NurseProfile[] = [
  {
    id: "nurse_profile_1",
    userId: "user_nurse_1",
    discipline: "RN",
    specialty: "Telemetry",
    preferredShift: "night",
    homeState: "AZ",
    bio: "Travel RN focused on cardiac telemetry. Loves coffee, sunrise hikes, and a quiet place to study.",
    verified: true,
    verificationLevel: 3,
    preferences: nursePreferences,
  },
];

export const mockContracts: Contract[] = [
  {
    id: "contract_1",
    nurseProfileId: "nurse_profile_1",
    hospital: "UCSF Medical Center",
    hospitalLat: 37.7631,
    hospitalLng: -122.458,
    unit: "Cardiac Telemetry",
    shiftType: "night",
    startDate: createDate(14),
    endDate: createDate(98),
    weeklyStipend: 1650,
    totalBudget: 2800,
    pets: true,
    parkingNeeded: true,
    notes: "Needs secure entry and space for a 35lb dog.",
    status: "active",
  },
];

export const mockOwnerProfiles: OwnerProfile[] = [
  {
    id: "owner_profile_1",
    userId: "user_owner_1",
    companyName: "Avery Properties",
    bio: "Boutique operator offering nurse-focused rentals with security upgrades and flexible terms.",
    verified: true,
    responseTimeHours: 3,
    rating: 4.9,
  },
];

const gallery = (listingId: string): ListingMedia[] => [
  {
    id: uuid(),
    listingId,
    type: "image",
    url: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1200",
  },
  {
    id: uuid(),
    listingId,
    type: "image",
    url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200",
  },
  {
    id: uuid(),
    listingId,
    type: "image",
    url: "https://images.unsplash.com/photo-1530041539828-114de6693900?q=80&w=1200",
  },
];

export const mockListings: Listing[] = [
  {
    id: "listing_1",
    ownerId: "owner_profile_1",
    title: "Secure Mission Bay Loft w/ Private Entry",
    description:
      "Two-story loft with private keyed entry, secure parking, and night-shift friendly blackout shades. Dedicated workspace and 1Gbps Wi-Fi.",
    weeklyPrice: 1150,
    address: "134 Berry St",
    city: "San Francisco",
    state: "CA",
    zip: "94158",
    lat: 37.773972,
    lng: -122.431297,
    commuteMinutesPeak: 18,
    commuteMinutesNight: 12,
    commuteNotes: "No bridge crossings. Surface streets only.",
    stipendFitScore: 88,
    safetyScore: 92,
    qualityScore: 89,
    totalScore: 90,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 690,
    petPolicy: "allowed",
    parking: "garage",
    videoUrl: "https://cdn.coverr.co/videos/coverr-loft-apartment-6935/1080p.mp4",
    heroImage: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600",
    gallery: gallery("listing_1"),
    amenities: ["Private Entry", "Desk", "Fast Wi-Fi", "King Bed", "In-Unit Laundry"],
    safetyFeatures: ["Smart Lock", "Security Cameras", "Smoke/CO Detectors", "Gated Parking"],
    neighborhood: "Mission Bay",
    status: "active",
    availableFrom: createDate(7),
    availableTo: createDate(180),
    minStayWeeks: 12,
    maxStayWeeks: 24,
    createdAt: createDate(-30),
    updatedAt: createDate(-2),
  },
  {
    id: "listing_2",
    ownerId: "owner_profile_1",
    title: "Quiet Sunset Flat Near Ocean Beach",
    description:
      "Top-floor flat overlooking a courtyard with secure entrance and abundant natural light. Ideal for day sleeping with blackout curtains.",
    weeklyPrice: 980,
    address: "415 41st Ave",
    city: "San Francisco",
    state: "CA",
    zip: "94121",
    lat: 37.7763,
    lng: -122.4929,
    commuteMinutesPeak: 25,
    commuteMinutesNight: 17,
    commuteNotes: "Ocean Beach route. Minimal traffic overnight.",
    stipendFitScore: 83,
    safetyScore: 95,
    qualityScore: 84,
    totalScore: 88,
    bedrooms: 2,
    bathrooms: 1,
    petPolicy: "cats",
    parking: "driveway",
    heroImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1600",
    gallery: gallery("listing_2"),
    amenities: ["Washer/Dryer", "Dishwasher", "Garden Access", "Storage Locker"],
    safetyFeatures: ["Ring Doorbell", "Motion Lights", "Secure Entry"],
    status: "active",
    availableFrom: createDate(21),
    minStayWeeks: 8,
    createdAt: createDate(-60),
    updatedAt: createDate(-5),
  },
  {
    id: "listing_3",
    ownerId: "owner_profile_1",
    title: "SoMa Studio with 24/7 Concierge",
    description:
      "Hotel-style studio with concierge, package room, and fitness center. Designed for solo travelers needing quick downtown access.",
    weeklyPrice: 1250,
    address: "821 Howard St",
    city: "San Francisco",
    state: "CA",
    zip: "94103",
    lat: 37.7815,
    lng: -122.4041,
    commuteMinutesPeak: 22,
    commuteMinutesNight: 14,
    stipendFitScore: 80,
    safetyScore: 88,
    qualityScore: 93,
    totalScore: 87,
    bedrooms: 0,
    bathrooms: 1,
    petPolicy: "none",
    parking: "garage",
    videoUrl: "https://cdn.coverr.co/videos/coverr-modern-city-apartment-1467618335135?download=1",
    heroImage: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=1600",
    gallery: gallery("listing_3"),
    amenities: ["Concierge", "Gym", "Co-working Lounge", "EV Charging"],
    safetyFeatures: ["Doorman", "Keycard Access", "Fire Sprinklers"],
    status: "active",
    availableFrom: createDate(14),
    minStayWeeks: 13,
    createdAt: createDate(-42),
    updatedAt: createDate(-1),
  },
  {
    id: "listing_4",
    ownerId: "owner_profile_1",
    title: "North Beach Victorian w/ Nurse Co-op",
    description:
      "Shared Victorian with two other vetted nurses. Private keyed room, shared kitchen, and secure storage for night shift gear.",
    weeklyPrice: 840,
    address: "1624 Stockton St",
    city: "San Francisco",
    state: "CA",
    zip: "94133",
    lat: 37.8001,
    lng: -122.4106,
    commuteMinutesPeak: 16,
    commuteMinutesNight: 10,
    stipendFitScore: 91,
    safetyScore: 87,
    qualityScore: 82,
    totalScore: 86,
    bedrooms: 1,
    bathrooms: 1,
    petPolicy: "dogs",
    parking: "street",
    heroImage: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1600",
    gallery: gallery("listing_4"),
    amenities: ["Nurse Roommates", "Private Lock", "Shared Garden", "Nightshift Quiet Hours"],
    safetyFeatures: ["Interior Deadbolt", "Smart Lock", "Security Cameras"],
    status: "active",
    availableFrom: createDate(3),
    minStayWeeks: 10,
    createdAt: createDate(-15),
    updatedAt: createDate(-1),
  },
];

export const mockAvailability: AvailabilityBlock[] = mockListings.flatMap((listing) => [
  {
    id: uuid(),
    listingId: listing.id,
    startDate: listing.availableFrom,
    endDate: listing.availableTo ?? createDate(210),
    status: "available",
  },
]);

const baseMessage = (conversationId: string, senderId: string, body: string, offset: number): Message => ({
  id: uuid(),
  conversationId,
  senderId,
  body,
  createdAt: createDate(offset),
});

export const mockMatches: Match[] = [
  {
    id: "match_1",
    listingId: "listing_1",
    nurseProfileId: "nurse_profile_1",
    contractId: "contract_1",
    status: "active",
    createdAt: createDate(-7),
    updatedAt: createDate(-2),
    holdId: "hold_1",
  },
];

export const mockHolds: Hold[] = [
  {
    id: "hold_1",
    listingId: "listing_1",
    nurseProfileId: "nurse_profile_1",
    contractId: "contract_1",
    expiresAt: createDate(1),
    status: "active",
    intentFee: 100,
  },
];

export const mockConversations: Conversation[] = [
  {
    id: "conversation_1",
    matchId: "match_1",
    listingId: "listing_1",
    nurseProfileId: "nurse_profile_1",
    ownerId: "owner_profile_1",
    createdAt: createDate(-7),
    status: "open",
    messages: [
      baseMessage("conversation_1", "user_nurse_1", "Hi Avery team! Would love to confirm the parking details.", -7),
      baseMessage("conversation_1", "user_owner_1", "Hi Jordan! Garage parking is included with a clicker.", -7),
      baseMessage("conversation_1", "user_nurse_1", "Perfect. Does the unit have blackout curtains?", -6),
    ],
  },
];

export const mockVerifications: Verification[] = [
  {
    id: uuid(),
    userId: "user_nurse_1",
    type: "employer",
    status: "verified",
    issuedAt: createDate(-35),
  },
  {
    id: uuid(),
    userId: "user_owner_1",
    type: "address",
    status: "verified",
    issuedAt: createDate(-180),
  },
];

export const safetyBadges: SafetyBadge[] = [
  {
    id: "badge_smart_lock",
    label: "Smart Lock",
    description: "Keyless entry with activity logs.",
    icon: "lock",
  },
  {
    id: "badge_camera",
    label: "Exterior Camera",
    description: "Camera coverage on all approaches.",
    icon: "camera",
  },
  {
    id: "badge_detector",
    label: "Smoke + CO",
    description: "Combined smoke and CO detection, inspected monthly.",
    icon: "alert-triangle",
  },
  {
    id: "badge_parking",
    label: "Secured Parking",
    description: "Assigned parking with controlled access.",
    icon: "shield",
  },
];

