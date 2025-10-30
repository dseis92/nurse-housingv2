import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import RequireAuth from "./components/auth/RequireAuth";
import RequireOnboarded from "./components/auth/RequireOnboarded";

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const AuthCallback = lazy(() => import("./pages/auth/AuthCallback"));
const OnboardingPage = lazy(() => import("./pages/onboarding/OnboardingPage"));

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const SwipePage = lazy(() => import("./pages/SwipePage"));
const ShortlistPage = lazy(() => import("./pages/ShortlistPage"));
const MatchesPage = lazy(() => import("./pages/MatchesPage"));
const ListingDetailPage = lazy(() => import("./pages/ListingDetailPage"));
const ContractIntakePage = lazy(() => import("./pages/ContractIntakePage"));
const OwnerHubPage = lazy(() => import("./pages/OwnerHubPage"));
const OwnerListingsPage = lazy(() => import("./pages/OwnerListingsPage"));
const OwnerCreateListingPage = lazy(() => import("./pages/OwnerCreateListingPage"));
const OwnerMessagesPage = lazy(() => import("./pages/OwnerMessagesPage"));
const AdminPanelPage = lazy(() => import("./pages/AdminPanelPage"));
const AdminListingsPage = lazy(() => import("./pages/AdminListingsPage"));
const AdminContractsPage = lazy(() => import("./pages/AdminContractsPage"));
const AdminMessagesPage = lazy(() => import("./pages/AdminMessagesPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));

function AppFrame() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route
            path="/onboarding"
            element={
              <RequireAuth>
                <OnboardingPage />
              </RequireAuth>
            }
          />

          <Route
            element={
              <RequireAuth>
                <RequireOnboarded>
                  <AppFrame />
                </RequireOnboarded>
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="swipe" element={<SwipePage />} />
            <Route path="shortlist" element={<ShortlistPage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="listing/:listingId" element={<ListingDetailPage />} />
            <Route path="nurse/contract" element={<ContractIntakePage />} />
            <Route path="profile" element={<ProfilePage />} />

            <Route path="owner" element={<OwnerHubPage />} />
            <Route path="owner/listings" element={<OwnerListingsPage />} />
            <Route path="owner/new" element={<OwnerCreateListingPage />} />
            <Route path="owner/messages" element={<OwnerMessagesPage />} />

            <Route path="admin" element={<AdminPanelPage />} />
            <Route path="admin/listings" element={<AdminListingsPage />} />
            <Route path="admin/contracts" element={<AdminContractsPage />} />
            <Route path="admin/messages" element={<AdminMessagesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
