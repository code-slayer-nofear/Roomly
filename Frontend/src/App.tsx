import { Routes, Route } from "react-router-dom";
import { Layout, ProtectedRoute, RoleRoute, GuestRoute } from "./components/layout";
import { useMe } from "./hooks/useMe";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OAuthCallbackPage from "./pages/auth/OAuthCallbackPage";

// Public
import HomePage from "./pages/misc/HomePage";
import SearchPage from "./pages/listings/SearchPage";
import ListingDetailPage from "./pages/listings/ListingDetailPage";
import PublicProfilePage from "./pages/profile/PublicProfilePage";
import ProfilePage from "./pages/profile/ProfilePage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import MyBookingsPage from "./pages/bookings/MyBookingsPage";
import BookingDetailPage from "./pages/bookings/BookingDetailPage";
import PaymentPage from "./pages/bookings/PaymentPage";
import WishlistPage from "./pages/wishlist/WishlistPage";
import InboxPage from "./pages/messages/InboxPage";
import ConversationPage from "./pages/messages/ConversationPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import NotFoundPage from "./pages/misc/NotFoundPage";

function App() {
  // Validate session + hydrate user on app load
  useMe();

  return (
    <Routes>
      {/* OAuth callback — outside layout */}
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      {/* Guest-only routes (redirect to / if already logged in) */}
      <Route element={<GuestRoute />}>
        <Route element={<Layout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Public routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/listings" element={<SearchPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/users/:id" element={<PublicProfilePage />} />
      </Route>

      {/* Protected routes (auth required) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetailPage />} />
          <Route path="/bookings/:id/pay" element={<PaymentPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/inbox/:otherUserId/:listingId" element={<ConversationPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
        </Route>
      </Route>

      <Route element={<Layout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Host routes */}
      <Route element={<RoleRoute role="host" />}>
        <Route element={<Layout />}>
          {/* Step 11: HostDashboardPage, HostBookingsPage, CreateListingPage, EditListingPage */}
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<RoleRoute role="admin" />}>
        <Route element={<Layout />}>
          {/* Step 13: AdminUsersPage, AdminListingsPage, AdminAnalyticsPage */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
