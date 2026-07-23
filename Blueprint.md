# StayNest — Project Blueprint
*(An Airbnb-style rental marketplace — MERN stack)*

---

## 1. Name Suggestions

| Name | Why it works |
|---|---|
| **StayNest** | Warm, cozy connotation, easy to brand, .com-friendly |
| **Roomly** | Short, modern, easy to say |
| **Wanderstay** | Travel + accommodation feel |
| **Havenly** | Suggests comfort/safety, premium feel |
| **NestAway** | Playful nod to the category without copying the brand |

I'll use **StayNest** through the rest of this doc — swap it for whichever you like.

---

## 2. Business Model

### Value Proposition
- **Guests:** Find unique, verified stays cheaper than hotels, book instantly, pay securely.
- **Hosts:** Monetize spare property/rooms with low friction, built-in trust & payment tools.

### Revenue Streams
1. **Host service fee** — 3–5% of booking subtotal, charged to the host.
2. **Guest service fee** — 8–14% added on top of listing price at checkout (industry standard split).
3. **Featured/Boosted listings** — hosts pay to rank higher in search.
4. **Cancellation/change fees** — a cut of any late-cancellation penalty.
5. (Later) **Experiences/Add-ons** — tours, cleaning services, insurance upsells.

### Key Stakeholders
- **Guests** — search, book, pay, review.
- **Hosts** — list properties, manage calendar/pricing, get paid out.
- **Admin/Platform** — moderates listings, handles disputes, takes cut.

### Trust & Safety Mechanics (critical for this business model to work)
- ID verification for hosts (and optionally guests).
- Two-way review system (guest reviews host, host reviews guest).
- Secure escrow-style payments (charge guest at booking, payout host ~24h after check-in).
- Dispute/resolution center + cancellation policy tiers (Flexible / Moderate / Strict).

### Go-to-Market (MVP-first)
Start in **one city/niche** (e.g., one region, or a niche like "cabins" or "long-term stays") to solve the classic two-sided marketplace cold-start problem — get supply (hosts) first, even manually onboarded, before opening broadly.

---

## 3. MongoDB Database Design

Using Mongoose-style schemas (embedding where data is read together often, referencing where it's large/independent).

### `users`
```js
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,          // or omit if using OAuth
  authProvider: String,          // "local" | "google" | "facebook"
  avatarUrl: String,
  phone: String,
  role: { type: [String], default: ["guest"] }, // ["guest","host","admin"]
  isVerified: Boolean,
  bio: String,
  address: {
    country: String, city: String
  },
  wishlists: [ObjectId],         // ref -> listings
  payoutInfo: {                  // only relevant if role includes "host"
    method: String, accountId: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### `listings`
```js
{
  _id: ObjectId,
  hostId: ObjectId,              // ref -> users
  title: String,
  description: String,
  propertyType: String,          // "apartment" | "house" | "cabin" | ...
  roomType: String,               // "entire_place" | "private_room" | "shared_room"
  location: {
    address: String, city: String, country: String,
    geo: { type: "Point", coordinates: [lng, lat] } // geospatial index
  },
  pricePerNight: Number,
  currency: String,
  maxGuests: Number,
  bedrooms: Number,
  beds: Number,
  bathrooms: Number,
  amenities: [String],           // ["wifi","pool","kitchen",...]
  photos: [String],               // URLs (S3/Cloudinary)
  houseRules: [String],
  cancellationPolicy: String,     // "flexible" | "moderate" | "strict"
  availability: [                 // or manage via separate "calendar" collection
    { date: Date, isBlocked: Boolean, priceOverride: Number }
  ],
  avgRating: Number,
  reviewCount: Number,
  status: String,                 // "draft" | "published" | "suspended"
  createdAt: Date,
  updatedAt: Date
}
```
> Index `location.geo` as a `2dsphere` index for "search near me" queries.

### `bookings`
```js
{
  _id: ObjectId,
  listingId: ObjectId,           // ref -> listings
  guestId: ObjectId,             // ref -> users
  hostId: ObjectId,              // ref -> users (denormalized for fast lookup)
  checkIn: Date,
  checkOut: Date,
  guests: { adults: Number, children: Number, infants: Number },
  nights: Number,
  priceBreakdown: {
    subtotal: Number, guestServiceFee: Number, hostServiceFee: Number,
    cleaningFee: Number, taxes: Number, total: Number
  },
  status: String,                // "pending" | "confirmed" | "cancelled" | "completed"
  paymentStatus: String,         // "unpaid" | "paid" | "refunded"
  paymentIntentId: String,       // Stripe reference
  cancelledBy: String,
  createdAt: Date
}
```

### `reviews`
```js
{
  _id: ObjectId,
  bookingId: ObjectId,           // ref -> bookings (one review per booking)
  listingId: ObjectId,
  authorId: ObjectId,            // reviewer
  targetId: ObjectId,            // who's being reviewed (host or guest)
  type: String,                  // "guest_to_host" | "host_to_guest"
  rating: { type: Number, min: 1, max: 5 },
  categories: {                  // Airbnb-style sub-ratings
    cleanliness: Number, communication: Number,
    checkIn: Number, accuracy: Number, location: Number, value: Number
  },
  comment: String,
  createdAt: Date
}
```

### `messages` (guest ↔ host chat)
```js
{
  _id: ObjectId,
  conversationId: ObjectId,      // groups messages between two users re: a listing
  senderId: ObjectId,
  receiverId: ObjectId,
  listingId: ObjectId,
  text: String,
  readAt: Date,
  createdAt: Date
}
```

### `payments` (ledger — separate from bookings for auditability)
```js
{
  _id: ObjectId,
  bookingId: ObjectId,
  amount: Number,
  currency: String,
  type: String,                  // "charge" | "payout" | "refund"
  status: String,                // "pending" | "succeeded" | "failed"
  provider: String,               // "stripe"
  providerRef: String,
  createdAt: Date
}
```

### `notifications`
```js
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,                  // "booking_confirmed" | "message" | "review_reminder"
  payload: Object,
  isRead: Boolean,
  createdAt: Date
}
```

### Suggested Indexes
- `users.email` — unique
- `listings.location.geo` — `2dsphere`
- `listings.city + status` — compound, for search
- `bookings.listingId + checkIn + checkOut` — for availability checks
- `reviews.listingId` — for fetching listing reviews fast

---

## 4. Required Features (MVP Scope)

### Guest-facing
- Search with filters (location, dates, price, guests, amenities) + map view
- Listing detail page (photos, amenities, reviews, host info, availability calendar)
- Booking flow with date picker → price breakdown → payment
- Guest dashboard: upcoming/past trips, cancel/modify booking
- Messaging with host
- Leave reviews after stay
- Wishlist / save listings

### Host-facing
- "Become a host" onboarding + ID/property verification
- Create/edit listing (multi-step form: basics → photos → amenities → pricing → rules)
- Calendar management (block dates, set custom pricing per date)
- Booking requests inbox (accept/reject if not instant-book)
- Payout dashboard + earnings history
- Respond to reviews / message guests

### Admin
- Approve/suspend listings and users
- Dispute resolution panel
- Analytics: GMV, active listings, bookings/day
- Content moderation (photos, reviews)

### Platform-wide / Non-functional
- **Auth:** JWT + refresh tokens, or OAuth (Google/Facebook) via Passport.js
- **Payments:** Stripe Connect (perfect fit for marketplace payouts to hosts)
- **Image storage:** Cloudinary or AWS S3 (never store images in MongoDB directly)
- **Search:** Start with MongoDB queries + `2dsphere` index; move to Elasticsearch/Algolia later if search gets heavy
- **Maps:** Mapbox or Google Maps API
- **Real-time chat:** Socket.io for messaging + notifications
- **Email:** SendGrid/Postmark for booking confirmations, receipts
- **Hosting:** Frontend on Vercel/Netlify, backend on Render/Railway/EC2, DB on MongoDB Atlas
- **Testing:** Jest + Supertest (backend), React Testing Library (frontend)

---

## 5. Suggested Tech Stack Detail (MERN)

| Layer | Tool |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, React Query/TanStack Query |
| State mgmt | Zustand or Redux Toolkit (Redux only if app gets complex) |
| Backend | Express.js, Mongoose ODM |
| Auth | JWT + bcrypt, Passport.js for OAuth |
| Payments | Stripe Connect (Express accounts for hosts) |
| File upload | Multer → Cloudinary/S3 |
| Realtime | Socket.io |
| Validation | Zod or Joi (backend), React Hook Form + Zod (frontend) |
| DevOps | Docker for local dev parity, GitHub Actions for CI |

---

## 6. Suggested Build Order (avoids getting overwhelmed)

1. Auth (signup/login/JWT)
2. Listings CRUD + image upload
3. Search + listing detail page
4. Booking flow (no payment yet — just create booking record)
5. Stripe integration
6. Reviews
7. Messaging
8. Host dashboard + admin panel
9. Notifications + polish

---

Want me to scaffold the actual folder structure and starter code (Express server + Mongoose models + a basic React app) next?