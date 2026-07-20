import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User";
import Listing from "../models/Listing";
import Booking from "../models/Booking";
import Review from "../models/Review";
import Message from "../models/Message";

const hash = (p: string) => bcrypt.hash(p, 12);
const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const CITIES = [
  { city: "Austin",     country: "US", coordinates: [-97.7431,  30.2672] as [number, number] },
  { city: "New York",   country: "US", coordinates: [-74.0060,  40.7128] as [number, number] },
  { city: "Paris",      country: "FR", coordinates: [  2.3522,  48.8566] as [number, number] },
  { city: "Tokyo",      country: "JP", coordinates: [139.6917,  35.6895] as [number, number] },
  { city: "Barcelona",  country: "ES", coordinates: [  2.1734,  41.3851] as [number, number] },
  { city: "Lisbon",     country: "PT", coordinates: [ -9.1393,  38.7223] as [number, number] },
  { city: "Cape Town",  country: "ZA", coordinates: [ 18.4241, -33.9249] as [number, number] },
];

const PROPERTY_TYPES = ["apartment", "house", "cabin", "villa", "studio", "loft"];
const ROOM_TYPES     = ["entire_place", "private_room", "shared_room"];
const POLICIES       = ["flexible", "moderate", "strict"] as const;
const AMENITIES_POOL = ["wifi", "pool", "kitchen", "parking", "gym", "air_conditioning", "heating", "washer", "dryer", "tv", "workspace", "hot_tub", "bbq", "fireplace"];
const STREETS        = ["Main St", "Oak Ave", "Sunset Blvd", "Park Rd", "Lake Dr"];

const LISTING_TITLES = [
  "Cozy Cabin with Mountain Views",
  "Modern Downtown Apartment",
  "Beachfront Villa with Private Pool",
  "Charming Studio in the Heart of the City",
  "Luxury Penthouse with Rooftop Terrace",
  "Rustic Farmhouse Retreat",
  "Stylish Loft in Arts District",
  "Peaceful Garden Cottage",
  "Spacious Family Home near the Park",
  "Boutique Apartment with City Views",
  "Secluded Treehouse Escape",
  "Historic Townhouse in Old Town",
  "Minimalist Studio with Great Light",
  "Waterfront Bungalow",
  "Designer Flat near Top Restaurants",
];

const DESCRIPTIONS = [
  "A beautifully designed space perfect for couples or solo travelers. Enjoy stunning views and all modern amenities.",
  "Nestled in the heart of the city, this apartment offers easy access to top attractions, restaurants, and nightlife.",
  "Escape to this tranquil retreat surrounded by nature. Perfect for those looking to unwind and recharge.",
  "A unique and stylish space that blends comfort with character. Every detail has been carefully curated for your stay.",
  "Spacious and bright, this home is ideal for families or groups. Fully equipped kitchen and cozy living areas.",
];

const REVIEW_COMMENTS = [
  "Absolutely loved this place! The host was incredibly welcoming and the space was exactly as described.",
  "Great location and very clean. Would definitely stay here again on my next visit.",
  "The amenities were top-notch and the views were breathtaking. Highly recommend!",
  "A wonderful experience from start to finish. The host went above and beyond to make us feel at home.",
  "Perfect for a weekend getaway. Quiet, comfortable, and beautifully decorated.",
  "Fantastic value for money. The space was even better than the photos suggested.",
  "The check-in process was seamless and the host was very responsive to all our questions.",
  "We had an amazing stay. The neighborhood was charming and everything was within walking distance.",
];

const GUEST_REPLIES = [
  "Of course! Looking forward to hosting you.",
  "Sure, early check-in is possible. Just let me know your arrival time.",
  "The parking is free right in front of the building.",
  "Happy to help! Feel free to ask anything.",
  "Great, see you then! I will leave the keys in the lockbox.",
];

const GUEST_MESSAGES = [
  "Hi! Is your place available for the dates I selected?",
  "Hello! We are a couple looking for a quiet getaway. Does your listing allow early check-in?",
  "Hey, just wanted to confirm the parking situation. Is there free parking nearby?",
  "Hi there! We loved your listing. Can you tell us more about the neighborhood?",
  "Thanks for accepting our booking! We are very excited for our stay.",
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Connected to MongoDB");

  await Promise.all([
    User.deleteMany({}),
    Listing.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Message.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  // ── Users ──────────────────────────────────────────────────────────────────
  const password = await hash("password123");

  const hosts = await User.insertMany([
    { name: "Alice Martin",   email: "alice@roomly.com",   passwordHash: password, role: ["guest", "host"], isVerified: true,  avatarUrl: "https://i.pravatar.cc/150?img=1",  bio: "Superhost with 5 years of experience. I love welcoming travelers from around the world.", address: { city: "Austin",    country: "US" }, payoutInfo: { method: "bank_transfer", accountId: "acct_alice"   } },
    { name: "Carlos Rivera",  email: "carlos@roomly.com",  passwordHash: password, role: ["guest", "host"], isVerified: true,  avatarUrl: "https://i.pravatar.cc/150?img=2",  bio: "Property investor and travel enthusiast. My listings are always spotless.",              address: { city: "Barcelona", country: "ES" }, payoutInfo: { method: "bank_transfer", accountId: "acct_carlos"  } },
    { name: "Yuki Tanaka",    email: "yuki@roomly.com",    passwordHash: password, role: ["guest", "host"], isVerified: true,  avatarUrl: "https://i.pravatar.cc/150?img=3",  bio: "Interior designer turned host. Every space I offer is thoughtfully designed.",           address: { city: "Tokyo",     country: "JP" }, payoutInfo: { method: "bank_transfer", accountId: "acct_yuki"    } },
    { name: "Sophie Dubois",  email: "sophie@roomly.com",  passwordHash: password, role: ["guest", "host"], isVerified: true,  avatarUrl: "https://i.pravatar.cc/150?img=4",  bio: "Parisian local sharing the best of the city. I speak English, French, and Spanish.",    address: { city: "Paris",     country: "FR" }, payoutInfo: { method: "bank_transfer", accountId: "acct_sophie"  } },
    { name: "James Okafor",   email: "james@roomly.com",   passwordHash: password, role: ["guest", "host"], isVerified: true,  avatarUrl: "https://i.pravatar.cc/150?img=5",  bio: "Cape Town native with a passion for hospitality. My home is your home.",                address: { city: "Cape Town", country: "ZA" }, payoutInfo: { method: "bank_transfer", accountId: "acct_james"   } },
  ]);

  const guests = await User.insertMany([
    { name: "Emma Wilson",      email: "emma@roomly.com",   passwordHash: password, role: ["guest"], isVerified: true,  avatarUrl: "https://i.pravatar.cc/150?img=6",  bio: "Avid traveler and food lover. Always looking for unique stays.",              address: { city: "London",        country: "UK" } },
    { name: "Liam Chen",        email: "liam@roomly.com",   passwordHash: password, role: ["guest"], isVerified: true,  avatarUrl: "https://i.pravatar.cc/150?img=7",  bio: "Digital nomad working remotely from different cities every month.",           address: { city: "San Francisco", country: "US" } },
    { name: "Fatima Al-Hassan", email: "fatima@roomly.com", passwordHash: password, role: ["guest"], isVerified: false, avatarUrl: "https://i.pravatar.cc/150?img=8",  bio: "",                                                                            address: { city: "Dubai",         country: "AE" } },
    { name: "Marco Rossi",      email: "marco@roomly.com",  passwordHash: password, role: ["guest"], isVerified: true,  avatarUrl: "https://i.pravatar.cc/150?img=9",  bio: "Architect and design enthusiast. I appreciate well-designed spaces.",         address: { city: "Milan",         country: "IT" } },
    { name: "Priya Sharma",     email: "priya@roomly.com",  passwordHash: password, role: ["guest"], isVerified: true,  avatarUrl: "https://i.pravatar.cc/150?img=10", bio: "Solo traveler exploring the world one city at a time.",                       address: { city: "Mumbai",        country: "IN" } },
  ]);

  console.log(`Created ${hosts.length} hosts and ${guests.length} guests`);

  // ── Listings ───────────────────────────────────────────────────────────────
  const listingsData = LISTING_TITLES.map((title, i) => {
    const host     = hosts[i % hosts.length];
    const location = CITIES[i % CITIES.length];
    const price    = randomBetween(60, 400);
    const amenities = AMENITIES_POOL.filter(() => Math.random() > 0.5).slice(0, randomBetween(4, 8));

    return {
      hostId: host._id,
      title,
      description: DESCRIPTIONS[i % DESCRIPTIONS.length],
      propertyType: PROPERTY_TYPES[i % PROPERTY_TYPES.length],
      roomType: ROOM_TYPES[i % ROOM_TYPES.length],
      location: {
        address: `${randomBetween(1, 999)} ${pick(STREETS)}`,
        city: location.city,
        country: location.country,
        geo: { type: "Point" as const, coordinates: location.coordinates },
      },
      pricePerNight: price,
      currency: "USD",
      maxGuests: randomBetween(2, 8),
      bedrooms: randomBetween(1, 4),
      beds: randomBetween(1, 5),
      bathrooms: randomBetween(1, 3),
      amenities: amenities.length ? amenities : ["wifi", "kitchen"],
      photos: [
        `https://picsum.photos/seed/${i + 1}/800/600`,
        `https://picsum.photos/seed/${i + 10}/800/600`,
        `https://picsum.photos/seed/${i + 20}/800/600`,
      ],
      houseRules: ["No smoking", "No parties", "Check-in after 3pm"],
      cancellationPolicy: POLICIES[i % POLICIES.length],
      avgRating: 0,
      reviewCount: 0,
      status: "published" as const,
    };
  });

  const listings = await Listing.insertMany(listingsData);
  console.log(`Created ${listings.length} listings`);

  // ── Bookings ───────────────────────────────────────────────────────────────
  const GUEST_FEE_RATE = 0.12;
  const HOST_FEE_RATE  = 0.04;
  const bookingStatuses = ["completed", "completed", "confirmed", "pending", "cancelled"] as const;

  const bookingsData = listings.slice(0, 12).map((listing, i) => {
    const guest    = guests[i % guests.length];
    const checkIn  = new Date(2025, i % 12, randomBetween(1, 15));
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + randomBetween(2, 7));
    const nights         = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const subtotal       = listing.pricePerNight * nights;
    const guestServiceFee = Math.round(subtotal * GUEST_FEE_RATE);
    const hostServiceFee  = Math.round(subtotal * HOST_FEE_RATE);
    const cleaningFee     = 50;
    const taxes           = Math.round(subtotal * 0.08);
    const status          = bookingStatuses[i % bookingStatuses.length];

    return {
      listingId: listing._id,
      guestId:   guest._id,
      hostId:    listing.hostId,
      checkIn,
      checkOut,
      guests: { adults: randomBetween(1, 3), children: randomBetween(0, 2), infants: 0 },
      nights,
      priceBreakdown: { subtotal, guestServiceFee, hostServiceFee, cleaningFee, taxes, total: subtotal + guestServiceFee + cleaningFee },
      status,
      paymentStatus: (status === "completed" || status === "confirmed" ? "paid" : "unpaid") as "paid" | "unpaid",
      cancelledBy: status === "cancelled" ? pick(["guest", "host"]) : undefined,
    };
  });

  const bookings = await Booking.insertMany(bookingsData);
  console.log(`Created ${bookings.length} bookings`);

  // ── Reviews (completed bookings only) ─────────────────────────────────────
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const reviewsData: object[] = [];
  const catScore = () => randomBetween(3, 5);

  for (const booking of completedBookings) {
    reviewsData.push({
      bookingId: booking._id,
      listingId: booking.listingId,
      authorId:  booking.guestId,
      targetId:  booking.hostId,
      type:      "guest_to_host",
      rating:    randomBetween(3, 5),
      categories: { cleanliness: catScore(), communication: catScore(), checkIn: catScore(), accuracy: catScore(), location: catScore(), value: catScore() },
      comment:   pick(REVIEW_COMMENTS),
    });

    reviewsData.push({
      bookingId: booking._id,
      listingId: booking.listingId,
      authorId:  booking.hostId,
      targetId:  booking.guestId,
      type:      "host_to_guest",
      rating:    randomBetween(4, 5),
      categories: { cleanliness: catScore(), communication: catScore(), checkIn: catScore(), accuracy: catScore(), location: catScore(), value: catScore() },
      comment:   "Great guest! Very respectful of the space and easy to communicate with.",
    });
  }

  await Review.insertMany(reviewsData);
  console.log(`Created ${reviewsData.length} reviews`);

  // Update avgRating + reviewCount on each listing
  for (const booking of completedBookings) {
    const [result] = await Review.aggregate([
      { $match: { listingId: booking.listingId, type: "guest_to_host" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (result) {
      await Listing.findByIdAndUpdate(booking.listingId, {
        avgRating:   parseFloat(result.avg.toFixed(1)),
        reviewCount: result.count,
      });
    }
  }
  console.log("Updated listing ratings");

  // ── Messages ───────────────────────────────────────────────────────────────
  const messagesData: object[] = [];

  for (let i = 0; i < 10; i++) {
    const booking    = bookings[i % bookings.length];
    const guestId    = booking.guestId.toString();
    const hostId     = booking.hostId.toString();
    const listingId  = booking.listingId.toString();
    const sorted     = [guestId, hostId].sort().join("_");
    const hex        = crypto.createHash("md5").update(`${sorted}_${listingId}`).digest("hex").slice(0, 24);
    const conversationId = new mongoose.Types.ObjectId(hex);

    messagesData.push(
      {
        conversationId,
        senderId:   booking.guestId,
        receiverId: booking.hostId,
        listingId:  booking.listingId,
        text:       pick(GUEST_MESSAGES),
        createdAt:  new Date(Date.now() - 1000 * 60 * 60 * 24 * randomBetween(1, 10)),
      },
      {
        conversationId,
        senderId:   booking.hostId,
        receiverId: booking.guestId,
        listingId:  booking.listingId,
        text:       pick(GUEST_REPLIES),
        createdAt:  new Date(Date.now() - 1000 * 60 * 60 * randomBetween(1, 23)),
      }
    );
  }

  await Message.insertMany(messagesData);
  console.log(`Created ${messagesData.length} messages`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n✅ Seed complete!");
  console.log("─────────────────────────────────────────");
  console.log("All accounts password: password123\n");
  console.log("Hosts:");
  hosts.forEach((h) => console.log(`  ${h.email}`));
  console.log("\nGuests:");
  guests.forEach((g) => console.log(`  ${g.email}`));
  console.log("─────────────────────────────────────────");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
