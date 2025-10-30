import { Suspense, useEffect, useMemo, useState, lazy } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import clsx from "clsx";
import LottieAnimation from "../components/ui/LottieAnimation";
import ListingExploreCard from "../components/listings/ListingExploreCard";
import AvailabilityCalendar from "../components/listings/AvailabilityCalendar";
import { calculateMatchScore } from "../lib/scoring";
import {
  selectActiveContract,
  selectCurrentNurseProfile,
  selectListingById,
  useAppStore,
} from "../stores/useAppStore";
import type { AvailabilityBlock, Listing as ListingType, OwnerProfile, Review } from "../types";

const ListingMap = lazy(() => import("../components/map/ListingMap"));

type MediaItem = {
  type: "image" | "video";
  url: string;
  poster?: string | null;
};

const STRUCTURED_TAG_LABELS: Record<string, string> = {
  night_shift: "Great for night shift",
  easy_commute: "Easy commute",
  secure_building: "Secure building",
  pet_friendly: "Pet friendly",
  sparkling_clean: "Sparkling clean",
  responsive_host: "Responsive host",
  quiet_rest: "Quiet for rest",
  parking_included: "Parking included",
  strong_wifi: "Reliable Wi-Fi",
  contract_friendly: "Contract-friendly",
};

const SENTIMENT_RULES: { label: string; patterns: RegExp[] }[] = [
  { label: "Great for night shift", patterns: [/night shift/i, /overnight/i, /quiet during the day/i, /blackout/i] },
  { label: "Easy commute", patterns: [/commute/i, /minutes to (the )?hospital/i, /short drive/i, /walk/i] },
  { label: "Secure building", patterns: [/secure/i, /safe/i, /security/i, /lock/i, /gated/i] },
  { label: "Sparkling clean", patterns: [/clean/i, /spotless/i, /immaculate/i] },
  { label: "Responsive host", patterns: [/responsive/i, /communication/i, /quick reply/i, /fast/i] },
  { label: "Quiet for rest", patterns: [/quiet/i, /peaceful/i, /calm/i, /rest/i] },
  { label: "Parking included", patterns: [/parking/i, /garage/i, /driveway/i] },
  { label: "Pet friendly", patterns: [/pet/i, /dog/i, /cat/i] },
  { label: "Reliable Wi-Fi", patterns: [/wifi/i, /internet/i, /fiber/i, /fast wifi/i] },
];

const SENTIMENT_FORM_OPTIONS = [
  "night_shift",
  "easy_commute",
  "secure_building",
  "sparkling_clean",
  "responsive_host",
  "quiet_rest",
  "parking_included",
  "pet_friendly",
  "strong_wifi",
  "contract_friendly",
].map((id) => ({
  id,
  label: STRUCTURED_TAG_LABELS[id] ?? id.replace(/_/g, " "),
}));

function formatSentimentTag(tag: string) {
  if (!tag) return tag;
  if (STRUCTURED_TAG_LABELS[tag]) return STRUCTURED_TAG_LABELS[tag];
  return tag
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function deriveSentimentTags(review: Review) {
  const labels = new Set<string>();
  (review.sentimentTags ?? []).forEach((tag) => labels.add(formatSentimentTag(tag)));
  const body = review.body?.toLowerCase() ?? "";
  SENTIMENT_RULES.forEach(({ label, patterns }) => {
    if (patterns.some((pattern) => pattern.test(body))) {
      labels.add(label);
    }
  });
  if (review.stayType === "assignment") labels.add("Contract-friendly");
  if (review.rating >= 4.8) labels.add("Highly rated stay");
  return Array.from(labels);
}

export default function ListingDetailPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const listing = useAppStore(selectListingById(listingId ?? ""));
  const contract = useAppStore(selectActiveContract);
  const nurseProfile = useAppStore(selectCurrentNurseProfile);

  const addToShortlist = useAppStore((state) => state.actions.addToShortlist);
  const requestHold = useAppStore((state) => state.actions.requestHold);
  const fetchReviewsForListing = useAppStore((state) => state.actions.fetchReviewsForListing);
  const fetchAvailabilityForListing = useAppStore((state) => state.actions.fetchAvailabilityForListing);
  const submitReview = useAppStore((state) => state.actions.submitReview);
  const reviews = useAppStore((state) =>
    state.reviews.filter((review) => review.listingId === (listingId ?? ""))
  );

  const ownerProfiles = useAppStore((state) => state.ownerProfiles);
  const users = useAppStore((state) => state.users);
  const availability = useAppStore((state) => state.availability);
  const listings = useAppStore((state) => state.listings);

  const [holdState, setHoldState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ status: "idle" });

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  if (!listing) {
    return (
      <div className="rounded-[32px] border border-dashed border-[var(--nh-border)] bg-white p-12 text-center text-sm text-[var(--nh-text-secondary)]">
        Listing not found. This unit may have been removed or snoozed.
      </div>
    );
  }

  const hostProfile = ownerProfiles.find((profile) => profile.id === listing.ownerId);
  const hostUser = users.find((user) => user.id === hostProfile?.userId);

  const mediaItems = useMemo<MediaItem[]>(() => {
    const items: MediaItem[] = [];
    if (listing.heroImage) {
      items.push({ type: "image", url: listing.heroImage });
    }
    const galleryImages = listing.gallery
      .filter((media) => media.type === "image" && media.url)
      .map((media) => ({ type: "image" as const, url: media.url }));
    const galleryVideos = listing.gallery
      .filter((media) => media.type === "video" && media.url)
      .map((media) => ({ type: "video" as const, url: media.url, poster: media.poster }));
    items.push(...galleryImages);
    if (listing.videoUrl) {
      items.push({ type: "video", url: listing.videoUrl });
    }
    items.push(...galleryVideos);
    return items;
  }, [listing.heroImage, listing.gallery, listing.videoUrl]);

  useEffect(() => {
    if (!listing) return;
    fetchReviewsForListing(listing.id).catch(() => undefined);
    fetchAvailabilityForListing(listing.id).catch(() => undefined);
  }, [fetchAvailabilityForListing, fetchReviewsForListing, listing?.id]);

  const breakdown = useMemo(() => {
    if (!contract || !nurseProfile || !listing) return undefined;
    return calculateMatchScore(contract, listing, nurseProfile.preferences);
  }, [contract, listing, nurseProfile]);

  const availabilityBlocks = useMemo(
    () =>
      availability
        .filter((block) => block.listingId === listing.id)
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [availability, listing.id]
  );

  const relatedListings = useMemo(
    () =>
      listings
        .filter(
          (candidate) =>
            candidate.id !== listing.id &&
            candidate.city === listing.city &&
            candidate.status === "active"
        )
        .slice(0, 4),
    [listing.city, listing.id, listings]
  );

  const amenities = listing.amenities.slice(0, 12);

  const enumerateIsoRange = (startIso: string, endIso: string) => {
    const result: string[] = [];
    const start = new Date(startIso);
    const end = new Date(endIso);
    const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    const boundary = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
    while (cursor <= boundary) {
      result.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return result;
  };

  const minStayNights = Math.max(1, listing.minStayWeeks * 7);

  const unavailableDates = useMemo(() => {
    const blocked = new Set<string>();
    availabilityBlocks.forEach((block) => {
      if (block.status === "available") return;
      enumerateIsoRange(block.startDate, block.endDate).forEach((iso) => blocked.add(iso));
    });
    return blocked;
  }, [availabilityBlocks]);

  const isRangeBlocked = (startIso: string, endIso: string) => {
    if (!startIso || !endIso) return false;
    return enumerateIsoRange(startIso, endIso).some((iso) => unavailableDates.has(iso));
  };

  const calculateNights = (startIso: string, endIso: string) => {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const diff = (end.getTime() - start.getTime()) / 86_400_000;
    if (!Number.isFinite(diff)) return 0;
    return Math.max(1, Math.round(diff) + 1);
  };

  const handleHoldRequest = async (options?: { startDate?: string | null; endDate?: string | null }) => {
    setHoldState({ status: "loading" });
    try {
      const result = await requestHold(listing.id, {
        amountCents: 10_000,
        startDate: options?.startDate ?? undefined,
        endDate: options?.endDate ?? undefined,
      });
      setHoldState({
        status: "success",
        message: result?.clientSecret
          ? "Hold created. Complete verification to secure the unit."
          : "Hold logged. Concierge will confirm within 2 hours.",
      });
      return true;
    } catch (error) {
      setHoldState({
        status: "error",
        message: error instanceof Error ? error.message : "Unable to start hold right now.",
      });
      return false;
    }
  };

  const selectedMedia = mediaItems[selectedMediaIndex] ?? null;
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewTags, setReviewTags] = useState<string[]>([]);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStart, setBookingStart] = useState<string | null>(null);
  const [bookingEnd, setBookingEnd] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const handleResetDates = () => {
    setBookingStart(null);
    setBookingEnd(null);
    setBookingError(null);
  };

  const handleCalendarSelect = (iso: string) => {
    setBookingError(null);
    if (!bookingStart || (bookingStart && bookingEnd)) {
      setBookingStart(iso);
      setBookingEnd(null);
      return;
    }

    const startIso = bookingStart;
    if (new Date(iso) <= new Date(startIso)) {
      setBookingStart(iso);
      setBookingEnd(null);
      return;
    }

    if (isRangeBlocked(startIso, iso)) {
      setBookingError("Selected dates overlap an existing hold or booking.");
      setBookingEnd(null);
      return;
    }

    const nights = calculateNights(startIso, iso);
    if (nights < minStayNights) {
      setBookingError(
        `Minimum stay is ${minStayNights % 7 === 0 ? `${minStayNights / 7} week${minStayNights / 7 === 1 ? "" : "s"}` : `${minStayNights} night${minStayNights === 1 ? "" : "s"}`}.`
      );
      setBookingEnd(null);
      return;
    }

    setBookingEnd(iso);
  };

  const nightsSelected = bookingStart && bookingEnd ? calculateNights(bookingStart, bookingEnd) : 0;

  const handleBookingConfirm = async () => {
    if (!bookingStart || !bookingEnd) {
      setBookingError("Select check-in and check-out dates.");
      return;
    }

    if (nightsSelected < minStayNights) {
      setBookingError(
        `Minimum stay is ${minStayNights % 7 === 0 ? `${minStayNights / 7} week${minStayNights / 7 === 1 ? "" : "s"}` : `${minStayNights} night${minStayNights === 1 ? "" : "s"}`}.`
      );
      return;
    }

    if (isRangeBlocked(bookingStart, bookingEnd)) {
      setBookingError("Selected dates overlap an existing hold or booking.");
      return;
    }

    setBookingSubmitting(true);
    const success = await handleHoldRequest({ startDate: bookingStart, endDate: bookingEnd });
    setBookingSubmitting(false);
    if (success) {
      setBookingOpen(false);
      setBookingError(null);
    } else {
      setBookingError("We couldn't create the hold. Try again.");
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewBody.trim()) return;
    setReviewSubmitting(true);
    try {
      await submitReview({
        listingId: listing.id,
        rating: reviewRating,
        body: reviewBody.trim(),
        tags: reviewTags,
      });
      setReviewBody("");
      setReviewRating(5);
      setReviewTags([]);
      await fetchReviewsForListing(listing.id);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleToggleReviewTag = (tag: string) => {
    setReviewTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const reviewStats = useMemo(() => {
    if (!reviews.length) {
      const base = listing.qualityScore ? listing.qualityScore / 20 : 4.6;
      const rating = Math.min(5, Math.max(3.8, Math.round(base * 10) / 10));
      return { rating, count: 0, highlights: [] as string[], tags: [] as string[] };
    }
    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const rating = Math.round(average * 10) / 10;
    const tagCounts = new Map<string, number>();
    reviews.forEach((review) => {
      deriveSentimentTags(review).forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      });
    });
    const tags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 6);
    const highlights = reviews
      .filter((review) => Boolean(review.body))
      .slice(0, 3)
      .map((review) => (review.body.length > 120 ? `${review.body.slice(0, 117)}…` : review.body));
    return { rating, count: reviews.length, highlights, tags };
  }, [listing.qualityScore, reviews]);

  const highlightBadges = useMemo(() => {
    const badges = [
      { icon: Shield, label: `${listing.safetyFeatures?.length ?? 0}+ safety checks` },
      { icon: Clock, label: `${listing.minStayWeeks} week min stay` },
      { icon: MapPin, label: `${listing.commuteMinutesNight} min night commute` },
    ];
    if (reviewStats.tags.length) {
      badges.splice(1, 0, { icon: Sparkles, label: reviewStats.tags[0] });
    }
    return badges.slice(0, 3);
  }, [listing.commuteMinutesNight, listing.minStayWeeks, listing.safetyFeatures, reviewStats.tags]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--nh-text-secondary)] transition hover:text-[var(--nh-text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <button type="button" className="btn btn-ghost">
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button type="button" className="btn btn-ghost">
            <Heart className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      <ListingMediaGallery
        items={mediaItems}
        selectedIndex={selectedMediaIndex}
        onSelect={setSelectedMediaIndex}
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <main className="space-y-10">
          <header className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                  {listing.neighborhood ?? listing.city}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--nh-text-primary)] sm:text-4xl">
                  {listing.title}
                </h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-[var(--nh-text-secondary)]">
                  <MapPin className="h-4 w-4 text-[var(--nh-accent)]" />
                  {listing.city}, {listing.state}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--nh-border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--nh-text-secondary)]">
                <BadgeCheck className="h-4 w-4 text-[var(--nh-accent)]" />
                Nurse verified
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {highlightBadges.map((badge) => (
                <HighlightBadge key={badge.label} icon={badge.icon} label={badge.label} />
              ))}
            </div>

            <p className="max-w-3xl text-sm leading-relaxed text-[var(--nh-text-secondary)]">
              {listing.description}
            </p>

            <HostSummary hostUser={hostUser} hostProfile={hostProfile} listing={listing} />
          </header>

          {breakdown && (
            <section className="rounded-[32px] border border-[var(--nh-border)] bg-white/90 p-6 shadow-[var(--nh-shadow-soft)]">
              <h2 className="text-lg font-semibold text-[var(--nh-text-primary)]">Match breakdown</h2>
              <p className="mt-2 text-sm text-[var(--nh-text-secondary)]">
                We ranked this stay against your stipend, commute guardrails, and safety expectations.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <BreakdownPill label="Stipend fit" value={`${Math.round(breakdown.stipendFit)}%`} />
                <BreakdownPill label="Commute guardrail" value={`${Math.round(breakdown.commute)}%`} />
                <BreakdownPill label="Safety score" value={`${Math.round(breakdown.safety)}%`} />
                <BreakdownPill label="Quality signals" value={`${Math.round(breakdown.quality)}%`} />
              </div>
            </section>
          )}

          <ReviewsSummary
            rating={reviewStats.rating}
            count={reviewStats.count}
            highlights={reviewStats.highlights}
            tags={reviewStats.tags}
            hasReviews={reviews.length > 0}
            onOpen={() => setReviewsOpen(true)}
          />

      <ReviewsModal open={reviewsOpen} reviews={reviews} onClose={() => setReviewsOpen(false)} />

      <ReviewForm
        rating={reviewRating}
        body={reviewBody}
        onRatingChange={setReviewRating}
        onBodyChange={setReviewBody}
        onSubmit={handleSubmitReview}
        submitting={reviewSubmitting}
        selectedTags={reviewTags}
        onToggleTag={handleToggleReviewTag}
      />

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--nh-text-primary)]">Amenities &amp; safety</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {amenities.map((amenity) => (
                <AmenityChip key={amenity} label={amenity} />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--nh-text-primary)]">Availability</h2>
            <AvailabilityCalendar
              blocks={availabilityBlocks}
              selectedStart={bookingStart}
              selectedEnd={bookingEnd}
              minStayNights={minStayNights}
              onSelectDate={handleCalendarSelect}
            />
            {bookingError ? (
              <p className="rounded-2xl bg-rose-50 px-4 py-2 text-xs text-rose-600">{bookingError}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--nh-text-secondary)]">
              <span>
                {bookingStart
                  ? `Selected: ${new Date(bookingStart).toLocaleDateString()}${bookingEnd ? ` → ${new Date(bookingEnd).toLocaleDateString()}` : ""}`
                  : "Tap dates to stage a hold for your assignment."}
              </span>
              {nightsSelected ? (
                <span className="font-semibold text-[var(--nh-text-primary)]">
                  {nightsSelected} night{nightsSelected === 1 ? "" : "s"}
                </span>
              ) : null}
              {(bookingStart || bookingEnd) && (
                <button type="button" onClick={handleResetDates} className="btn btn-ghost px-3 py-1 text-[11px] font-semibold">
                  Reset selection
                </button>
              )}
            </div>
          </section>

      <CancellationPolicySection />

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--nh-text-primary)]">Neighborhood &amp; commute</h2>
            <p className="text-sm text-[var(--nh-text-secondary)]">
              {listing.commuteNotes ?? "Surface streets only with protected overnight parking along the route."}
            </p>
            <p className="text-xs text-[var(--nh-text-secondary)]">
              Peak commute {listing.commuteMinutesPeak} min • Night {listing.commuteMinutesNight} min
            </p>
            <div className="overflow-hidden rounded-[28px] border border-[var(--nh-border)]">
              <Suspense
                fallback={
                  <div className="grid h-[320px] place-items-center text-sm text-[var(--nh-text-secondary)]">
                    Loading map…
                  </div>
                }
              >
                <ListingMap
                  listings={[
                    {
                      id: listing.id,
                      title: listing.title,
                      lat: listing.lat,
                      lng: listing.lng,
                      nightlyPrice: Math.round(listing.weeklyPrice / 7),
                    },
                  ]}
                  height={320}
                  activeListingId={listing.id}
                />
              </Suspense>
            </div>
          </section>

      {!!relatedListings.length && (
        <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--nh-text-primary)]">You may also like</h2>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-xs font-semibold text-[var(--nh-accent)] hover:underline"
                >
                  Back to top
                </button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {relatedListings.map((related) => (
                  <ListingExploreCard key={related.id} listing={related} />
                ))}
              </div>
        </section>
      )}
    </main>

    <aside className="lg:sticky lg:top-20">
          <div className="space-y-6 rounded-[32px] border border-[var(--nh-border)] bg-white/95 p-6 shadow-[var(--nh-shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                  Weekly rate
                </p>
                <p className="text-2xl font-semibold text-[var(--nh-text-primary)]">
                  ${listing.weeklyPrice.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12">
                <LottieAnimation animation="bookingSuccess" autoplay loop={false} />
              </div>
            </div>

            <PricingBreakdown weeklyPrice={listing.weeklyPrice} />

            <button
              type="button"
              onClick={() => {
                void handleHoldRequest();
              }}
              className="btn btn-primary w-full justify-center"
              disabled={holdState.status === "loading"}
              aria-busy={holdState.status === "loading"}
            >
              {holdState.status === "loading" ? "Requesting hold…" : "Request 24h hold"}
            </button>
            <button
              type="button"
              onClick={() => {
                setBookingError(null);
                setBookingOpen(true);
              }}
              className="btn btn-outline w-full justify-center"
            >
              Start booking request
            </button>
            <button
              type="button"
              onClick={() => addToShortlist(listing.id)}
              className="btn btn-outline w-full justify-center"
            >
              Save to shortlist
            </button>
            <button type="button" className="btn btn-ghost w-full justify-center">
              <MessageCircle className="h-4 w-4" />
              Message host
            </button>

            {holdState.status === "success" && holdState.message && (
              <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-xs text-emerald-700">{holdState.message}</p>
            )}
            {holdState.status === "error" && holdState.message && (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-xs text-rose-600">{holdState.message}</p>
            )}

            <div className="rounded-2xl border border-[var(--nh-border)] bg-[var(--nh-surface-muted)] px-4 py-3 text-xs text-[var(--nh-text-secondary)]">
              <p className="font-semibold text-[var(--nh-text-primary)]">Heads up:</p>
              <p>This hold runs a soft ID verification and a fully refundable $100 intent fee.</p>
            </div>
          </div>
        </aside>
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          blocks={availabilityBlocks}
          selectedStart={bookingStart}
          selectedEnd={bookingEnd}
          minStayNights={minStayNights}
          onSelectDate={handleCalendarSelect}
          onResetDates={handleResetDates}
          onConfirm={handleBookingConfirm}
          submitting={bookingSubmitting}
          error={bookingError}
          nights={nightsSelected}
          weeklyPrice={listing.weeklyPrice}
        />
      </div>
    </div>
  );
}

function ListingMediaGallery({
  items,
  selectedIndex,
  onSelect,
}: {
  items: MediaItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const selected = items[selectedIndex];
  if (!selected) return null;

  return (
    <section className="space-y-3">
      <div className="overflow-hidden rounded-[36px] border border-[var(--nh-border)] bg-black/5 shadow-[0_40px_90px_rgba(34,34,34,0.14)]">
        <div className="relative aspect-[16/9] w-full bg-black/10">
          {selected.type === "image" ? (
            <img src={selected.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <video
              src={selected.url}
              poster={selected.poster ?? undefined}
              controls
              className="h-full w-full object-cover"
              muted
              playsInline
            />
          )}
          {selected.type === "video" && (
            <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              <Sparkles className="h-3.5 w-3.5 text-[var(--nh-accent)]" />
              10s tour
            </span>
          )}
        </div>
      </div>

      {items.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto">
          {items.map((item, index) => (
            <button
              key={`${item.type}-${item.url}`}
              type="button"
              onClick={() => onSelect(index)}
              className={clsx(
                "relative h-20 w-28 overflow-hidden rounded-2xl border transition",
                selectedIndex === index
                  ? "border-[var(--nh-accent)] shadow-[0_12px_24px_rgba(255,56,92,0.25)]"
                  : "border-[var(--nh-border)] hover:border-[var(--nh-border-strong)]"
              )}
            >
              {item.type === "image" ? (
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <video src={item.url} poster={item.poster ?? undefined} className="h-full w-full object-cover" muted />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function HostSummary({
  hostUser,
  hostProfile,
  listing,
}: {
  hostUser?: { fullName: string; avatarUrl?: string; email: string };
  hostProfile?: OwnerProfile;
  listing: ListingType;
}) {
  const responseTime = hostProfile?.responseTimeHours ?? 4;
  const rating = hostProfile?.rating ?? 4.8;

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-[var(--nh-border)] bg-white/90 p-6 shadow-[var(--nh-shadow-soft)]">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-[var(--nh-surface-muted)] text-[var(--nh-text-primary)]">
          {hostUser?.avatarUrl ? (
            <img src={hostUser.avatarUrl} alt={hostUser.fullName} className="h-full w-full object-cover" />
          ) : (
            <UserRound className="h-6 w-6" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--nh-text-primary)]">
            Hosted by {hostUser?.fullName ?? "Verified Host"}
          </p>
          <p className="text-xs text-[var(--nh-text-secondary)]">
            {listing.bedrooms} bd • {listing.bathrooms} ba • {Math.round(rating * 20)}% host reliability
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--nh-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--nh-text-secondary)]">
            <ShieldCheck className="h-4 w-4 text-[var(--nh-accent)]" />
            {hostProfile?.verified ? "Host + ID verified" : "Awaiting verification"}
          </div>
        </div>
      </div>
      <div className="flex gap-6 text-sm text-[var(--nh-text-secondary)]">
        <div>
          <p className="text-xs uppercase tracking-[0.18em]">Rating</p>
          <p className="mt-1 flex items-center gap-1 font-semibold text-[var(--nh-text-primary)]">
            <Star className="h-4 w-4 text-[var(--nh-accent)]" />
            {rating.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em]">Response time</p>
          <p className="mt-1 font-semibold text-[var(--nh-text-primary)]">&lt; {responseTime} hrs</p>
        </div>
      </div>
    </section>
  );
}

function ReviewsSummary({
  rating,
  count,
  highlights,
  tags,
  hasReviews,
  onOpen,
}: {
  rating: number;
  count: number;
  highlights: string[];
  tags: string[];
  hasReviews: boolean;
  onOpen: () => void;
}) {
  return (
    <section className="space-y-4 rounded-[32px] border border-[var(--nh-border)] bg-white/90 p-6 shadow-[var(--nh-shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--nh-accent-soft)] text-[var(--nh-accent)]">
            <Star className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-semibold text-[var(--nh-text-primary)]">{rating.toFixed(1)} / 5</p>
            <p className="text-xs text-[var(--nh-text-secondary)]">
              {count ? `${count} nurse review${count === 1 ? "" : "s"}` : "Reviews coming soon"}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="text-xs font-semibold text-[var(--nh-accent)] hover:underline disabled:opacity-40"
          onClick={onOpen}
          disabled={!hasReviews}
        >
          View all reviews
        </button>
      </div>
      {tags.length ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--nh-border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]"
            >
              <Sparkles className="h-3 w-3 text-[var(--nh-accent)]" />
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {highlights.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {highlights.map((highlight) => (
            <li
              key={highlight}
              className="rounded-2xl border border-[var(--nh-border)] bg-white px-4 py-3 text-xs text-[var(--nh-text-secondary)]"
            >
              <Star className="mr-2 inline h-3 w-3 text-[var(--nh-accent)]" />
              {highlight}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[var(--nh-text-secondary)]">We’ll surface highlights once reviews roll in.</p>
      )}
    </section>
  );
}

function ReviewsModal({ open, reviews, onClose }: { open: boolean; reviews: Review[]; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-[32px] border border-[var(--nh-border)] bg-white shadow-[0_40px_90px_rgba(34,34,34,0.2)]">
        <header className="flex items-center justify-between border-b border-[var(--nh-border)] bg-[var(--nh-surface-muted)] px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-[var(--nh-text-primary)]">Nurse reviews</p>
            <p className="text-xs text-[var(--nh-text-secondary)]">{reviews.length} stay{reviews.length === 1 ? "" : "s"} reported</p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost px-3 py-1 text-xs font-semibold">
            Close
          </button>
        </header>
        <div className="max-h-[70vh] divide-y divide-[var(--nh-border)] overflow-y-auto">
          {reviews.map((review) => {
            const tags = deriveSentimentTags(review);
            return (
              <article key={review.id} className="space-y-2 px-6 py-5 text-sm text-[var(--nh-text-secondary)]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--nh-accent-soft)] px-2 py-1 text-xs font-semibold text-[var(--nh-accent)]">
                    <Star className="h-3 w-3" />
                    {review.rating.toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-[var(--nh-text-primary)]">{review.reviewerName}</span>
                  {review.reviewerRole && (
                    <span className="text-xs uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                      {review.reviewerRole}
                    </span>
                  )}
                </div>
                <p>{review.body}</p>
                {tags.length ? (
                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--nh-border)] bg-white px-2 py-1"
                      >
                        <Sparkles className="h-3 w-3 text-[var(--nh-accent)]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                  Stayed {new Date(review.createdAt).toLocaleDateString()} {review.stayType ? `• ${review.stayType}` : ""}
                </p>
              </article>
            );
          })}
          {reviews.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-[var(--nh-text-secondary)]">
              Reviews will appear once the first nurse completes a stay.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewForm({
  rating,
  body,
  onRatingChange,
  onBodyChange,
  onSubmit,
  submitting,
  selectedTags,
  onToggleTag,
}: {
  rating: number;
  body: string;
  onRatingChange: (rating: number) => void;
  onBodyChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}) {
  return (
    <section className="space-y-4 rounded-[32px] border border-[var(--nh-border)] bg-white/90 p-6 shadow-[var(--nh-shadow-soft)]">
      <div>
        <h3 className="text-lg font-semibold text-[var(--nh-text-primary)]">Share your experience</h3>
        <p className="text-xs text-[var(--nh-text-secondary)]">
          Help other nurses decide quickly by leaving a short review after your stay.
        </p>
      </div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onRatingChange(value)}
            className={clsx(
              "grid h-10 w-10 place-items-center rounded-full border",
              value <= rating
                ? "border-[var(--nh-accent)] bg-[var(--nh-accent-soft)] text-[var(--nh-accent)]"
                : "border-[var(--nh-border)] text-[var(--nh-text-secondary)]"
            )}
          >
            <Star className="h-4 w-4" />
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(event) => onBodyChange(event.target.value)}
        placeholder="How did this stay support your assignment?"
        className="h-28 w-full rounded-3xl border border-[var(--nh-border)] bg-[var(--nh-surface-muted)] px-4 py-3 text-sm text-[var(--nh-text-primary)] placeholder:text-[var(--nh-text-secondary)] focus:border-[var(--nh-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--nh-accent-soft)]"
      />
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
          Tag the highlights (optional)
        </p>
        <div className="flex flex-wrap gap-2">
          {SENTIMENT_FORM_OPTIONS.map((option) => {
            const isActive = selectedTags.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onToggleTag(option.id)}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                  isActive
                    ? "border-[var(--nh-accent)] bg-[var(--nh-accent-soft)] text-[var(--nh-accent)]"
                    : "border-[var(--nh-border)] text-[var(--nh-text-secondary)] hover:border-[var(--nh-border-strong)]"
                )}
              >
                <Sparkles className="h-3 w-3" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        className="btn btn-primary"
        disabled={!body.trim() || submitting}
        aria-busy={submitting}
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </section>
  );
}

function PricingBreakdown({ weeklyPrice }: { weeklyPrice: number }) {
  const cleaningFee = Math.round(weeklyPrice * 0.08);
  const serviceFee = Math.round(weeklyPrice * 0.05);
  const total = weeklyPrice + cleaningFee + serviceFee;

  return (
    <div className="space-y-2 text-xs text-[var(--nh-text-secondary)]">
      <div className="flex items-center justify-between">
        <span>Base rent</span>
        <span>${weeklyPrice.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Cleaning</span>
        <span>${cleaningFee.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Service fee</span>
        <span>${serviceFee.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between font-semibold text-[var(--nh-text-primary)]">
        <span>Due weekly</span>
        <span>${total.toLocaleString()}</span>
      </div>
    </div>
  );
}

function HighlightBadge({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--nh-border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--nh-text-secondary)]">
      <Icon className="h-4 w-4 text-[var(--nh-accent)]" />
      {label}
    </span>
  );
}

function CancellationPolicySection() {
  return (
    <section className="space-y-3 rounded-[32px] border border-[var(--nh-border)] bg-white/90 p-6 shadow-[var(--nh-shadow-soft)]">
      <h2 className="text-lg font-semibold text-[var(--nh-text-primary)]">Cancellation &amp; refund policy</h2>
      <ul className="space-y-2 text-sm text-[var(--nh-text-secondary)]">
        <li>• Free cancellation up to 7 days before check-in.</li>
        <li>• 50% refund between 7 days and 48 hours before arrival.</li>
        <li>• Within 48 hours, refunds require admin approval and documentation.</li>
      </ul>
      <a
        href="https://www.airbnb.com/help/article/149"
        target="_blank"
        rel="noreferrer"
        className="text-xs font-semibold text-[var(--nh-accent)] hover:underline"
      >
        Review full cancellation policy
      </a>
    </section>
  );
}

function BookingModal({
  open,
  onClose,
  blocks,
  selectedStart,
  selectedEnd,
  minStayNights,
  onSelectDate,
  onResetDates,
  onConfirm,
  submitting,
  error,
  nights,
  weeklyPrice,
}: {
  open: boolean;
  onClose: () => void;
  blocks: AvailabilityBlock[];
  selectedStart: string | null;
  selectedEnd: string | null;
  minStayNights: number;
  onSelectDate: (isoDate: string) => void;
  onResetDates: () => void;
  onConfirm: () => void;
  submitting: boolean;
  error: string | null;
  nights: number;
  weeklyPrice: number;
}) {
  if (!open) return null;

  const nightlyRate = weeklyPrice / 7;
  const estimatedTotal = nights ? Math.round(nightlyRate * nights) : 0;
  const hasSelection = Boolean(selectedStart && selectedEnd);
  const minStayLabel =
    minStayNights % 7 === 0
      ? `${minStayNights / 7} week${minStayNights / 7 === 1 ? "" : "s"}`
      : `${minStayNights} night${minStayNights === 1 ? "" : "s"}`;

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-[32px] border border-[var(--nh-border)] bg-white shadow-[0_40px_90px_rgba(34,34,34,0.25)]">
        <header className="flex items-center justify-between border-b border-[var(--nh-border)] bg-[var(--nh-surface-muted)] px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-[var(--nh-text-primary)]">Booking request</p>
            <p className="text-xs text-[var(--nh-text-secondary)]">
              Lock in your stay dates to send the hold request to the host.
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost px-3 py-1 text-xs font-semibold">
            Close
          </button>
        </header>
        <div className="grid gap-6 bg-white px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <AvailabilityCalendar
              blocks={blocks}
              selectedStart={selectedStart ?? undefined}
              selectedEnd={selectedEnd ?? undefined}
              minStayNights={minStayNights}
              onSelectDate={onSelectDate}
            />
            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-2 text-xs text-rose-600">{error}</p> : null}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--nh-text-secondary)]">
              <span>
                {hasSelection
                  ? `${new Date(selectedStart as string).toLocaleDateString()} → ${new Date(
                      selectedEnd as string
                    ).toLocaleDateString()}`
                  : "Tap dates on the calendar to stage your hold."}
              </span>
              {hasSelection ? (
                <span className="font-semibold text-[var(--nh-text-primary)]">
                  {nights} night{nights === 1 ? "" : "s"}
                </span>
              ) : null}
              {hasSelection && (
                <button type="button" onClick={onResetDates} className="btn btn-ghost px-3 py-1 text-[11px] font-semibold">
                  Reset
                </button>
              )}
            </div>
            <p className="text-[11px] text-[var(--nh-text-secondary)]">
              Minimum stay: {minStayLabel}. Holds block the calendar for 24 hours while you finish verification.
            </p>
          </div>
          <div className="space-y-3 rounded-3xl border border-[var(--nh-border)] bg-white/90 p-4 shadow-[var(--nh-shadow-soft)]">
            <div className="flex items-center justify-between text-sm">
              <span>Projected stay</span>
              <span className="font-semibold text-[var(--nh-text-primary)]">
                {hasSelection ? `${nights} night${nights === 1 ? "" : "s"}` : "Select dates"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-[var(--nh-text-secondary)]">
              <span>Rate guidance</span>
              <span className="text-base font-semibold text-[var(--nh-text-primary)]">${nightlyRate.toFixed(0)} / night</span>
            </div>
            <div className="flex items-center justify-between text-sm text-[var(--nh-text-secondary)]">
              <span>Estimated total</span>
              <span className="text-base font-semibold text-[var(--nh-text-primary)]">
                {hasSelection ? `$${estimatedTotal.toLocaleString()}` : "—"}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-primary w-full justify-center"
              disabled={!hasSelection || submitting || nights < minStayNights}
              aria-busy={submitting}
              onClick={onConfirm}
            >
              {submitting ? "Submitting hold…" : "Submit hold request"}
            </button>
            <p className="text-[11px] text-[var(--nh-text-secondary)]">
              No charges until the host approves. We’ll confirm the hold within minutes and update the calendar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--nh-border)] bg-white px-4 py-3 text-sm text-[var(--nh-text-secondary)]">
      <span>{label}</span>
      <span className="font-semibold text-[var(--nh-text-primary)]">{value}</span>
    </div>
  );
}

function AmenityChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-2xl border border-[var(--nh-border)] bg-white px-4 py-2 text-xs text-[var(--nh-text-primary)]">
      <ShieldCheck className="h-3.5 w-3.5 text-[var(--nh-accent)]" />
      {label}
    </span>
  );
}
