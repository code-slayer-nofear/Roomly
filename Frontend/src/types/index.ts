export interface User {
  id: string;
  name: string;
  email: string;
  role: string[];
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  isSuspended?: boolean;
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
  host: User;
  avgRating?: number;
  reviewCount?: number;
  status: "active" | "suspended" | "pending";
  cancellationPolicy: "flexible" | "moderate" | "strict";
}

export interface Booking {
  _id: string;
  listing: Listing;
  guest: User;
  host: User;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "unpaid" | "paid" | "refunded";
  createdAt: string;
}

export interface Review {
  _id: string;
  listing: string;
  author: User;
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
