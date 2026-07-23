import { Types } from "mongoose";
import { Request } from "express";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  authProvider: string;
  avatarUrl?: string;
  phone?: string;
  role: string[];
  isVerified: boolean;
  isSuspended: boolean;
  bio?: string;
  address?: { country?: string; city?: string };
  wishlists: Types.ObjectId[];
  payoutInfo?: { method?: string; accountId?: string };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

export interface IListing {
  _id: Types.ObjectId;
  hostId: Types.ObjectId;
  title: string;
  description?: string;
  propertyType?: string;
  roomType?: string;
  location: {
    address?: string;
    city?: string;
    country?: string;
    geo?: { type: "Point"; coordinates: [number, number] };
  };
  pricePerNight: number;
  currency: string;
  maxGuests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  amenities: string[];
  photos: string[];
  houseRules: string[];
  cancellationPolicy: "flexible" | "moderate" | "strict";
  availability: { date: Date; isBlocked: boolean; priceOverride?: number }[];
  avgRating: number;
  reviewCount: number;
  status: "draft" | "published" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooking {
  _id: Types.ObjectId;
  listingId: Types.ObjectId;
  guestId: Types.ObjectId;
  hostId: Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: { adults?: number; children?: number; infants?: number };
  nights: number;
  priceBreakdown: {
    subtotal: number;
    guestServiceFee: number;
    hostServiceFee: number;
    cleaningFee: number;
    taxes: number;
    total: number;
  };
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "unpaid" | "paid" | "refunded";
  paymentIntentId?: string;
  cancelledBy?: string;
  createdAt: Date;
}

export interface IReview {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  listingId: Types.ObjectId;
  authorId: Types.ObjectId;
  targetId: Types.ObjectId;
  type: "guest_to_host" | "host_to_guest";
  rating: number;
  categories?: {
    cleanliness?: number;
    communication?: number;
    checkIn?: number;
    accuracy?: number;
    location?: number;
    value?: number;
  };
  comment?: string;
  createdAt: Date;
}

export interface IMessage {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  listingId?: Types.ObjectId;
  text: string;
  readAt?: Date;
  createdAt: Date;
}

export interface IPayment {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  amount: number;
  currency: string;
  type: "charge" | "payout" | "refund";
  status: "pending" | "succeeded" | "failed";
  provider: string;
  providerRef?: string;
  createdAt: Date;
}

export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: string;
  payload?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}
