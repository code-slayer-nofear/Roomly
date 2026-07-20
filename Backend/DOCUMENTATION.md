# Roomly Backend — Documentation

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture & Patterns](#architecture--patterns)
5. [Database Design](#database-design)
6. [Authentication](#authentication)
7. [API Reference](#api-reference)
8. [Running the Project](#running-the-project)

---

## Overview

Roomly is an Airbnb-style rental marketplace built on the MERN stack. This document covers the backend only — an Express.js REST API written in TypeScript, backed by MongoDB via Mongoose, with real-time messaging over Socket.io.

---

## Tech Stack

| Concern | Tool |
|---|---|
| Language | TypeScript (strict mode) |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (access + refresh tokens) + bcryptjs |
| Real-time | Socket.io |
| File upload | Multer + Cloudinary (v1) |
| Payments | Stripe |
| Validation | Zod |
| API Docs | Swagger UI (`swagger-jsdoc` + `swagger-ui-express`) |
| Dev server | ts-node-dev |

---

## Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   ├── db.ts           # MongoDB connection
│   │   └── swagger.ts      # Full OpenAPI 3.0 spec
│   ├── controllers/        # HTTP layer — parse request, call repository, send response
│   │   ├── authController.ts
│   │   ├── bookingController.ts
│   │   ├── listingController.ts
│   │   ├── messageController.ts
│   │   └── reviewController.ts
│   ├── middleware/
│   │   ├── auth.ts         # protect (JWT guard) + requireRole
│   │   └── errorHandler.ts # Global error handler
│   ├── models/             # Mongoose schemas + Document interfaces
│   │   ├── Booking.ts
│   │   ├── Listing.ts
│   │   ├── Message.ts
│   │   ├── Notification.ts
│   │   ├── Payment.ts
│   │   ├── Review.ts
│   │   └── User.ts
│   ├── repositories/       # Data access layer — all DB queries live here
│   │   ├── BookingRepository.ts
│   │   ├── ListingRepository.ts
│   │   ├── MessageRepository.ts
│   │   ├── ReviewRepository.ts
│   │   └── UserRepository.ts
│   ├── routes/             # Express routers — wire URLs to controllers
│   │   ├── auth.ts
│   │   ├── bookings.ts
│   │   ├── listings.ts
│   │   ├── messages.ts
│   │   └── reviews.ts
│   ├── types/
│   │   └── index.ts        # Shared TypeScript interfaces + AuthRequest
│   ├── utils/
│   │   └── jwt.ts          # signToken, signRefreshToken, verifyToken, verifyRefreshToken
│   └── server.ts           # App entry point — Express + Socket.io setup
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Architecture & Patterns

### Repository Pattern

Every model has a dedicated repository class that owns **all database interactions** for that domain. Controllers never import Mongoose models directly — they only call repository methods.

```
Request → Route → Controller → Repository → MongoDB
                      ↑               ↓
                  (thin layer)   (all queries)
```

**Why:**
- Controllers stay focused on HTTP concerns (parsing input, sending responses)
- Swapping the database or ORM only requires changing the repository, not every controller
- Easier to unit test — you can mock a repository without spinning up a database
- Queries are co-located and named, making them easy to find and optimize

**Example — before (controller doing DB work):**
```ts
// ❌ controller directly querying Mongoose
const listing = await Listing.findById(id).populate("hostId", "name avatarUrl");
```

**Example — after (repository pattern):**
```ts
// ✅ controller calls repository
const listing = await listingRepository.findById(id);

// ListingRepository owns the query
findById(id: string) {
  return Listing.findById(id).populate("hostId", "name avatarUrl bio createdAt");
}
```

---

### Layered Architecture

Each layer has a single responsibility:

| Layer | File location | Responsibility |
|---|---|---|
| Routes | `src/routes/` | Map HTTP verbs + paths to controller functions |
| Controllers | `src/controllers/` | Parse request, call repository/service, return response |
| Repositories | `src/repositories/` | All Mongoose queries — the only layer that touches models |
| Models | `src/models/` | Mongoose schema definition + Document type |
| Middleware | `src/middleware/` | Cross-cutting concerns (auth, error handling) |
| Types | `src/types/` | Shared interfaces used across all layers |

---

### TypeScript Design Decisions

- **Strict mode** is enabled in `tsconfig.json` — catches null/undefined bugs at compile time
- Each model exports two things: the Mongoose `Document` interface (e.g. `IUserDocument`) and the compiled model. This gives full type safety on document instances (e.g. calling `user.comparePassword()`)
- `AuthRequest` extends Express's `Request` to add the `user` property set by the `protect` middleware, avoiding `any` casts in controllers
- All shared domain interfaces live in `src/types/index.ts` so models, repositories, and controllers all reference the same shape

---

### Authentication Flow

Roomly uses a **dual-token strategy**:

1. **Access token** — short-lived JWT (15 min), sent in the `Authorization: Bearer <token>` header
2. **Refresh token** — long-lived JWT (7 days), stored in an `httpOnly` cookie (not accessible to JavaScript, mitigates XSS)

```
POST /api/auth/login
  → validates credentials
  → returns { token } in body  (access token)
  → sets refreshToken cookie   (refresh token)

POST /api/auth/refresh
  → reads refreshToken cookie
  → returns new { token }      (new access token)

POST /api/auth/logout
  → clears refreshToken cookie
```

The `protect` middleware reads the `Authorization` header, verifies the access token, fetches the user from DB (excluding `passwordHash`), and attaches it to `req.user`.

---

### Role-Based Access Control

Users have a `role` array (e.g. `["guest"]`, `["guest", "host"]`, `["admin"]`). The `requireRole` middleware factory checks that the authenticated user has at least one of the required roles:

```ts
router.post("/", protect, requireRole("host", "admin"), createListing);
```

---

### Real-time Messaging (Socket.io)

When a user connects, they emit a `join` event with their `userId`. The server puts that socket into a room named after the userId:

```ts
socket.on("join", (userId: string) => socket.join(userId));
```

When a message is sent via `POST /api/messages`, the message controller emits `new_message` directly to the receiver's room:

```ts
req.app.get("io")?.to(receiverId).emit("new_message", message);
```

This means the receiver gets the message in real-time without polling.

---

### Conversation ID Generation

Instead of a separate `conversations` collection, a deterministic conversation ID is derived from the two user IDs and the listing ID:

```ts
const sorted = [userId1, userId2].sort().join("_");
const hex = crypto.createHash("md5").update(`${sorted}_${listingId}`).digest("hex").slice(0, 24);
const conversationId = new mongoose.Types.ObjectId(hex);
```

Sorting the user IDs ensures the same ID is generated regardless of who initiates the conversation.

---

### Booking Price Calculation

When a booking is created, the price breakdown is calculated server-side (never trusted from the client):

```
subtotal        = pricePerNight × nights
guestServiceFee = subtotal × 12%   (platform fee charged to guest)
hostServiceFee  = subtotal × 4%    (platform fee deducted from host payout)
total           = subtotal + guestServiceFee
```

---

### Review Rating Aggregation

Instead of loading all reviews into memory to compute the average, `ReviewRepository.getAverageRating` uses a MongoDB aggregation pipeline:

```ts
Review.aggregate([
  { $match: { listingId, type: "guest_to_host" } },
  { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
])
```

The result is written back to the listing's `avgRating` and `reviewCount` fields for fast reads.

---

## Database Design

### Collections & Indexes

| Collection | Key Indexes |
|---|---|
| `users` | `email` (unique) |
| `listings` | `location.geo` (2dsphere), `location.city + status` (compound) |
| `bookings` | `listingId + checkIn + checkOut` (compound, for availability checks) |
| `reviews` | `listingId` |

### Geospatial Search

`listings.location.geo` is indexed as a `2dsphere` index. The `GET /api/listings` endpoint accepts `lat`, `lng`, and `radius` (km) query params and uses MongoDB's `$near` operator to return listings sorted by distance.

---

## Authentication

All protected routes require:

```
Authorization: Bearer <access_token>
```

Roles:
- `guest` — default role for all registered users
- `host` — required to create/edit/delete listings and view host bookings
- `admin` — has all host permissions plus platform moderation

A user can hold multiple roles simultaneously (e.g. `["guest", "host"]`).

---

## API Reference

Interactive docs are available at **`http://localhost:5000/api-docs`** when the server is running (Swagger UI).

### Base URL
```
http://localhost:5000/api
```

### Endpoints Summary

#### Auth — `/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register a new user |
| POST | `/login` | — | Login, returns access token + sets refresh cookie |
| POST | `/refresh` | cookie | Get a new access token |
| POST | `/logout` | — | Clear refresh token cookie |
| GET | `/me` | ✅ | Get current user |

#### Listings — `/listings`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Search listings (city, price, guests, geo, amenities) |
| GET | `/:id` | — | Get listing detail |
| POST | `/` | host/admin | Create listing |
| PUT | `/:id` | host/admin | Update listing |
| DELETE | `/:id` | host/admin | Delete listing |

#### Bookings — `/bookings`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Create booking (checks availability + calculates price) |
| GET | `/my` | ✅ | Get guest's bookings |
| GET | `/host` | host/admin | Get host's incoming bookings |
| PATCH | `/:id/cancel` | ✅ | Cancel a booking |

#### Reviews — `/reviews`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Submit review for a completed booking |
| GET | `/listing/:listingId` | — | Get all reviews for a listing |

#### Messages — `/messages`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Send a message |
| GET | `/inbox` | ✅ | Get inbox (last message per conversation) |
| GET | `/:otherUserId/:listingId` | ✅ | Get full conversation |

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
# Fill in MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, CLOUDINARY_*, STRIPE_SECRET_KEY
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
npm run build       # compiles to dist/
npm start           # runs dist/server.js
```
