import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ContractIntakePage from "./pages/ContractIntakePage";
import SwipePage from "./pages/SwipePage";
import ShortlistPage from "./pages/ShortlistPage";
import MatchesPage from "./pages/MatchesPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import OwnerHubPage from "./pages/OwnerHubPage";
import OwnerListingsPage from "./pages/OwnerListingsPage";
import OwnerCreateListingPage from "./pages/OwnerCreateListingPage";
import OwnerMessagesPage from "./pages/OwnerMessagesPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import AdminListingsPage from "./pages/AdminListingsPage";
import AdminContractsPage from "./pages/AdminContractsPage";
import AdminMessagesPage from "./pages/AdminMessagesPage";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/nurse/contract" element={<ContractIntakePage />} />
        <Route path="/swipe" element={<SwipePage />} />
        <Route path="/shortlist" element={<ShortlistPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/listing/:listingId" element={<ListingDetailPage />} />
        <Route path="/owner" element={<OwnerHubPage />} />
        <Route path="/owner/listings" element={<OwnerListingsPage />} />
        <Route path="/owner/new" element={<OwnerCreateListingPage />} />
        <Route path="/owner/messages" element={<OwnerMessagesPage />} />
        <Route path="/admin" element={<AdminPanelPage />} />
        <Route path="/admin/listings" element={<AdminListingsPage />} />
        <Route path="/admin/contracts" element={<AdminContractsPage />} />
        <Route path="/admin/messages" element={<AdminMessagesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
