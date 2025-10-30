import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import {
  mockAvailability,
  mockContracts,
  mockConversations,
  mockHolds,
  mockListings,
  mockMatches,
  mockNurseProfiles,
  mockOwnerProfiles,
  mockUsers,
  mockVerifications,
  mockReviews,
  safetyBadges,
} from "../lib/mockData";
import { calculateMatchScore } from "../lib/scoring";
import { requestHoldIntent } from "../actions/holdActions";
import { sendConversationMessage } from "../actions/conversationActions";
import { ensureSupabase } from "../lib/supabaseClient";
import type {
  AvailabilityBlock,
  Conversation,
  Contract,
  Hold,
  Listing,
  Match,
  NurseProfile,
  OwnerProfile,
  Review,
  SafetyBadge,
  User,
  UserRole,
  Verification,
  Message,
} from "../types";

export interface ShortlistEntry {
  id: string;
  listingId: string;
  addedAt: string;
  notes?: string;
}

export interface AppState {
  currentUserId: string;
  currentRole: UserRole;
  activeContractId?: string;
  activeListingId?: string;
  users: User[];
  nurseProfiles: NurseProfile[];
  ownerProfiles: OwnerProfile[];
  contracts: Contract[];
  listings: Listing[];
  matches: Match[];
  holds: Hold[];
  availability: AvailabilityBlock[];
  conversations: Conversation[];
  verifications: Verification[];
  reviews: Review[];
  shortlist: ShortlistEntry[];
  swipeQueue: string[];
  safetyBadges: SafetyBadge[];
  onboarding: {
    completed: boolean;
    nurseProfileId?: string;
    answers: Record<string, unknown>;
  };
  actions: {
    setRole: (role: UserRole) => void;
    completeOnboarding: (payload: { nurseProfileId: string; answers: Record<string, unknown> }) => void;
    resetOnboarding: () => void;
    setActiveContract: (contractId: string) => void;
    likeListing: (listingId: string) => void;
    passListing: (listingId: string) => void;
    addToShortlist: (listingId: string, notes?: string) => void;
    removeFromShortlist: (shortlistId: string) => void;
    updateContract: (contract: Contract) => void;
    createListing: (listing: Listing) => void;
    updateListing: (listingId: string, data: Partial<Listing>) => void;
    setActiveListing: (listingId?: string) => void;
    appendMessage: (conversationId: string, message: { senderId: string; body: string }) => Promise<void>;
    requestHold: (listingId: string, options?: { amountCents?: number; startDate?: string; endDate?: string }) => Promise<{
      holdId?: string;
      clientSecret?: string;
    } | null>;
    refreshSwipeQueue: () => void;
    syncFromSupabase: () => Promise<void>;
    fetchReviewsForListing: (listingId: string) => Promise<void>;
    fetchAvailabilityForListing: (listingId: string) => Promise<void>;
    submitReview: (input: { listingId: string; rating: number; body: string; tags?: string[] }) => Promise<void>;
  };
}

const defaultContractId = mockContracts[0]?.id;
const defaultSwipeQueue = mockListings.map((listing) => listing.id);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: mockUsers[0].id,
      currentRole: mockUsers[0].role,
      activeContractId: defaultContractId,
      activeListingId: undefined,
      users: mockUsers,
      nurseProfiles: mockNurseProfiles,
      ownerProfiles: mockOwnerProfiles,
      contracts: mockContracts,
      listings: mockListings,
      matches: mockMatches,
      holds: mockHolds,
      availability: mockAvailability,
      conversations: mockConversations,
      verifications: mockVerifications,
      reviews: mockReviews,
      shortlist: [],
      swipeQueue: defaultSwipeQueue,
      safetyBadges,
      onboarding: { completed: Boolean(mockContracts.length), nurseProfileId: mockContracts[0]?.nurseProfileId, answers: {} },
      actions: {
        setRole: (role) =>
          set((state) => {
            const userForRole = state.users.find((user) => user.role === role) ?? state.users[0];
            return {
              currentRole: role,
              currentUserId: userForRole.id,
            };
          }),
        setActiveContract: (contractId) => set(() => ({ activeContractId: contractId })),
        completeOnboarding: ({ nurseProfileId, answers }) =>
          set((state) => ({
            onboarding: { completed: true, nurseProfileId, answers },
          })),
        resetOnboarding: () => set(() => ({ onboarding: { completed: false, answers: {} } })),
        likeListing: (listingId) =>
          set((state) => {
            const contract = state.contracts.find((c) => c.id === state.activeContractId);
            if (!contract) return state;

            const listing = state.listings.find((item) => item.id === listingId);
            if (!listing) return state;

            const nurseProfile = state.nurseProfiles.find((profile) => profile.id === contract.nurseProfileId);
            if (!nurseProfile) return state;

            const existingMatch = state.matches.find(
              (match) => match.listingId === listingId && match.nurseProfileId === nurseProfile.id
            );

            const breakdown = calculateMatchScore(contract, listing, nurseProfile.preferences);

            const match: Match =
              existingMatch ??
              {
                id: uuid(),
                listingId,
                nurseProfileId: nurseProfile.id,
                contractId: contract.id,
                status: "pending",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

            const existingConversation = state.conversations.find((conversation) => conversation.matchId === match.id);

            let conversations = state.conversations;
            if (!existingConversation) {
              const conversationId = uuid();
              const newConversation: Conversation = {
                id: conversationId,
                matchId: match.id,
                listingId,
                nurseProfileId: nurseProfile.id,
                ownerId:
                  state.ownerProfiles.find((owner) => owner.userId === listing.ownerId)?.id ??
                  state.ownerProfiles[0]?.id ??
                  "owner_profile_1",
                createdAt: new Date().toISOString(),
                status: "open",
                messages: [
                  {
                    id: uuid(),
                    conversationId,
                    senderId: state.currentUserId,
                    body: `Match created. Fit score ${Math.round(breakdown.total)}%.`,
                    createdAt: new Date().toISOString(),
                  },
                ],
              };
              conversations = [...state.conversations, newConversation];
            }

            return {
              matches: existingMatch ? state.matches : [...state.matches, match],
              conversations,
              swipeQueue: state.swipeQueue.filter((item) => item !== listingId),
            };
          }),
        passListing: (listingId) =>
          set((state) => ({
            swipeQueue: state.swipeQueue.filter((id) => id !== listingId),
          })),
        addToShortlist: (listingId, notes) =>
          set((state) => ({
            shortlist: [
              ...state.shortlist.filter((entry) => entry.listingId !== listingId),
              {
                id: uuid(),
                listingId,
                addedAt: new Date().toISOString(),
                notes,
              },
            ],
          })),
        removeFromShortlist: (shortlistId) =>
          set((state) => ({
            shortlist: state.shortlist.filter((entry) => entry.id !== shortlistId),
          })),
        updateContract: (contract) =>
          set((state) => ({
            contracts: state.contracts.map((existing) => (existing.id === contract.id ? contract : existing)),
            activeContractId: contract.id,
          })),
        createListing: (listing) =>
          set((state) => ({
            listings: [...state.listings, listing],
            swipeQueue: [...state.swipeQueue, listing.id],
          })),
        updateListing: (listingId, data) =>
          set((state) => ({
            listings: state.listings.map((listing) => (listing.id === listingId ? { ...listing, ...data } : listing)),
          })),
        setActiveListing: (listingId) => set(() => ({ activeListingId: listingId })),
        appendMessage: async (conversationId, message) => {
          const createdAt = new Date().toISOString();
          let persistedMessage: Message = {
            id: uuid(),
            conversationId,
            senderId: message.senderId,
            body: message.body,
            createdAt,
            readAt: undefined,
          };

          try {
            const result = await sendConversationMessage(conversationId, message.body);
            if (result) {
              persistedMessage = {
                id: result.id ?? persistedMessage.id,
                conversationId: result.conversation_id ?? conversationId,
                senderId: result.sender_id ?? message.senderId,
                body: result.body ?? message.body,
                createdAt: result.created_at ?? createdAt,
                readAt: result.read_at ?? undefined,
              };
            }
          } catch (error) {
            console.warn("[conversations] appendMessage fallback", error);
          }

          set((state) => ({
            conversations: state.conversations.map((conversation) =>
              conversation.id === conversationId
                ? { ...conversation, messages: [...conversation.messages, persistedMessage] }
                : conversation
            ),
          }));
        },
        requestHold: async (listingId, options) => {
          const state = get();
          const contract = state.contracts.find((c) => c.id === state.activeContractId);
          if (!contract) return null;

          const listing = state.listings.find((item) => item.id === listingId);
          const nurseProfile = state.nurseProfiles.find((profile) => profile.id === contract.nurseProfileId);
          if (!listing || !nurseProfile) return null;

          let matchRecord =
            state.matches.find(
              (candidate) => candidate.listingId === listingId && candidate.nurseProfileId === nurseProfile.id
            ) ?? null;

          if (!matchRecord) {
            matchRecord = {
              id: uuid(),
              listingId,
              nurseProfileId: nurseProfile.id,
              contractId: contract.id,
              status: "pending",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            const createdMatch = matchRecord;
            set((current) => ({ matches: [...current.matches, createdMatch] }));
          }

          const resolvedMatch = matchRecord as Match;

          const amountCents = options?.amountCents ?? 10_000;
          let holdId: string | undefined;
          let clientSecret: string | undefined;

          try {
            const intent = await requestHoldIntent(resolvedMatch.id, amountCents, {
              startDate: options?.startDate,
              endDate: options?.endDate,
            });
            holdId = intent.holdId;
            clientSecret = intent.client_secret;
          } catch (error) {
            console.warn("[holds] requestHoldIntent failed", error);
          }

          const newHold: Hold = {
            id: holdId ?? uuid(),
            listingId,
            nurseProfileId: nurseProfile.id,
            contractId: contract.id,
            status: "pending",
            expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
            intentFee: amountCents / 100,
            startDate: options?.startDate ?? null,
            endDate: options?.endDate ?? null,
          };

          set((current) => {
            const existingConversation = current.conversations.find(
              (conversation) => conversation.matchId === resolvedMatch.id
            );
            let conversations = current.conversations;
            if (!existingConversation) {
              const conversationId = uuid();
              conversations = [
                ...current.conversations,
                {
                  id: conversationId,
                  matchId: resolvedMatch.id,
                  listingId,
                  nurseProfileId: nurseProfile.id,
                  ownerId:
                    current.ownerProfiles.find((owner) => owner.userId === listing.ownerId)?.id ??
                    current.ownerProfiles[0]?.id ??
                    "owner_profile_1",
                  createdAt: new Date().toISOString(),
                  status: "open",
                  messages: [
                    {
                      id: uuid(),
                      conversationId,
                      senderId: current.currentUserId,
                      body: "Soft hold requested.",
                      createdAt: new Date().toISOString(),
                    },
                  ],
                },
              ];
            }

            return {
              holds: [...current.holds.filter((hold) => hold.listingId !== listingId), newHold],
              conversations,
            };
          });

          return { holdId: newHold.id, clientSecret };
        },
        refreshSwipeQueue: () =>
          set((state) => ({
            swipeQueue: state.listings.map((listing) => listing.id),
          })),
        syncFromSupabase: async () => {
          const client = await ensureSupabase();
          if (!client) return;
          const [listingsResponse, contractsResponse, matchesResponse] = await Promise.all([
            client.from("listings").select("*"),
            client.from("contracts").select("*"),
            client.from("matches").select("*"),
          ]);

          if (listingsResponse.error) console.warn("[supabase] listings fetch failed", listingsResponse.error);
          if (contractsResponse.error) console.warn("[supabase] contracts fetch failed", contractsResponse.error);
          if (matchesResponse.error) console.warn("[supabase] matches fetch failed", matchesResponse.error);

          set((state) => ({
            listings: (listingsResponse.data as Listing[] | null) ?? state.listings,
            contracts: (contractsResponse.data as Contract[] | null) ?? state.contracts,
            matches: (matchesResponse.data as Match[] | null) ?? state.matches,
          }));
        },
        fetchReviewsForListing: async (listingId) => {
          const supabase = await ensureSupabase();
          if (!supabase) return;
          const { data, error } = await supabase
            .from("listing_reviews")
            .select("id, listing_id, reviewer_name, reviewer_role, rating, body, created_at, stay_type, sentiment_tags")
            .eq("listing_id", listingId)
            .order("created_at", { ascending: false });
          if (error || !data) {
            if (error) console.warn("[supabase] reviews fetch failed", error);
            return;
          }
          set((state) => ({
            reviews: [
              ...state.reviews.filter((review) => review.listingId !== listingId),
              ...data.map((row) => ({
                id: row.id ?? uuid(),
                listingId: row.listing_id ?? listingId,
                reviewerName: row.reviewer_name ?? "Traveler",
                reviewerRole: row.reviewer_role ?? undefined,
                rating: Number(row.rating) || 4.7,
                body: row.body ?? "",
                createdAt: row.created_at ?? new Date().toISOString(),
                stayType: row.stay_type ?? undefined,
                sentimentTags:
                  Array.isArray(row.sentiment_tags) && row.sentiment_tags.length
                    ? row.sentiment_tags.filter((tag): tag is string => typeof tag === "string")
                    : undefined,
              })),
            ],
          }));
        },
        fetchAvailabilityForListing: async (listingId) => {
          const supabase = await ensureSupabase();
          if (!supabase) return;
          const { data, error } = await supabase
            .from("availability_blocks")
            .select("id, listing_id, start_date, end_date, status")
            .eq("listing_id", listingId);
          if (error || !data) {
            if (error) console.warn("[supabase] availability fetch failed", error);
            return;
          }
          set((state) => ({
            availability: [
              ...state.availability.filter((block) => block.listingId !== listingId),
              ...data.map((row) => ({
                id: row.id ?? uuid(),
                listingId: row.listing_id ?? listingId,
                startDate: row.start_date ?? new Date().toISOString(),
                endDate: row.end_date ?? new Date().toISOString(),
                status: row.status ?? "available",
              })),
            ],
          }));
        },
        submitReview: async ({ listingId, rating, body, tags }) => {
          const supabase = await ensureSupabase();
          const reviewer = get().users.find((user) => user.id === get().currentUserId);
          const payload = {
            listing_id: listingId,
            rating,
            body,
            reviewer_name: reviewer?.fullName ?? "Traveler",
            reviewer_role: get().currentRole === "nurse" ? "Travel nurse" : undefined,
            sentiment_tags: tags ?? null,
          };
          if (supabase) {
            const { error } = await supabase.from("listing_reviews").insert(payload);
            if (error) {
              console.warn("[supabase] submit review failed", error);
            } else {
              await get().actions.fetchReviewsForListing(listingId);
              return;
            }
          }
          const review: Review = {
            id: uuid(),
            listingId,
            rating,
            body,
            reviewerName: payload.reviewer_name,
            reviewerRole: payload.reviewer_role,
            createdAt: new Date().toISOString(),
            stayType: "assignment",
            sentimentTags: tags ?? [],
          };
          set((state) => ({ reviews: [review, ...state.reviews] }));
        },
      },
    }),
    {
      name: "nurse-housing-app",
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        currentRole: state.currentRole,
        activeContractId: state.activeContractId,
        shortlist: state.shortlist,
        matches: state.matches,
        holds: state.holds,
        conversations: state.conversations,
        onboarding: state.onboarding,
        reviews: state.reviews,
        availability: state.availability,
      }),
    }
  )
);

export const selectActiveContract = (state: AppState) =>
  state.contracts.find((contract) => contract.id === state.activeContractId);

export const selectCurrentNurseProfile = (state: AppState) => {
  const contract = selectActiveContract(state);
  if (!contract) return undefined;
  return state.nurseProfiles.find((profile) => profile.id === contract.nurseProfileId);
};

export const selectSwipeListings = (state: AppState) =>
  state.swipeQueue
    .map((listingId) => state.listings.find((listing) => listing.id === listingId))
    .filter((listing): listing is Listing => Boolean(listing));

export const selectListingById = (listingId: string) => (state: AppState) =>
  state.listings.find((listing) => listing.id === listingId);
