import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Heart,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import ListingMap from "../components/map/ListingMap";
import LottieAnimation from "../components/ui/LottieAnimation";
import { calculateMatchScore } from "../lib/scoring";
import {
  selectActiveContract,
  selectCurrentNurseProfile,
  selectListingById,
  useAppStore,
} from "../stores/useAppStore";

export default function ListingDetailPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const listing = useAppStore(selectListingById(listingId ?? ""));
  const contract = useAppStore(selectActiveContract);
  const nurseProfile = useAppStore(selectCurrentNurseProfile);
  const addToShortlist = useAppStore((state) => state.actions.addToShortlist);

  const breakdown = useMemo(() => {
    if (!listing || !contract || !nurseProfile) return undefined;
    return calculateMatchScore(contract, listing, nurseProfile.preferences);
  }, [listing, contract, nurseProfile]);

  if (!listing) {
    return (
      <div className="rounded-[32px] border border-dashed border-[var(--nh-border)] bg-white p-12 text-center text-sm text-[var(--nh-text-secondary)]">
        Listing not found. This unit may have been removed or snoozed.
      </div>
    );
  }

  const galleryImages = [
    listing.heroImage,
    ...listing.gallery.filter((media) => media.type === "image").map((media) => media.url),
  ].filter(Boolean);

  const highlightBadges = [
    { icon: ShieldCheck, label: "Verified host" },
    { icon: MapPin, label: `${listing.commuteMinutesNight} min night commute` },
    { icon: Clock, label: `${listing.minStayWeeks}-week minimum stay` },
  ];

  const amenities = listing.amenities.slice(0, 12);

  return (
    <div className="space-y-8">
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

      <section className="overflow-hidden rounded-[36px] border border-[var(--nh-border)] bg-white shadow-[0_40px_90px_rgba(34,34,34,0.14)]">
        <div className="grid gap-2 md:grid-cols-[3fr,2fr]">
          <div className="relative h-full">
            <img
              src={galleryImages[0]}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
            <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nh-text-secondary)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--nh-accent)]" />
              Featured stay
            </span>
          </div>
          <div className="hidden grid-rows-2 gap-2 md:grid">
            {galleryImages.slice(1, 5).map((image) => (
              <img key={image} src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <main className="space-y-10">
          <header className="space-y-5">
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

            <p className="max-w-3xl text-sm leading-relaxed text-[var(--nh-text-secondary)]">{listing.description}</p>
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

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--nh-text-primary)]">Amenities &amp; safety</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {amenities.map((amenity) => (
                <AmenityChip key={amenity} label={amenity} />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--nh-text-primary)]">Neighborhood &amp; commute</h2>
            <p className="text-sm text-[var(--nh-text-secondary)]">
              {listing.commuteNotes ?? "Surface streets only with protected overnight parking along the route."}
            </p>
            <p className="text-xs text-[var(--nh-text-secondary)]">
              Peak commute {listing.commuteMinutesPeak} min • Night {listing.commuteMinutesNight} min
            </p>
            <div className="overflow-hidden rounded-[28px] border border-[var(--nh-border)]">
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
              />
            </div>
          </section>
        </main>

        <aside className="lg:sticky lg:top-28">
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

            <div className="space-y-2 text-xs text-[var(--nh-text-secondary)]">
              <div className="flex items-center justify-between">
                <span>Base rent</span>
                <span>${listing.weeklyPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Safety premium</span>
                <span>$0</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-[var(--nh-text-primary)]">
                <span>Total due weekly</span>
                <span>${listing.weeklyPrice.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => addToShortlist(listing.id)}
              className="btn btn-primary w-full justify-center"
            >
              Request 24h hold
            </button>
            <button type="button" className="btn btn-outline w-full justify-center">
              Message host
            </button>

            <div className="rounded-2xl border border-[var(--nh-border)] bg-[var(--nh-surface-muted)] px-4 py-3 text-xs text-[var(--nh-text-secondary)]">
              <p className="font-semibold text-[var(--nh-text-primary)]">Heads up:</p>
              <p>This hold runs a soft ID verification and fully refundable $100 intent fee.</p>
            </div>
          </div>
        </aside>
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

