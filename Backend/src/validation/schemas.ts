import { z } from "zod";

// Auth
export const registerSchema = z.object({
  name:     z.string().min(2).max(50),
  email:    z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// Listings
export const createListingSchema = z.object({
  title:               z.string().min(5).max(100),
  description:         z.string().max(2000).optional(),
  propertyType:        z.string().optional(),
  roomType:            z.string().optional(),
  location: z.object({
    address:   z.string().optional(),
    city:      z.string().optional(),
    country:   z.string().optional(),
    geo: z.object({
      type:        z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]),
    }).optional(),
  }).optional(),
  pricePerNight:       z.number().positive(),
  currency:            z.string().length(3).default("USD"),
  maxGuests:           z.number().int().positive().optional(),
  bedrooms:            z.number().int().min(0).optional(),
  beds:                z.number().int().min(0).optional(),
  bathrooms:           z.number().min(0).optional(),
  amenities:           z.array(z.string()).default([]),
  houseRules:          z.array(z.string()).default([]),
  cancellationPolicy:  z.enum(["flexible", "moderate", "strict"]).default("flexible"),
});

export const updateListingSchema = createListingSchema.partial();

// Bookings
export const createBookingSchema = z.object({
  listingId: z.string().length(24),
  checkIn:   z.string().datetime({ offset: true }),
  checkOut:  z.string().datetime({ offset: true }),
  guests: z.object({
    adults:   z.number().int().min(1).default(1),
    children: z.number().int().min(0).default(0),
    infants:  z.number().int().min(0).default(0),
  }).default({}),
});

// Reviews
export const createReviewSchema = z.object({
  bookingId:  z.string().length(24),
  type:       z.enum(["guest_to_host", "host_to_guest"]),
  rating:     z.number().int().min(1).max(5),
  categories: z.object({
    cleanliness:   z.number().int().min(1).max(5).optional(),
    communication: z.number().int().min(1).max(5).optional(),
    checkIn:       z.number().int().min(1).max(5).optional(),
    accuracy:      z.number().int().min(1).max(5).optional(),
    location:      z.number().int().min(1).max(5).optional(),
    value:         z.number().int().min(1).max(5).optional(),
  }).optional(),
  comment: z.string().max(1000).optional(),
});

// Messages
export const sendMessageSchema = z.object({
  receiverId: z.string().length(24),
  listingId:  z.string().length(24),
  text:       z.string().min(1).max(2000),
});
