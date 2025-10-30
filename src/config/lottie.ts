export type LottieKey =
  | "onboardingProgress"
  | "onboardingCompletion"
  | "swipeDeckEmpty"
  | "bookingSuccess"
  | "newMessage"
  | "hostVerification"
  | "mapSearchLoading"
  | "uploadComplete"
  | "errorEmptyState"
  | "levelUpBadge";

type LottieAsset = {
  /**
   * File path relative to the Vite public directory.
   */
  local: string;
  /**
   * Optional CDN URL (e.g., from LottieFiles asset CDN).
   */
  cdn?: string;
  /**
   * Short descriptor to keep README / documentation aligned.
   */
  label: string;
};

const lottieLibrary: Record<LottieKey, LottieAsset> = {
  onboardingProgress: {
    local: "/onboarding-progress.json",
    label: "Onboarding step progress indicator",
  },
  onboardingCompletion: {
    local: "/onboarding-completion.json",
    label: "Onboarding wrap-up confetti",
  },
  swipeDeckEmpty: {
    local: "/swipe-deck-empty.json",
    label: "Swipe deck empty state",
  },
  bookingSuccess: {
    local: "/booking-success.json",
    label: "Booking confirmation success",
  },
  newMessage: {
    local: "/new-message-notification.json",
    label: "New chat message notification",
  },
  hostVerification: {
    local: "/host-verifaction.json",
    label: "Host verification badge",
  },
  mapSearchLoading: {
    local: "/map-load-search-load.json",
    label: "Map search loading pulse",
  },
  uploadComplete: {
    local: "/upload-complete.json",
    label: "Media upload complete",
  },
  errorEmptyState: {
    local: "/error:empty-state.json",
    label: "General error / empty fallback",
  },
  levelUpBadge: {
    local: "/levelup:badge-unlocked.json",
    label: "Gamified XP level-up badge",
  },
};

const rawCdnBase = import.meta.env.VITE_LOTTIE_CDN_BASE as string | undefined;
const cdnBase = rawCdnBase ? rawCdnBase.replace(/\/$/, "") : undefined;

/**
 * Resolve the best source for the requested animation. Prefers a CDN URL
 * when one is provided and `preferCdn` is true; otherwise falls back to the
 * local asset served from the Vite public directory.
 */
export function getLottieSource(key: LottieKey, preferCdn = true): string {
  const asset = lottieLibrary[key];
  if (!asset) {
    throw new Error(`Unknown Lottie animation: ${key as string}`);
  }

  if (preferCdn) {
    if (asset.cdn) {
      return asset.cdn;
    }
    if (cdnBase) {
      return `${cdnBase}${asset.local.startsWith("/") ? asset.local : `/${asset.local}`}`;
    }
  }

  return asset.local;
}

export function listLottieAssets(): Array<{ key: LottieKey; label: string; local: string; cdn?: string }> {
  return (Object.keys(lottieLibrary) as LottieKey[]).map((key) => ({
    key,
    label: lottieLibrary[key].label,
    local: lottieLibrary[key].local,
    cdn: lottieLibrary[key].cdn,
  }));
}

export function setLottieCdnUrl(key: LottieKey, cdnUrl: string) {
  if (!lottieLibrary[key]) {
    throw new Error(`Cannot set CDN URL for unknown animation key: ${key as string}`);
  }
  lottieLibrary[key] = { ...lottieLibrary[key], cdn: cdnUrl };
}
