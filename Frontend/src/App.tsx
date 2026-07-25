import { Routes, Route } from "react-router-dom";
import { Layout, ProtectedRoute, RoleRoute, GuestRoute } from "./components/layout";
import { useMe } from "./hooks/useMe";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OAuthCallbackPage from "./pages/auth/OAuthCallbackPage";

// Public
import HomePage from "./pages/misc/HomePage";
import BecomeHostPage from "./pages/misc/BecomeHostPage";
import SearchPage from "./pages/listings/SearchPage";
import ListingDetailPage from "./pages/listings/ListingDetailPage";
import PublicProfilePage from "./pages/profile/PublicProfilePage";

// Profile / user
import ProfilePage from "./pages/profile/ProfilePage";
import EditProfilePage from "./pages/profile/EditProfilePage";

// Bookings
import MyBookingsPage from "./pages/bookings/MyBookingsPage";
import BookingDetailPage from "./pages/bookings/BookingDetailPage";
import PaymentPage from "./pages/bookings/PaymentPage";
import ReviewFormPage from "./pages/reviews/ReviewFormPage";

// Messages
import WishlistPage from "./pages/wishlist/WishlistPage";
import InboxPage from "./pages/messages/InboxPage";
import ConversationPage from "./pages/messages/ConversationPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import NotFoundPage from "./pages/misc/NotFoundPage";

// Host
import HostDashboardPage from "./pages/host/HostDashboardPage";
import HostBookingsPage from "./pages/host/HostBookingsPage";
import CreateListingPage from "./pages/host/CreateListingPage";
import EditListingPage from "./pages/host/EditListingPage";

// Admin
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminListingsPage from "./pages/admin/AdminListingsPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";

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
        <Route path="/become-host" element={<BecomeHostPage />} />
      </Route>

      {/* Protected routes (auth required) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetailPage />} />
          <Route path="/bookings/:id/pay" element={<PaymentPage />} />
          <Route path="/bookings/:id/review" element={<ReviewFormPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/inbox/:otherUserId/:listingId" element={<ConversationPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
        </Route>
      </Route>

      {/* Host routes */}
      <Route element={<RoleRoute role="host" />}>
        <Route element={<Layout />}>
          <Route path="/host" element={<HostDashboardPage />} />
          <Route path="/host/dashboard" element={<HostDashboardPage />} />
          <Route path="/host/bookings" element={<HostBookingsPage />} />
          <Route path="/host/listings/new" element={<CreateListingPage />} />
          <Route path="/host/listings/:id/edit" element={<EditListingPage />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<RoleRoute role="admin" />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminUsersPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/listings" element={<AdminListingsPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Route>
      </Route>

      <Route element={<Layout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
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
