import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Roomly API",
      version: "1.0.0",
      description:
        "REST API for Roomly — an Airbnb-style rental marketplace. Covers auth, listings, bookings, reviews, and messaging.",
    },
    servers: [{ url: "http://localhost:5000/api", description: "Local dev server" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────────────
        RegisterBody: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Jane Doe" },
            email: { type: "string", format: "email", example: "jane@example.com" },
            password: { type: "string", minLength: 6, example: "secret123" },
          },
        },
        LoginBody: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "jane@example.com" },
            password: { type: "string", example: "secret123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                role: { type: "array", items: { type: "string" } },
                avatarUrl: { type: "string", nullable: true },
              },
            },
          },
        },
        // ── User ──────────────────────────────────────────────────────────
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            authProvider: { type: "string", enum: ["local", "google", "facebook"] },
            avatarUrl: { type: "string", nullable: true },
            phone: { type: "string", nullable: true },
            role: { type: "array", items: { type: "string", enum: ["guest", "host", "admin"] } },
            isVerified: { type: "boolean" },
            bio: { type: "string", nullable: true },
            address: {
              type: "object",
              properties: {
                country: { type: "string" },
                city: { type: "string" },
              },
            },
            wishlists: { type: "array", items: { type: "string" } },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        // ── Listing ───────────────────────────────────────────────────────
        ListingBody: {
          type: "object",
          required: ["title", "pricePerNight"],
          properties: {
            title: { type: "string", example: "Cozy cabin in the woods" },
            description: { type: "string" },
            propertyType: { type: "string", example: "cabin" },
            roomType: {
              type: "string",
              enum: ["entire_place", "private_room", "shared_room"],
            },
            location: {
              type: "object",
              properties: {
                address: { type: "string" },
                city: { type: "string", example: "Austin" },
                country: { type: "string", example: "US" },
                geo: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["Point"] },
                    coordinates: {
                      type: "array",
                      items: { type: "number" },
                      example: [-97.7431, 30.2672],
                    },
                  },
                },
              },
            },
            pricePerNight: { type: "number", example: 120 },
            currency: { type: "string", example: "USD" },
            maxGuests: { type: "integer", example: 4 },
            bedrooms: { type: "integer", example: 2 },
            beds: { type: "integer", example: 3 },
            bathrooms: { type: "number", example: 1.5 },
            amenities: { type: "array", items: { type: "string" }, example: ["wifi", "pool"] },
            photos: { type: "array", items: { type: "string" } },
            houseRules: { type: "array", items: { type: "string" } },
            cancellationPolicy: { type: "string", enum: ["flexible", "moderate", "strict"] },
            status: { type: "string", enum: ["draft", "published", "suspended"] },
          },
        },
        Listing: {
          allOf: [
            { $ref: "#/components/schemas/ListingBody" },
            {
              type: "object",
              properties: {
                _id: { type: "string" },
                hostId: { type: "string" },
                avgRating: { type: "number" },
                reviewCount: { type: "integer" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
          ],
        },
        // ── Booking ───────────────────────────────────────────────────────
        BookingBody: {
          type: "object",
          required: ["listingId", "checkIn", "checkOut", "guests"],
          properties: {
            listingId: { type: "string" },
            checkIn: { type: "string", format: "date", example: "2025-08-01" },
            checkOut: { type: "string", format: "date", example: "2025-08-05" },
            guests: {
              type: "object",
              properties: {
                adults: { type: "integer", example: 2 },
                children: { type: "integer", example: 1 },
                infants: { type: "integer", example: 0 },
              },
            },
          },
        },
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string" },
            listingId: { type: "string" },
            guestId: { type: "string" },
            hostId: { type: "string" },
            checkIn: { type: "string", format: "date-time" },
            checkOut: { type: "string", format: "date-time" },
            nights: { type: "integer" },
            priceBreakdown: {
              type: "object",
              properties: {
                subtotal: { type: "number" },
                guestServiceFee: { type: "number" },
                hostServiceFee: { type: "number" },
                cleaningFee: { type: "number" },
                taxes: { type: "number" },
                total: { type: "number" },
              },
            },
            status: { type: "string", enum: ["pending", "confirmed", "cancelled", "completed"] },
            paymentStatus: { type: "string", enum: ["unpaid", "paid", "refunded"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ── Review ────────────────────────────────────────────────────────
        ReviewBody: {
          type: "object",
          required: ["bookingId", "rating", "type"],
          properties: {
            bookingId: { type: "string" },
            type: { type: "string", enum: ["guest_to_host", "host_to_guest"] },
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            categories: {
              type: "object",
              properties: {
                cleanliness: { type: "number" },
                communication: { type: "number" },
                checkIn: { type: "number" },
                accuracy: { type: "number" },
                location: { type: "number" },
                value: { type: "number" },
              },
            },
            comment: { type: "string", example: "Amazing stay!" },
          },
        },
        Review: {
          allOf: [
            { $ref: "#/components/schemas/ReviewBody" },
            {
              type: "object",
              properties: {
                _id: { type: "string" },
                listingId: { type: "string" },
                authorId: { type: "string" },
                targetId: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          ],
        },
        // ── Message ───────────────────────────────────────────────────────
        MessageBody: {
          type: "object",
          required: ["receiverId", "listingId", "text"],
          properties: {
            receiverId: { type: "string" },
            listingId: { type: "string" },
            text: { type: "string", example: "Is the cabin available for the weekend?" },
          },
        },
        Message: {
          type: "object",
          properties: {
            _id: { type: "string" },
            conversationId: { type: "string" },
            senderId: { type: "string" },
            receiverId: { type: "string" },
            listingId: { type: "string" },
            text: { type: "string" },
            readAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ── Shared ────────────────────────────────────────────────────────
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    paths: {
      // ── Auth ──────────────────────────────────────────────────────────────
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterBody" } } },
          },
          responses: {
            201: { description: "User created", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            409: { description: "Email already in use", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with email and password",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginBody" } } },
          },
          responses: {
            200: { description: "Login successful", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token using httpOnly refresh token cookie",
          responses: {
            200: { description: "New access token", content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" } } } } } },
            401: { description: "Invalid or missing refresh token" },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout and clear refresh token cookie",
          responses: {
            200: { description: "Logged out" },
          },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get the currently authenticated user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Current user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
            401: { description: "Not authenticated" },
          },
        },
      },
      // ── Listings ──────────────────────────────────────────────────────────
      "/listings": {
        get: {
          tags: ["Listings"],
          summary: "Search and filter published listings",
          parameters: [
            { name: "city", in: "query", schema: { type: "string" }, description: "Filter by city name (case-insensitive)" },
            { name: "minPrice", in: "query", schema: { type: "number" }, description: "Minimum price per night" },
            { name: "maxPrice", in: "query", schema: { type: "number" }, description: "Maximum price per night" },
            { name: "guests", in: "query", schema: { type: "integer" }, description: "Minimum guest capacity" },
            { name: "amenities", in: "query", schema: { type: "string" }, description: "Comma-separated amenities (e.g. wifi,pool)" },
            { name: "lat", in: "query", schema: { type: "number" }, description: "Latitude for geo search" },
            { name: "lng", in: "query", schema: { type: "number" }, description: "Longitude for geo search" },
            { name: "radius", in: "query", schema: { type: "number", default: 50 }, description: "Search radius in km" },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: {
            200: { description: "Array of listings", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Listing" } } } } },
          },
        },
        post: {
          tags: ["Listings"],
          summary: "Create a new listing (host/admin only)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ListingBody" } } },
          },
          responses: {
            201: { description: "Listing created", content: { "application/json": { schema: { $ref: "#/components/schemas/Listing" } } } },
            401: { description: "Not authenticated" },
            403: { description: "Forbidden — requires host or admin role" },
          },
        },
      },
      "/listings/{id}": {
        get: {
          tags: ["Listings"],
          summary: "Get a single listing by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Listing detail", content: { "application/json": { schema: { $ref: "#/components/schemas/Listing" } } } },
            404: { description: "Listing not found" },
          },
        },
        put: {
          tags: ["Listings"],
          summary: "Update a listing (owner host/admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ListingBody" } } },
          },
          responses: {
            200: { description: "Updated listing", content: { "application/json": { schema: { $ref: "#/components/schemas/Listing" } } } },
            404: { description: "Listing not found or unauthorized" },
          },
        },
        delete: {
          tags: ["Listings"],
          summary: "Delete a listing (owner host/admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Listing deleted" },
            404: { description: "Listing not found or unauthorized" },
          },
        },
      },
      // ── Bookings ──────────────────────────────────────────────────────────
      "/bookings": {
        post: {
          tags: ["Bookings"],
          summary: "Create a booking for a listing",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/BookingBody" } } },
          },
          responses: {
            201: { description: "Booking created", content: { "application/json": { schema: { $ref: "#/components/schemas/Booking" } } } },
            400: { description: "Invalid dates" },
            404: { description: "Listing not available" },
            409: { description: "Dates not available" },
          },
        },
      },
      "/bookings/my": {
        get: {
          tags: ["Bookings"],
          summary: "Get all bookings for the authenticated guest",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Guest bookings", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Booking" } } } } },
          },
        },
      },
      "/bookings/host": {
        get: {
          tags: ["Bookings"],
          summary: "Get all bookings for the authenticated host (host/admin only)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Host bookings", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Booking" } } } } },
            403: { description: "Forbidden" },
          },
        },
      },
      "/bookings/{id}/cancel": {
        patch: {
          tags: ["Bookings"],
          summary: "Cancel a booking (guest or host)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Booking cancelled", content: { "application/json": { schema: { $ref: "#/components/schemas/Booking" } } } },
            400: { description: "Already cancelled" },
            403: { description: "Forbidden" },
            404: { description: "Booking not found" },
          },
        },
      },
      // ── Reviews ───────────────────────────────────────────────────────────
      "/reviews": {
        post: {
          tags: ["Reviews"],
          summary: "Submit a review for a completed booking",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewBody" } } },
          },
          responses: {
            201: { description: "Review created", content: { "application/json": { schema: { $ref: "#/components/schemas/Review" } } } },
            400: { description: "Booking not completed" },
            403: { description: "Forbidden" },
            409: { description: "Already reviewed" },
          },
        },
      },
      "/reviews/listing/{listingId}": {
        get: {
          tags: ["Reviews"],
          summary: "Get all guest-to-host reviews for a listing",
          parameters: [{ name: "listingId", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Array of reviews", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Review" } } } } },
          },
        },
      },
      // ── Messages ──────────────────────────────────────────────────────────
      "/messages": {
        post: {
          tags: ["Messages"],
          summary: "Send a message to another user about a listing",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/MessageBody" } } },
          },
          responses: {
            201: { description: "Message sent", content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } } },
          },
        },
      },
      "/messages/inbox": {
        get: {
          tags: ["Messages"],
          summary: "Get the last message of each conversation for the authenticated user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Inbox messages", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Message" } } } } },
          },
        },
      },
      "/messages/{otherUserId}/{listingId}": {
        get: {
          tags: ["Messages"],
          summary: "Get full conversation between two users about a listing",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "otherUserId", in: "path", required: true, schema: { type: "string" } },
            { name: "listingId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Conversation messages", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Message" } } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
