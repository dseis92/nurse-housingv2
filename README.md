# ShiftMatch Homes – Travel Nurse Housing Platform

Modern web application that blends Furnished Finder inventory, Tinder-style swiping, and Instagram-like profiles to help travel nurses match with vetted, furnished short-term rentals in minutes.

## Product Highlights
- **Swipe-first match queue**: Guardrail-filtered listings that clear stipend fit, commute limits, and safety thresholds before the nurse sees them.
- **Contract intake**: Hospital, shift, stipend, pets, and security requirements drive the scoring model.
- **Shortlist board & quick holds**: Compare 3–5 final picks side-by-side and launch a refundable 24-hour intent hold.
- **Owner operations**: Self-service listing creation, safety badges, and boost-ready analytics for property managers.
- **Admin oversight**: Metro inventory dashboards, verification tracking, and conversation monitoring for trust & safety.

## Tech Stack
- **Front-end**: Vite + React 18 + TypeScript + React Router 7
- **Styling**: Tailwind CSS v4 with custom utility tokens
- **State**: Zustand (persisted to localStorage)
- **Backend integration**: Supabase client bootstrap with graceful fallbacks to rich mock data
- **Animations & Icons**: Framer Motion (optional usage) and lucide-react

## Running the App
```bash
npm install
npm run dev       # starts Vite + Tailwind watcher
npm run build     # production build
npm run preview   # serve production build locally
```

## Directory Overview
```
src/
  App.tsx                         # Route map wired into AppLayout
  components/
    layout/                       # Sidebar, top nav, role switcher
    forms/                        # Contract intake & owner listing forms
    panels/                       # Dashboard panels, shortlist, chat, admin metrics
    swipe/                        # Swipe card + deck experience
    ErrorBoundary.tsx
  pages/                          # Nurse, owner, and admin route surfaces
  stores/useAppStore.ts           # Zustand store + Supabase hydration hook
  lib/                            # Supabase client, mock data, scoring model
  types/                          # Shared domain models
  styles/                         # Tailwind entry file and tokens
```

## Data Model & Matching
`src/types/index.ts` defines the core domain entities:
- **Nurses**: Travel profile + preference guardrails
- **Contracts**: Assignment stipend, timeline, pets, parking, commute limits
- **Listings**: Owner-provided housing inventory with safety features, media, scoring
- **Interactions**: Likes, matches, holds, conversations, verifications

`src/lib/scoring.ts` encapsulates the contract-to-listing scoring breakdown (stipend fit, commute guardrail, safety boosts, quality reputation). The swipe deck and dashboards consume these scores for consistent fit projection.

## Supabase Integration
- Configure environment variables in `.env.local`:
  ```
  VITE_SUPABASE_URL=<your-project-url>
  VITE_SUPABASE_ANON_KEY=<anon-key>
  ```
- The Zustand store exposes `actions.syncFromSupabase()` which pulls `listings`, `contracts`, and `matches` if Supabase is configured. Without credentials, the app uses the curated mock dataset (`src/lib/mockData.ts`).
- Recommended schema seeds (table names already referenced in code):
  - `users`, `nurse_profiles`, `owner_profiles`
  - `contracts`, `listings`, `matches`, `holds`, `conversations`
  - Apply Row-Level Security in Supabase to restrict writes to authenticated owners and nurses.

## Feature Walkthrough
- **Dashboard (`/`)**: Role-aware overview for nurses, owners, and admin ops.
- **Contract Intake (`/nurse/contract`)**: Guardrail form powering the scoring engine.
- **Swipe Queue (`/swipe`)**: Tinder-inspired deck with match / shortlist / pass actions.
- **Shortlist (`/shortlist`)**: Compare finalists before launching a quick hold.
- **Matches & Chat (`/matches`)**: Double opt-in conversations with secure logging.
- **Owner Portal (`/owner/*`)**: Portfolio metrics, listing management, and chat.
- **Admin Panel (`/admin/*`)**: Metro inventory health, contract roster, and safety monitoring.

## Extending the MVP
1. **Supabase CRUD** – Replace mock data with live queries in `syncFromSupabase` and wire mutations (`likeListing`, `createListing`) to Supabase RPC functions.
2. **Auth flows** – Introduce Supabase Auth (OAuth email magic links) and gate routes by role.
3. **PWA readiness** – Add web manifest + service worker for installable offline shell.
4. **Payments** – Integrate Stripe for converting holds into bookings with escrow handling.
5. **Mobile polish** – Layer in gesture-based swipe interactions with Framer Motion.

## Testing Checklist
- `npm run build` – ensures TypeScript and Tailwind compile without errors.
- Test role toggle (Nurse / Owner / Ops) in the top navigation to confirm contextual dashboards.
- Validate swipe actions: pass removes from queue, match opens chat, shortlist entry appears in board.
- Confirm fallback works without Supabase credentials (console warns but UI stays responsive).

---
Built as a launchpad for concierge-style pilots: start with curated supply, monitor engagement manually, and graduate to automated matching once the flows are validated. Use the mock data to run product walkthroughs and iterate quickly before hardening Supabase persistence.
