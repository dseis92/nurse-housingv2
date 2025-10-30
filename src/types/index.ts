export type UserRole = "nurse" | "owner" | "admin";

export type VerificationType = "employer" | "government_id" | "address" | "background" | "safety_feature";

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
}

export interface NurseProfile {
  id: string;
  userId: string;
  discipline: "RN" | "LPN" | "NP" | "Other";
  specialty: string;
  preferredShift: "day" | "night" | "swing";
  homeState: string;
  bio?: string;
  verified: boolean;
  verificationLevel: number;
  preferences: NursePreferences;
}

export interface NursePreferences {
  maxBudgetMonthly: number;
  minSafetyScore: number;
  commute: {
    maxMinutes: number;
    avoidBridges: boolean;
    avoidTolls: boolean;
    overnightParkingNeeded: boolean;
  };
  living: {
    pets: boolean;
    petType?: "dog" | "cat" | "small";
    privateEntrance: boolean;
    femaleOnlyPreferred: boolean;
    roommatesAllowed: boolean;
  };
  amenities: string[];
}

export interface Contract {
  id: string;
  nurseProfileId: string;
  hospital: string;
  hospitalLat: number;
  hospitalLng: number;
  unit: string;
  shiftType: "day" | "night" | "swing";
  startDate: string;
  endDate: string;
  weeklyStipend: number;
  totalBudget: number;
  pets: boolean;
  parkingNeeded: boolean;
  notes?: string;
  status: "draft" | "active" | "completed";
}

export interface OwnerProfile {
  id: string;
  userId: string;
  companyName?: string;
  bio?: string;
  verified: boolean;
  responseTimeHours: number;
  rating: number;
}

export interface Listing {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  weeklyPrice: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  commuteMinutesPeak: number;
  commuteMinutesNight: number;
  commuteNotes?: string;
  stipendFitScore: number;
  safetyScore: number;
  qualityScore: number;
  totalScore: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  petPolicy: "allowed" | "cats" | "dogs" | "none";
  parking: "street" | "garage" | "driveway" | "none";
  videoUrl?: string;
  heroImage: string;
  gallery: ListingMedia[];
  amenities: string[];
  safetyFeatures: string[];
  neighborhood?: string;
  status: "active" | "draft" | "snoozed";
  availableFrom: string;
  availableTo?: string;
  minStayWeeks: number;
  maxStayWeeks?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListingMedia {
  id: string;
  listingId: string;
  type: "image" | "video";
  url: string;
  poster?: string;
}

export interface AvailabilityBlock {
  id: string;
  listingId: string;
  startDate: string;
  endDate: string;
  status: "available" | "held" | "booked";
}

export interface Like {
  id: string;
  listingId: string;
  nurseProfileId: string;
  contractId: string;
  decision: "like" | "pass";
  createdAt: string;
}

export interface Match {
  id: string;
  listingId: string;
  nurseProfileId: string;
  contractId: string;
  status: "pending" | "active" | "expired";
  createdAt: string;
  updatedAt: string;
  holdId?: string;
}

export interface Hold {
  id: string;
  listingId: string;
  nurseProfileId: string;
  contractId: string;
  expiresAt: string;
  status: "pending" | "active" | "released" | "converted";
  intentFee: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface Conversation {
  id: string;
  matchId: string;
  listingId: string;
  nurseProfileId: string;
  ownerId: string;
  createdAt: string;
  messages: Message[];
  status: "open" | "closed";
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt?: string;
}

export interface Verification {
  id: string;
  userId: string;
  type: VerificationType;
  status: "pending" | "verified" | "rejected";
  issuedAt?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface SafetyBadge {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export type SwipeDecision = "like" | "pass" | "super-like";

export interface Review {
  id: string;
  listingId: string;
  reviewerName: string;
  reviewerRole?: string;
  rating: number;
  body: string;
  createdAt: string;
  stayType?: "assignment" | "contract" | "short-term";
  sentimentTags?: string[];
}
