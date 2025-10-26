import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "../App"

// wrappers (assumes you already have these)
import RequireAuth from "../components/auth/RequireAuth"
import NotFound from "../pages/system/NotFound"
import ErrorPage from "../pages/system/ErrorPage"
import AuthCallback from "../pages/auth/AuthCallback"

// core
import SwipePage from "../pages/SwipePage"
import ListingDetailPage from "../pages/listing/ListingDetailPage"
import ShortlistPage from "../pages/core/ShortlistPage"
import MatchesPage from "../pages/matches/MatchesPage"
import ChatThreadPage from "../pages/chat/ChatThreadPage"
import HoldPage from "../pages/hold/HoldPage"
import SearchPage from "../pages/search/SearchPage"
import OnboardingPage from "../pages/onboarding/OnboardingPage"
import ProfilePage from "../pages/profile/ProfilePage"

// trust/safety
import VerificationCenterPage from "../pages/verify/VerificationCenterPage"
import SafetyInfoPage from "../pages/safety/SafetyInfoPage"
import ReportIssuePage from "../pages/report/ReportIssuePage"

// owner
import OwnerListingsPage from "../pages/owner/OwnerListingsPage"
import OwnerNewListingPage from "../pages/owner/OwnerNewListingPage"
import OwnerEditListingPage from "../pages/owner/OwnerEditListingPage"
import OwnerInboxPage from "../pages/owner/OwnerInboxPage"
import OwnerVerifyPage from "../pages/owner/OwnerVerifyPage"

// admin
import AdminDashboardPage from "../pages/admin/AdminDashboardPage"
import VettingQueuePage from "../pages/admin/VettingQueuePage"
import FlagsPage from "../pages/admin/FlagsPage"
import MarketsPage from "../pages/admin/MarketsPage"

// settings/legal
import NotificationSettingsPage from "../pages/settings/NotificationSettingsPage"
import TermsPage from "../pages/legal/TermsPage"
import PrivacyPage from "../pages/legal/PrivacyPage"

const router = createBrowserRouter([
  { path: "/auth/callback", element: <AuthCallback /> },
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <SwipePage /> },
      { path: "listing/:id", element: <RequireAuth><ListingDetailPage /></RequireAuth> },
      { path: "shortlist", element: <RequireAuth><ShortlistPage /></RequireAuth> },
      { path: "matches", element: <RequireAuth><MatchesPage /></RequireAuth> },
      { path: "chat/:id", element: <RequireAuth><ChatThreadPage /></RequireAuth> },
      { path: "hold/:id", element: <RequireAuth><HoldPage /></RequireAuth> },
      { path: "search", element: <RequireAuth><SearchPage /></RequireAuth> },
      { path: "onboarding", element: <RequireAuth><OnboardingPage /></RequireAuth> },
      { path: "profile", element: <RequireAuth><ProfilePage /></RequireAuth> },

      // trust/safety
      { path: "verify", element: <RequireAuth><VerificationCenterPage /></RequireAuth> },
      { path: "safety", element: <RequireAuth><SafetyInfoPage /></RequireAuth> },
      { path: "report", element: <RequireAuth><ReportIssuePage /></RequireAuth> },

      // owner
      { path: "owner/listings", element: <RequireAuth><OwnerListingsPage /></RequireAuth> },
      { path: "owner/listings/new", element: <RequireAuth><OwnerNewListingPage /></RequireAuth> },
      { path: "owner/listings/:id/edit", element: <RequireAuth><OwnerEditListingPage /></RequireAuth> },
      { path: "owner/inbox", element: <RequireAuth><OwnerInboxPage /></RequireAuth> },
      { path: "owner/verify", element: <RequireAuth><OwnerVerifyPage /></RequireAuth> },

      // admin
      { path: "admin", element: <RequireAuth><AdminDashboardPage /></RequireAuth> },
      { path: "admin/vetting", element: <RequireAuth><VettingQueuePage /></RequireAuth> },
      { path: "admin/flags", element: <RequireAuth><FlagsPage /></RequireAuth> },
      { path: "admin/markets", element: <RequireAuth><MarketsPage /></RequireAuth> },

      // settings/legal
      { path: "settings/notifications", element: <RequireAuth><NotificationSettingsPage /></RequireAuth> },
      { path: "legal/terms", element: <TermsPage /> },
      { path: "legal/privacy", element: <PrivacyPage /> },

      // 404
      { path: "*", element: <NotFound /> }
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
