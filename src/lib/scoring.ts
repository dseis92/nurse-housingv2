import type { Contract, Listing, NursePreferences } from "../types";

interface ScoreBreakdown {
  stipendFit: number;
  commute: number;
  safety: number;
  quality: number;
  total: number;
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const computeStipendFit = (weeklyPrice: number, stipend: number) => {
  if (!stipend) return 50;
  const pct = stipend / weeklyPrice;
  if (pct >= 1.2) return 95;
  if (pct >= 1.0) return 85;
  if (pct >= 0.8) return 70;
  if (pct >= 0.6) return 50;
  return 35;
};

const computeCommuteScore = (minutes: number, preference: NursePreferences["commute"]) => {
  if (minutes <= preference.maxMinutes) return clamp(100 - minutes);
  const overage = minutes - preference.maxMinutes;
  return clamp(70 - overage * 2);
};

const computeSafetyScore = (listing: Listing, preference: NursePreferences) => {
  const base = listing.safetyScore;
  const bonuses = [
    preference.living.privateEntrance && listing.amenities.includes("Private Entry") ? 5 : 0,
    preference.commute.overnightParkingNeeded && listing.safetyFeatures.includes("Gated Parking") ? 4 : 0,
    preference.living.femaleOnlyPreferred && listing.description.toLowerCase().includes("female") ? 5 : 0,
  ].reduce((acc, value) => acc + value, 0);
  return clamp(base + bonuses, 0, 100);
};

export const calculateMatchScore = (
  contract: Contract,
  listing: Listing,
  preferences: NursePreferences
): ScoreBreakdown => {
  const stipendFit = computeStipendFit(listing.weeklyPrice, contract.weeklyStipend);
  const commute = computeCommuteScore(listing.commuteMinutesPeak, preferences.commute);
  const safety = computeSafetyScore(listing, preferences);
  const quality = listing.qualityScore;
  const total = clamp(stipendFit * 0.3 + commute * 0.2 + safety * 0.3 + quality * 0.2);

  return { stipendFit, commute, safety, quality, total };
};
