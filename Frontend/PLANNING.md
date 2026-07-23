# Roomly Frontend — Planning

## Tech Stack

| Concern | Tool |
|---|---|
| Framework | React 19 + TypeScript (Vite) |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| Client state | Zustand (auth, UI) |
| HTTP | Axios (with auth interceptors + X-New-Token handling) |
| Real-time | Socket.io-client |
| Forms | React Hook Form + Zod |
| Payments | Stripe.js + @stripe/react-stripe-js |

---

## Folder Structure

```
src/
├── components/         # Reusable UI components
│   ├── layout/         # Navbar, Footer, Layout wrapper
│   ├── listings/       # ListingCard, ListingGrid, PhotoGallery, AmenityBadge
│   ├── bookings/       # BookingCard, PriceBreakdown, DateRangePicker
│   ├── reviews/        # ReviewCard, StarRating, ReviewForm
│   ├── messages/       # ConversationList, MessageBubble, MessageInput
│   ├── notifications/  # NotificationBell, NotificationItem
│   └── ui/             # Button, Input, Modal, Spinner, Avatar, Badge
├── pages/
│   ├── auth/           # LoginPage, RegisterPage, OAuthCallbackPage
│   ├── listings/       # SearchPage, ListingDetailPage
│   ├── bookings/       # BookingPage (checkout), PaymentPage, BookingDetailPage
│   ├── dashboard/      # GuestTripsPage, HostDashboardPage, HostBookingsPage
│   ├── host/           # CreateListingPage, EditListingPage
│   ├── messages/       # InboxPage, ConversationPage
│   ├── profile/        # ProfilePage, EditProfilePage, PublicProfilePage
│   ├── wishlist/       # WishlistPage
│   ├── reviews/        # ReviewFormPage
│   ├── admin/          # AdminUsersPage, AdminListingsPage, AdminAnalyticsPage
│   └── misc/           # HomePage, NotFoundPage
├── hooks/              # Custom React hooks (API calls via TanStack Query)
├── store/              # Zustand stores
├── lib/                # api.ts, socket.ts, queryClient.ts, stripe.ts
├── types/              # Shared TypeScript interfaces
└── utils/              # formatDate, formatCurrency, cn (classnames)
```

---

## Pages & Routes

### Public routes (no auth required)
| Path | Page | Description |
|---|---|---|
| `/` | `HomePage` | Hero, search bar, featured listings |
| `/search` | `SearchPage` | Listing grid with filters sidebar |
| `/listings/:id` | `ListingDetailPage` | Photos, amenities, host info, reviews, booking widget |
| `/users/:id` | `PublicProfilePage` | Host public profile + their listings |
| `/login` | `LoginPage` | Email/password + Google/Facebook OAuth buttons |
| `/register` | `RegisterPage` | Registration form |
| `/oauth/callback` | `OAuthCallbackPage` | Reads token from URL, stores it, redirects |

### Protected routes (auth required)
| Path | Page | Description |
|---|---|---|
| `/bookings/:id` | `BookingDetailPage` | Single booking detail + status |
| `/bookings/:id/pay` | `PaymentPage` | Stripe payment form |
| `/trips` | `GuestTripsPage` | Guest's upcoming + past bookings |
| `/wishlist` | `WishlistPage` | Saved listings |
| `/inbox` | `InboxPage` | Conversation list |
| `/inbox/:otherUserId/:listingId` | `ConversationPage` | Full chat thread |
| `/profile/edit` | `EditProfilePage` | Edit name, bio, avatar, phone |
| `/bookings/:id/review` | `ReviewFormPage` | Submit review after completed stay |

### Host routes (role: host or admin)
| Path | Page | Description |
|---|---|---|
| `/host/dashboard` | `HostDashboardPage` | Overview: earnings, upcoming bookings |
| `/host/bookings` | `HostBookingsPage` | All incoming bookings |
| `/host/listings/new` | `CreateListingPage` | Multi-step listing creation form |
| `/host/listings/:id/edit` | `EditListingPage` | Edit existing listing |

### Admin routes (role: admin)
| Path | Page | Description |
|---|---|---|
| `/admin/users` | `AdminUsersPage` | User list + suspend/unsuspend |
| `/admin/listings` | `AdminListingsPage` | Listing list + approve/suspend |
| `/admin/analytics` | `AdminAnalyticsPage` | GMV chart, bookings/day chart |

---

## Custom Hooks (TanStack Query)

Each hook wraps an API call and returns `{ data, isLoading, error }`.

### Auth
- `useMe()` — `GET /api/users/me`

### Listings
- `useListings(filters)` — `GET /api/listings`
- `useListing(id)` — `GET /api/listings/:id`

### Bookings
- `useMyBookings()` — `GET /api/bookings/my`
- `useHostBookings()` — `GET /api/bookings/host`
- `useBooking(id)` — `GET /api/bookings/:id`
- `useCreateBooking()` — `POST /api/bookings` (mutation)
- `useInitiatePayment(id)` — `POST /api/bookings/:id/pay` (mutation)
- `useCancelBooking(id)` — `PATCH /api/bookings/:id/cancel` (mutation)

### Reviews
- `useListingReviews(listingId)` — `GET /api/reviews/listing/:listingId`
- `useCreateReview()` — `POST /api/reviews` (mutation)

### Messages
- `useInbox()` — `GET /api/messages/inbox`
- `useConversation(otherUserId, listingId)` — `GET /api/messages/:otherUserId/:listingId`
- `useSendMessage()` — `POST /api/messages` (mutation)

### Notifications
- `useNotifications()` — `GET /api/notifications`
- `useUnreadCount()` — `GET /api/notifications/unread-count`
- `useMarkAllRead()` — `PATCH /api/notifications/read-all` (mutation)

### Users
- `useUserProfile(id)` — `GET /api/users/:id`
- `useUpdateProfile()` — `PATCH /api/users/me` (mutation)
- `useWishlist()` — `GET /api/users/wishlist`
- `useToggleWishlist()` — `POST /api/users/wishlist/:listingId` (mutation)

### Admin
- `useAdminUsers(page)` — `GET /api/admin/users`
- `useAdminListings(page)` — `GET /api/admin/listings`
- `useAnalytics()` — `GET /api/admin/analytics`

---

## Zustand Stores

### `authStore` (already created)
- `token`, `user`, `setAuth`, `setToken`, `logout`

### `uiStore`
- `searchFilters` — city, dates, guests, price range, amenities
- `setSearchFilters`, `resetFilters`

---

## Key Implementation Notes

### Auth flow
- On app load, if `token` exists in store → call `GET /api/users/me` to validate session and hydrate user
- On `401` response → `authStore.logout()` (handled in axios interceptor)
- OAuth callback page reads `?token=` from URL, calls `setAuth`, strips URL param, redirects to `/`

### Payment flow
1. User picks dates on listing detail page → `POST /api/bookings` → get `bookingId`
2. Redirect to `/bookings/:id/pay`
3. Call `POST /api/bookings/:id/pay` → get `clientSecret`
4. Render Stripe `<PaymentElement>` with `clientSecret`
5. On success → redirect to `/bookings/:id` (booking detail shows confirmed status)

### Real-time
- Socket connects in `setAuth`, disconnects in `logout`
- Listen for `notification` event globally (in a top-level hook) → invalidate `useUnreadCount` query
- Listen for `new_message` event in `ConversationPage` → append message to local query cache

### Route protection
- `<ProtectedRoute>` wrapper — redirects to `/login` if no token
- `<RoleRoute role="host">` wrapper — redirects to `/` if user doesn't have the role
- `<RoleRoute role="admin">` wrapper — for admin pages

### Multi-step listing form (CreateListingPage)
Steps:
1. Basics — title, property type, room type, max guests
2. Location — address, city, country, map pin (geo coordinates)
3. Details — bedrooms, beds, bathrooms, amenities
4. Photos — upload up to 10 images
5. Pricing — price per night, currency, cancellation policy
6. Rules — house rules, review & publish

---

## Build Order

1. **Shared UI components** — Button, Input, Spinner, Modal, Avatar (`src/components/ui/`)
2. **Layout** — Navbar (with auth state, notification bell), Footer, Layout wrapper
3. **Auth pages** — Login, Register, OAuthCallback + `ProtectedRoute` / `RoleRoute`
4. **Home + Search** — HomePage hero, SearchPage with filters + ListingCard grid
5. **Listing detail** — Photos, amenities, host info, reviews section, booking widget
6. **Booking flow** — BookingPage (date/guest selection) → PaymentPage (Stripe) → BookingDetailPage
7. **Guest dashboard** — GuestTripsPage, WishlistPage
8. **Messaging** — InboxPage, ConversationPage (with Socket.io real-time)
9. **Notifications** — NotificationBell dropdown + real-time updates
10. **Reviews** — ReviewFormPage (post-stay)
11. **Host dashboard** — HostDashboardPage, HostBookingsPage, CreateListingPage (multi-step), EditListingPage
12. **Profile** — EditProfilePage, PublicProfilePage
13. **Admin panel** — AdminUsersPage, AdminListingsPage, AdminAnalyticsPage
