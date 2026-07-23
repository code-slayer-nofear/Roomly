# Roomly Backend — Documentation

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture & Patterns](#architecture--patterns)
5. [Database Design](#database-design)
6. [Authentication](#authentication)
7. [Real-time Events (Socket.io)](#real-time-events-socketio)
8. [Notifications](#notifications)
9. [Email Notifications](#email-notifications)
10. [Input Validation](#input-validation)
11. [API Reference](#api-reference)
12. [Running the Project](#running-the-project)

---

## Overview

Roomly is an Airbnb-style rental marketplace built on the MERN stack. This document covers the backend only — an Express.js REST API written in TypeScript, backed by MongoDB via Mongoose, with real-time messaging and notifications over Socket.io.

---

## Tech Stack

| Concern | Tool |
|---|---|
| Language | TypeScript (strict mode) |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (access + refresh tokens) + bcryptjs + Passport.js (OAuth) |
| Real-time | Socket.io |
| File upload | Multer + Cloudinary (v1) |
| Payments | Stripe |
| Validation | Zod |
| Email | SendGrid (`@sendgrid/mail`) |
| Security | Helmet + express-rate-limit |
| API Docs | Swagger UI (`swagger-jsdoc` + `swagger-ui-express`) |
| Dev server | ts-node-dev |

---

## Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   ├── db.ts               # MongoDB connection
│   │   ├── cloudinary.ts       # Cloudinary setup
│   │   ├── passport.ts         # Passport Google + Facebook strategies
│   │   ├── stripe.ts           # Stripe helpers
│   │   └── swagger.ts          # OpenAPI 3.0 spec
│   ├── controllers/
│   │   ├── adminController.ts
│   │   ├── authController.ts
│   │   ├── bookingController.ts
│   │   ├── listingController.ts
│   │   ├── messageController.ts
│   │   ├── notificationController.ts
│   │   ├── reviewController.ts
│   │   ├── userController.ts
│   │   └── webhookController.ts
│   ├── middleware/
│   │   ├── auth.ts             # protect (JWT guard + silent refresh) + requireRole
│   │   ├── errorHandler.ts     # Global error handler (handles ZodError too)
│   │   ├── upload.ts           # Multer + Cloudinary storage
│   │   └── validate.ts         # Zod validation middleware factory
│   ├── models/
│   │   ├── Booking.ts
│   │   ├── Listing.ts
│   │   ├── Message.ts
│   │   ├── Notification.ts
│   │   ├── Payment.ts
│   │   ├── Review.ts
│   │   └── User.ts
│   ├── repositories/
│   │   ├── BookingRepository.ts
│   │   ├── ListingRepository.ts
│   │   ├── MessageRepository.ts
│   │   ├── NotificationRepository.ts
│   │   ├── PaymentRepository.ts
│   │   ├── ReviewRepository.ts
│   │   └── UserRepository.ts
│   ├── routes/
│   │   ├── admin.ts
│   │   ├── auth.ts
│   │   ├── bookings.ts
│   │   ├── listings.ts
│   │   ├── messages.ts
│   │   ├── notifications.ts
│   │   ├── oauth.ts
│   │   ├── reviews.ts
│   │   ├── users.ts
│   │   └── webhook.ts
│   ├── services/
│   │   ├── emailService.ts     # SendGrid email helpers
│   │   └── notificationService.ts # In-app + Socket.io notifications
│   ├── types/
│   │   └── index.ts            # Shared TypeScript interfaces + AuthRequest
│   ├── utils/
│   │   └── jwt.ts              # signToken, signRefreshToken, verifyToken, verifyRefreshToken
│   ├── validation/
│   │   └── schemas.ts          # All Zod schemas
│   └── server.ts               # App entry point — Express + Socket.io setup
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Architecture & Patterns

### Repository Pattern

Every model has a dedicated repository class that owns **all database interactions** for that domain. Controllers never import Mongoose models directly — they only call repository methods.

```
Request → Route → Middleware → Controller → Repository → MongoDB
                                    ↓
                               Services (email, notifications)
```

### Layered Architecture

| Layer | File location | Responsibility |
|---|---|---|
| Routes | `src/routes/` | Map HTTP verbs + paths to controller functions |
| Middleware | `src/middleware/` | Auth, validation, error handling |
| Controllers | `src/controllers/` | Parse request, call repository/service, return response |
| Repositories | `src/repositories/` | All Mongoose queries — the only layer that touches models |
| Models | `src/models/` | Mongoose schema definition + Document type |
| Services | `src/services/` | Side effects — notifications, emails |
| Types | `src/types/` | Shared interfaces used across all layers |

---

### Booking Completion (Auto-transition)

Bookings are automatically transitioned from `"confirmed"` to `"completed"` once their `checkOut` date has passed. This runs on server startup and every hour via `setInterval` — no external cron job is needed. Reviews can only be submitted on `"completed"` bookings.

---

### Booking Price Calculation

Calculated server-side — never trusted from the client:

```
subtotal        = pricePerNight × nights
guestServiceFee = subtotal × 12%   (platform fee charged to guest)
hostServiceFee  = subtotal × 4%    (platform fee deducted from host payout)
total           = subtotal + guestServiceFee
```

### Review Rating Aggregation

`ReviewRepository.getAverageRating` uses a MongoDB aggregation pipeline instead of loading all reviews into memory. The result is written back to `listing.avgRating` and `listing.reviewCount` for fast reads.

### Conversation ID Generation

No separate `conversations` collection — a deterministic ID is derived from the two user IDs + listing ID:

```ts
const sorted = [userId1, userId2].sort().join("_");
const hex = crypto.createHash("md5").update(`${sorted}_${listingId}`).digest("hex").slice(0, 24);
const conversationId = new mongoose.Types.ObjectId(hex);
```

---

## Database Design

### Collections & Indexes

| Collection | Key Indexes |
|---|---|
| `users` | `email` (unique) |
| `listings` | `location.geo` (2dsphere), `location.city + status` (compound) |
| `bookings` | `listingId + checkIn + checkOut` (compound, for availability checks) |
| `reviews` | `listingId` |

### Notable Fields

**User**
- `role: string[]` — can be `["guest"]`, `["guest", "host"]`, `["admin"]`
- `isSuspended: boolean` — set by admin to block access
- `authProvider: string` — `"local"` | `"google"` | `"facebook"`
- `isVerified: boolean` — automatically `true` for OAuth users

**Booking**
- `status: "pending" | "confirmed" | "cancelled" | "completed"` — transitions to `"completed"` automatically after `checkOut`
- `paymentStatus: "unpaid" | "paid" | "refunded"` — updated by Stripe webhooks

**Listing**
- `status: "draft" | "published" | "suspended"` — only `published` listings appear in search; admin can set to `suspended`

### Geospatial Search

`listings.location.geo` is a `2dsphere` index. `GET /api/listings` accepts `lat`, `lng`, and `radius` (km) and uses MongoDB's `$near` operator to return listings sorted by distance.

---

## Authentication

### Local Auth (JWT)

Roomly uses a **dual-token strategy**:

1. **Access token** — short-lived JWT (15 min), sent in every request header:
   ```
   Authorization: Bearer <access_token>
   ```
2. **Refresh token** — long-lived JWT (7 days), stored in an `httpOnly` cookie (not accessible to JavaScript — mitigates XSS)

```
POST /api/auth/register  → returns { token, user } + sets refreshToken cookie
POST /api/auth/login     → returns { token, user } + sets refreshToken cookie
POST /api/auth/refresh   → reads cookie, returns new { token }
POST /api/auth/logout    → clears refreshToken cookie
GET  /api/auth/me        → returns current user (requires Bearer token)
```

### Silent Token Refresh

The `protect` middleware handles expired access tokens automatically — **the frontend does not need to intercept 401s and retry**:

1. Access token is verified
2. If expired (`TokenExpiredError`), the refresh token cookie is checked
3. If the refresh token is valid → a new access token is issued and returned in the `X-New-Token` response header, and the request continues normally
4. If the refresh token is also missing/expired → `401 "Session expired, please log in again"`

**The frontend must check every response for the `X-New-Token` header and store it if present:**
```ts
const newToken = response.headers.get("X-New-Token");
if (newToken) localStorage.setItem("token", newToken);
```

### OAuth (Google & Facebook)

Passport.js handles the OAuth flow. Users are upserted on first login — if the email already exists in the DB the account is linked, otherwise a new one is created with `isVerified: true`.

```
GET /api/auth/oauth/google           → redirects to Google consent screen
GET /api/auth/oauth/google/callback  → Google redirects back here after consent

GET /api/auth/oauth/facebook         → redirects to Facebook consent screen
GET /api/auth/oauth/facebook/callback
```

On success, both callbacks:
- Set the `refreshToken` httpOnly cookie (same as local auth)
- Redirect to: `CLIENT_URL/oauth/callback?token=<access_token>`

**The frontend OAuth callback page must:**
1. Read `token` from the URL query param
2. Store it (e.g. `localStorage.setItem("token", token)`)
3. Strip it from the URL immediately (`history.replaceState`)
4. Redirect the user to their dashboard

On failure, redirects to: `CLIENT_URL/login?error=oauth`

### Suspended Users

The `protect` middleware checks `isSuspended` on every authenticated request — in both the normal and silent-refresh paths. A suspended user gets `403 "Account suspended"` immediately, even with a valid token.

### Role-Based Access Control

Users have a `role` array. The `requireRole` middleware checks for at least one matching role:

- `guest` — default for all registered users
- `host` — required to create/edit/delete listings and view host bookings
- `admin` — full platform access including moderation endpoints

A user can hold multiple roles simultaneously (e.g. `["guest", "host"]`).

### Security Headers & Rate Limiting

- `helmet()` is applied globally — sets HTTP security headers (XSS protection, HSTS, content-type sniffing, etc.)
- Auth endpoints (`/api/auth/*`) are rate-limited to **20 requests per 15 minutes** per IP. Exceeding this returns `429 { message: "Too many requests, please try again later" }`

---

## Real-time Events (Socket.io)

### Connecting

After login, the frontend must connect to Socket.io and join the user's personal room:

```ts
const socket = io(SERVER_URL, { withCredentials: true });
socket.emit("join", userId);
```

### Events the frontend should listen for

| Event | Payload | When |
|---|---|---|
| `new_message` | message object | A new chat message is received |
| `notification` | notification object | Any in-app notification is triggered |

---

## Notifications

In-app notifications are persisted to the `notifications` collection and pushed in real-time via Socket.io to the recipient's room.

### Notification types

| Type | Recipient | Trigger |
|---|---|---|
| `booking_requested` | Host | Guest creates a booking |
| `booking_confirmed` | Guest | Stripe `payment_intent.succeeded` webhook |
| `booking_cancelled` | Other party | Either guest or host cancels |
| `payment_received` | Guest | Stripe `payment_intent.succeeded` webhook |
| `new_message` | Receiver | Message sent via `POST /api/messages` |
| `review_received` | Target (host or guest) | Review submitted |

All `notify()` calls are fire-and-forget — a notification failure never breaks the main request.

---

## Email Notifications

Emails are sent via SendGrid. Like notifications, they are fire-and-forget — email failures are logged but never returned as errors to the client.

### Emails sent

| Email | Recipient | Trigger |
|---|---|---|
| New booking request | Host | Guest creates a booking |
| Booking confirmed + receipt | Guest | Stripe `payment_intent.succeeded` webhook |
| Booking cancelled (+ refund notice if applicable) | Other party | Either guest or host cancels |

---

## Input Validation

All mutating endpoints validate the request body with Zod before it reaches the controller. Invalid requests get a `400` with field-level errors:

```json
{
  "message": "Validation error",
  "errors": [
    { "field": "email", "message": "Invalid email" },
    { "field": "password", "message": "String must contain at least 8 character(s)" }
  ]
}
```

### Validated endpoints

| Endpoint | Schema |
|---|---|
| `POST /api/auth/register` | `registerSchema` |
| `POST /api/auth/login` | `loginSchema` |
| `POST /api/listings` | `createListingSchema` |
| `PUT /api/listings/:id` | `updateListingSchema` (all fields optional) |
| `POST /api/bookings` | `createBookingSchema` |
| `POST /api/reviews` | `createReviewSchema` |
| `POST /api/messages` | `sendMessageSchema` |

---

## API Reference

Interactive docs available at **`http://localhost:5000/api-docs`** (Swagger UI).

### Base URL
```
http://localhost:5000/api
```

### Auth — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register a new user |
| POST | `/login` | — | Login, returns access token + sets refresh cookie |
| POST | `/refresh` | cookie | Get a new access token |
| POST | `/logout` | — | Clear refresh token cookie |
| GET | `/me` | ✅ | Get current user |
| GET | `/oauth/google` | — | Redirect to Google OAuth consent |
| GET | `/oauth/google/callback` | — | Google OAuth callback |
| GET | `/oauth/facebook` | — | Redirect to Facebook OAuth consent |
| GET | `/oauth/facebook/callback` | — | Facebook OAuth callback |

### Listings — `/listings`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Search listings (`city`, `minPrice`, `maxPrice`, `guests`, `amenities`, `lat`, `lng`, `radius`, `page`, `limit`) |
| GET | `/:id` | — | Get listing detail (host info populated) |
| POST | `/` | host/admin | Create listing |
| PUT | `/:id` | host/admin | Update listing |
| DELETE | `/:id` | host/admin | Delete listing |
| POST | `/:id/photos` | host/admin | Upload up to 10 photos (multipart/form-data, field: `photos`) |
| DELETE | `/:id/photos` | host/admin | Delete a photo by URL (`{ url }` in body) |

### Bookings — `/bookings`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Create booking (availability check + server-side price calc) |
| GET | `/my` | ✅ | Get guest's bookings |
| GET | `/host` | host/admin | Get host's incoming bookings |
| GET | `/:id` | ✅ | Get a single booking (guest, host, or admin only) |
| POST | `/:id/pay` | ✅ | Create Stripe PaymentIntent, returns `{ clientSecret }` |
| PATCH | `/:id/cancel` | ✅ | Cancel a booking (issues Stripe refund if paid) |

#### Payment flow
```
1. POST /api/bookings          → creates booking (status: "pending", paymentStatus: "unpaid")
2. POST /api/bookings/:id/pay  → returns { clientSecret }
3. Frontend confirms payment with Stripe.js using clientSecret
4. Stripe fires payment_intent.succeeded webhook
5. Webhook sets booking status: "confirmed", paymentStatus: "paid"
   → sends booking confirmation + receipt email to guest
   → sends in-app notifications to guest
```

### Reviews — `/reviews`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Submit review (booking must be `completed`) |
| GET | `/listing/:listingId` | — | Get all guest→host reviews for a listing |

### Messages — `/messages`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Send a message |
| GET | `/inbox` | ✅ | Get inbox (last message per conversation) |
| GET | `/:otherUserId/:listingId` | ✅ | Get full conversation (marks messages as read) |

### Users — `/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | ✅ | Get current user's full profile |
| PATCH | `/me` | ✅ | Update current user's profile (`name`, `bio`, `phone`, `address`, `avatarUrl`) |
| GET | `/:id` | — | Get a public user profile (for host profile pages) |
| GET | `/wishlist` | ✅ | Get current user's wishlisted listings |
| POST | `/wishlist/:listingId` | ✅ | Toggle a listing in/out of wishlist |

### Notifications — `/notifications`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get last 50 notifications for current user |
| GET | `/unread-count` | ✅ | Get count of unread notifications |
| PATCH | `/read-all` | ✅ | Mark all notifications as read |
| PATCH | `/:id/read` | ✅ | Mark a single notification as read |

### Admin — `/admin`

All admin routes require `Authorization: Bearer <token>` with an `admin` role.

| Method | Path | Description |
|---|---|---|
| GET | `/users` | Paginated user list (`?page=1&limit=20`) |
| PATCH | `/users/:id/suspend` | Suspend a user |
| PATCH | `/users/:id/unsuspend` | Unsuspend a user |
| GET | `/listings` | Paginated listing list — all statuses |
| PATCH | `/listings/:id/approve` | Set listing status to `published` |
| PATCH | `/listings/:id/suspend` | Set listing status to `suspended` |
| GET | `/analytics` | GMV, bookings/day (last 30 days), total/confirmed/cancelled counts |

#### Analytics response shape
```json
{
  "gmv": 48200,
  "bookingsPerDay": [
    { "_id": "2025-07-01", "count": 4 },
    { "_id": "2025-07-02", "count": 7 }
  ],
  "total": 312,
  "confirmed": 280,
  "cancelled": 32
}
```

---

## Running the Project

### 1. Install dependencies
```bash
cd Backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Fill in all values in `.env`:

```env
PORT=5000
MONGO_URI=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# OAuth — create apps at console.cloud.google.com and developers.facebook.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# Email — create API key at app.sendgrid.com, verify sender domain
SENDGRID_API_KEY=...
EMAIL_FROM=noreply@roomly.com
```

### 3. Start dev server
```bash
npm run dev
```

### 4. Open Swagger UI
```
http://localhost:5000/api-docs
```

### 5. Build for production
```bash
npm run build   # compiles to dist/
npm start       # runs dist/server.js
```
