# Nurse Housing App — Project Overview

_Last updated: 2025-10-30_ (ENSURE TO ALWAYS UPDATE README.md)

**\*UPDATED\*\***

# 🏠 Short-Term Rental App UX & Feature Checklist

A master UX + feature checklist compiled from top platforms like Airbnb, Vrbo, Booking.com, and niche rental sites (Plum Guide, Kid & Coe, etc.).

---

## ✅ Essential Components (Common to All)

### 🌍 Homepage / Search

- [ ] Hero search bar (destination, dates, guests)
- [ ] Quick “Where / When / Who” flow
- [ ] Popular destinations section
- [ ] Recent searches or suggested areas
- [ ] Responsive map toggle or preview

### 🧭 Search Results

- [ ] Grid or card view of listings
- [ ] Price per night clearly visible
- [ ] Ratings & reviews summary on cards
- [ ] Filters (price, amenities, location, type, size)
- [ ] Sort options (price low→high, rating, distance)
- [ ] Interactive map sync with results

### 🏡 Listing Detail Page

- [ ] Large photo gallery with thumbnails or carousel
- [ ] Title, description, amenities
- [ ] Dynamic pricing / breakdown (base + fees + taxes)
- [ ] Host profile (photo, rating, verified status)
- [ ] Guest reviews with star ratings and filters
- [ ] Calendar availability view
- [ ] “Book Now” / “Reserve” CTA always visible
- [ ] Cancellation & refund policies
- [ ] Similar listings / “You may also like”

### 💳 Booking Flow

- [ ] Step-by-step guided checkout (dates → price → payment)
- [ ] Transparent pricing before final confirmation
- [ ] Secure payment integration (Stripe, PayPal, etc.)
- [ ] Save favorite listings (wishlist)
- [ ] Guest login / signup flow
- [ ] Confirmation screen + email receipt

### 👥 User Accounts

- [ ] Dual mode: Guest & Host accounts
- [ ] Profile setup wizard
- [ ] Profile picture, bio, verification
- [ ] Saved trips or past bookings
- [ ] Communication inbox (messages between host & guest)

### 🧑‍💼 Host Dashboard

- [ ] Add/edit property flow
- [ ] Photo upload & auto enhancement
- [ ] Calendar management
- [ ] Pricing management tools
- [ ] Booking requests / approval flow
- [ ] Reviews management
- [ ] Analytics dashboard (views, bookings, earnings)
- [ ] Chat or messaging with guests

### 🛡️ Trust & Safety

- [ ] ID verification (KYC / upload ID)
- [ ] Secure payment escrow
- [ ] Verified hosts badge
- [ ] Report / block users
- [ ] Cancellation & dispute handling
- [ ] Insurance / damage protection info

### 📱 Mobile UX

- [ ] Fully responsive layout
- [ ] Mobile-first booking flow
- [ ] Sticky CTAs & bottom nav
- [ ] Lazy-loading images
- [ ] Smooth transitions (no jank)

### 🧩 System & Technical

- [ ] Scalable design system (consistent colors, typography)
- [ ] Accessibility (ARIA labels, tab navigation)
- [ ] SEO optimized (structured data for listings)
- [ ] Fast image CDN + lazy load
- [ ] Multi-language & currency support
- [ ] Notification system (email, SMS, push)

---

## 🌟 Differentiating Features (Platform Standouts)

| Platform            | Unique Feature                              | Why It Matters                            |
| ------------------- | ------------------------------------------- | ----------------------------------------- |
| **Airbnb**          | Motion & transitions between list → detail  | Makes navigation feel fluid and premium   |
| **Airbnb**          | Personalized home feed                      | Creates trust & habit forming experience  |
| **Vrbo**            | Focused entirely on full homes & families   | Simpler positioning for certain users     |
| **Plum Guide**      | “Quality curated” only top-tier homes       | Reinforces trust and exclusivity          |
| **Kid & Coe**       | Family-friendly filters (cribs, toys, etc.) | Targets niche audience effectively        |
| **HomeToGo**        | Aggregator search across platforms          | Convenience through aggregation           |
| **Swimply**         | Hourly amenity rentals (pools, spaces)      | Expands definition of “short-term rental” |
| **Booking.com**     | Blends hotels + rentals in one interface    | Hybrid model simplifies search UX         |
| **Marriott Villas** | Loyalty points + hotel-grade standards      | Bridges brand trust with homestays        |
| **Uniplaces**       | Student housing short-term focus            | Academic mobility niche                   |
| **Savvy**           | No-fee, host-first marketplace              | Disruptive business model                 |

---

## 🚀 Your App: Opportunities to Be Better

### 🎨 Design / UX

- [ ] Use motion-based transitions (GSAP, Framer Motion)
- [ ] Gamify booking: XP, rewards, badges for guests/hosts
- [ ] “Quiz-style” booking flow (step-by-step with animations)
- [ ] Micro-interactions (hover effects, animated buttons)
- [ ] Include modern minimal layout (CTRL.xyz / STRYDS.com vibes)
- [ ] “Swipe” navigation for mobile flow (Tinder-style)

### ⚙️ Functionality

- [ ] Realtime availability + map sync
- [ ] Smart recommendations (AI: “Based on your last trip…”)
- [ ] Dynamic pricing engine (weekends vs weekdays, stipend guardrails)

---

## ✅ Latest Implementation Notes

- **Airbnb-inspired shell** — `src/index.css` defines design tokens and button primitives; `AppLayout`, `TopNav`, `SidebarNav`, and `MobileNav` now mirror Airbnb’s polished navigation with pill search, global tokens, and light surfaces.
- **Explore homepage revamp** — `src/pages/DashboardPage.tsx` delivers the hero marquee, filter pills, list/map toggle, and nurse-specific stats with the new `ListingExploreCard` and `ListingMap` integration.
- **Listing detail booking flow** — `src/pages/ListingDetailPage.tsx` features a gallery grid, sticky pricing card with animation (`LottieAnimation`), match breakdown pills, and embedded map preview.
- **Map system upgrades** — `src/components/map/ListingMap.tsx` accepts custom heights and filters invalid coordinates; `GeocoderControl` keeps search consistent across views.
- **Motion system** — `src/config/lottie.ts` centralises assets while `src/components/ui/LottieAnimation.tsx` handles CDN/local fallbacks; onboarding, swipe empty states, shortlist, and booking cards now surface motion cues.
- **Supabase schema** — migration `supabase/migrations/20251025_menu_orders_nurse.sql` seeds listings, bookings, and nurse onboarding tables with matching RLS and RPCs.
- **Build verification** — `npm run build` passes (Vite warns about large chunks from the Lottie player—plan to lazy load heavy animations later).

### Environment & Secrets

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — required for app boot.
- `VITE_MAPBOX_TOKEN` — required for all map features (add to `.env.local` and Vercel).
- `VITE_LOTTIE_CDN_BASE` (optional) — if you want to serve Lottie assets from LottieFiles CDN; populate it to override defaults in `getLottieSource`.

### Motion Asset Library

| Key | Purpose | Local Path |
| --- | ------- | ---------- |
| `onboardingProgress` | Stepper progress pulse | `/onboarding-progress.json` |
| `onboardingCompletion` | Final-step confetti | `/onboarding-completion.json` |
| `mapSearchLoading` | Map search loading | `/map-load-search-load.json` |
| `swipeDeckEmpty` | Swipe queue empty state | `/swipe-deck-empty.json` |
| `levelUpBadge` | Shortlist empty encouragement | `/levelup:badge-unlocked.json` |
| `bookingSuccess` | Booking/hold success | `/booking-success.json` |
| `newMessage` | Inbox notification | `/new-message-notification.json` |
| `hostVerification` | Host badge animation | `/host-verifaction.json` |
| `uploadComplete` | Media upload | `/upload-complete.json` |
| `errorEmptyState` | Friendly error fallback | `/error:empty-state.json` |

Update `src/config/lottie.ts` if you add CDN URLs or new animations so components stay in sync.

### Map Data Checklist

- Ensure every listing record in Supabase includes `lat` and `lng` (decimal degrees). Without them, `ListingMap` shows the helper panel instead of markers.
- Use the Mapbox geocoder within onboarding or owner flows to prefill coordinates; hook into `onResult` to write to form state.
- When seeding data, prefer hospitals’ coordinates for more accurate commute calculations.

### CLI Helpers

- `supabase db push` — apply latest migrations (after `supabase link`).
- `npm run build` — compile production bundle; run before handoff.
- `npm run dev` — local SPA with swipe + map toggle and onboarding animations.

### Phase 2 Priorities (Suggested)

1. **Host tools** — align owner dashboards with the new design language, add booking pipeline cards, and expose pricing/availability editors.
2. **Messaging + holds** — wire Supabase conversations/holds tables into the UI, deliver mutual-match chat, and surface the 24h hold timer.
3. **Payments foundation** — integrate Stripe intent creation for the refundable hold fee and record transactions alongside bookings.
4. **Performance polish** — code-split heavy surfaces (swipe deck, maps, Lottie) and introduce image CDN or optimization pipeline.

---
