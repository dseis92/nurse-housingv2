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
  safetyBadges,
} from "../lib/mockData";
import { calculateMatchScore } from "../lib/scoring";
import { supabase } from "../lib/supabase";
import type {
  AvailabilityBlock,
  Conversation,
  Contract,
  Hold,
  Listing,
  Match,
  NurseProfile,
  OwnerProfile,
  SafetyBadge,
  User,
  UserRole,
  Verification,
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
    appendMessage: (conversationId: string, message: { senderId: string; body: string }) => void;
    refreshSwipeQueue: () => void;
    syncFromSupabase: () => Promise<void>;
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

            const breakdown = calculateMatchScore(contract, listing, nurseProfile.preferences);

            const newMatch: Match = {
              id: uuid(),
              listingId,
              nurseProfileId: nurseProfile.id,
              contractId: contract.id,
              status: "pending",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            const newHold: Hold = {
              id: uuid(),
              listingId,
              nurseProfileId: nurseProfile.id,
              contractId: contract.id,
              status: "active",
              expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
              intentFee: 100,
            };

            const newConversation: Conversation = {
              id: uuid(),
              matchId: newMatch.id,
              listingId,
              nurseProfileId: nurseProfile.id,
              ownerId: state.ownerProfiles[0]?.id ?? "owner_profile_1",
              createdAt: new Date().toISOString(),
              status: "open",
              messages: [
                {
                  id: uuid(),
                  conversationId: "temp",
                  senderId: state.currentUserId,
                  body: `Auto-generated intro. Match score ${Math.round(breakdown.total)}%.`,
                  createdAt: new Date().toISOString(),
                },
              ],
            };
            newConversation.messages = newConversation.messages.map((message) => ({
              ...message,
              conversationId: newConversation.id,
            }));

            return {
              matches: [...state.matches, newMatch],
              holds: [...state.holds, newHold],
              conversations: [...state.conversations, newConversation],
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
        appendMessage: (conversationId, message) =>
          set((state) => ({
            conversations: state.conversations.map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    messages: [
                      ...conversation.messages,
                      {
                        id: uuid(),
                        conversationId,
                        senderId: message.senderId,
                        body: message.body,
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  }
                : conversation
            ),
          })),
        refreshSwipeQueue: () =>
          set((state) => ({
            swipeQueue: state.listings.map((listing) => listing.id),
          })),
        syncFromSupabase: async () => {
          if (!supabase) return;
          const [listingsResponse, contractsResponse, matchesResponse] = await Promise.all([
            supabase.from("listings").select("*"),
            supabase.from("contracts").select("*"),
            supabase.from("matches").select("*"),
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
