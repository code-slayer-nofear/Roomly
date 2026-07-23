export interface User {
  id: string;
  name: string;
  email: string;
  role: string[];
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  address?: {
    city?: string;
    country?: string;
  };
  isSuspended?: boolean;
}

export interface HostLike {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string[];
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
}

export interface Listing {
  _id: string;
  title: string;
  description: string;
  propertyType: string;
  roomType: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  pricePerNight: number;
  currency: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  photos: string[];
  host?: User;
  hostId?: string | HostLike;
  avgRating?: number;
  reviewCount?: number;
  status: "active" | "published" | "suspended" | "pending" | "draft";
  cancellationPolicy: "flexible" | "moderate" | "strict";
}

export interface Booking {
  _id: string;
  listing?: Listing;
  listingId?: string | { _id?: string; title?: string; currency?: string; location?: { city?: string; country?: string } };
  guest?: User;
  host?: User;
  checkIn: string;
  checkOut: string;
  guests: number | { adults?: number; children?: number; infants?: number };
  totalPrice?: number;
  priceBreakdown?: { total?: number };
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "unpaid" | "paid" | "refunded";
  createdAt: string;
}

export interface Review {
  _id: string;
  listing: string;
  author?: User;
  authorId?: { _id?: string; id?: string; name?: string; avatarUrl?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  recipient: string;
  listing: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  otherUser: User;
  listing: { _id: string; title: string; photos: string[] };
  lastMessage: Message;
  unreadCount: number;
}

export interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
