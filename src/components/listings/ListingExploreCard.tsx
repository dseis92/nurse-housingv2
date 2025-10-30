import { Heart, MapPin, ShieldCheck, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Listing } from "../../types";

interface ListingExploreCardProps {
  listing: Listing;
  onHover?: (listingId: string) => void;
  onLeave?: () => void;
  onSelect?: (listingId: string) => void;
}

export default function ListingExploreCard({
  listing,
  onHover,
  onLeave,
  onSelect,
}: ListingExploreCardProps) {
  const rating = listing.qualityScore
    ? Math.max(3.8, Math.round((listing.qualityScore / 20) * 10) / 10)
    : 4.7;
  const ratingLabel = `${rating.toFixed(1)} • Nurse rated`;

  return (
    <article
      className="group space-y-3"
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onLeave?.()}
      onFocus={() => onHover?.(listing.id)}
      onBlur={() => onLeave?.()}
    >
      <Link
        to={`/listing/${listing.id}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-3xl bg-[var(--nh-surface-muted)] shadow-[var(--nh-shadow-soft)] transition hover:shadow-[var(--nh-shadow-card)]"
        onClick={() => onSelect?.(listing.id)}
      >
        <img
          src={listing.heroImage}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
        />
        <button
          type="button"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[var(--nh-text-primary)] shadow-[var(--nh-shadow-soft)] transition hover:text-[var(--nh-accent)]"
          aria-label="Save to shortlist"
        >
          <Heart className="h-4 w-4" />
        </button>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[var(--nh-text-primary)] shadow">
          <ShieldCheck className="h-3 w-3 text-[var(--nh-accent)]" />
          Safety {listing.safetyScore}
        </span>
      </Link>

      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onSelect?.(listing.id)}
          className="space-y-1 text-left"
        >
          <h3 className="text-sm font-semibold leading-tight text-[var(--nh-text-primary)]">{listing.title}</h3>
          <p className="flex items-center gap-1 text-xs text-[var(--nh-text-secondary)]">
            <MapPin className="h-3 w-3" />
            {listing.city}, {listing.state}
          </p>
          <p className="flex items-center gap-1 text-xs font-semibold text-[var(--nh-text-primary)]">
            <Star className="h-3 w-3 text-[var(--nh-accent)]" />
            {ratingLabel}
          </p>
        </button>
        <div className="text-right text-sm font-semibold text-[var(--nh-text-primary)]">
          ${listing.weeklyPrice.toLocaleString()}
          <span className="block text-[11px] font-normal text-[var(--nh-text-secondary)]">per week</span>
        </div>
      </div>

      <p className="line-clamp-2 text-xs text-[var(--nh-text-secondary)]">{listing.description}</p>
    </article>
  );
}
