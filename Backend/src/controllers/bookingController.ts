import { Response, NextFunction } from "express";
import bookingRepository from "../repositories/BookingRepository";
import listingRepository from "../repositories/ListingRepository";
import paymentRepository from "../repositories/PaymentRepository";
import { createPaymentIntent, refundPaymentIntent } from "../config/stripe";
import { AuthRequest } from "../types";

const GUEST_FEE_RATE = 0.12;
const HOST_FEE_RATE  = 0.04;

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;
    const listing = await listingRepository.findById(listingId);
    if (!listing || listing.status !== "published") {
      res.status(404).json({ message: "Listing not available" }); return;
    }

    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    if (nights < 1) { res.status(400).json({ message: "Invalid dates" }); return; }

    const conflict = await bookingRepository.findConflict(listingId, checkInDate, checkOutDate);
    if (conflict) { res.status(409).json({ message: "Dates not available" }); return; }

    const subtotal        = listing.pricePerNight * nights;
    const guestServiceFee = Math.round(subtotal * GUEST_FEE_RATE);
    const hostServiceFee  = Math.round(subtotal * HOST_FEE_RATE);
    const total           = subtotal + guestServiceFee;

    const booking = await bookingRepository.create({
      listingId,
      guestId: req.user!._id,
      hostId:  listing.hostId,
      checkIn:  checkInDate,
      checkOut: checkOutDate,
      guests,
      nights,
      priceBreakdown: { subtotal, guestServiceFee, hostServiceFee, cleaningFee: 0, taxes: 0, total },
    });

    res.status(201).json(booking);
  } catch (err) { next(err); }
};

// Creates a Stripe PaymentIntent for a pending booking and returns the clientSecret to the frontend
export const initiatePayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await bookingRepository.findById(req.params.id);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }
    if (!booking.guestId.equals(req.user!._id)) { res.status(403).json({ message: "Forbidden" }); return; }
    if (booking.paymentStatus === "paid") { res.status(400).json({ message: "Booking already paid" }); return; }

    const amountInCents = Math.round(booking.priceBreakdown.total * 100);

    const intent = await createPaymentIntent(amountInCents, booking.priceBreakdown ? "usd" : "usd", {
      bookingId: booking._id.toString(),
      guestId:   booking.guestId.toString(),
      hostId:    booking.hostId.toString(),
    });

    // Persist the paymentIntentId on the booking
    booking.paymentIntentId = intent.id;
    await bookingRepository.save(booking);

    // Create a pending payment record
    await paymentRepository.create({
      bookingId:   booking._id,
      amount:      booking.priceBreakdown.total,
      currency:    "USD",
      type:        "charge",
      status:      "pending",
      providerRef: intent.id,
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) { next(err); }
};

export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookings = await bookingRepository.findByGuest(req.user!._id);
    res.json(bookings);
  } catch (err) { next(err); }
};

export const getHostBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookings = await bookingRepository.findByHost(req.user!._id);
    res.json(bookings);
  } catch (err) { next(err); }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await bookingRepository.findById(req.params.id);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }

    const isGuest = booking.guestId.equals(req.user!._id);
    const isHost  = booking.hostId.equals(req.user!._id);
    if (!isGuest && !isHost) { res.status(403).json({ message: "Forbidden" }); return; }
    if (booking.status === "cancelled") { res.status(400).json({ message: "Already cancelled" }); return; }

    // Issue Stripe refund if the booking was paid
    if (booking.paymentStatus === "paid" && booking.paymentIntentId) {
      await refundPaymentIntent(booking.paymentIntentId);
      await paymentRepository.create({
        bookingId:   booking._id,
        amount:      booking.priceBreakdown.total,
        currency:    "USD",
        type:        "refund",
        status:      "pending",
        providerRef: booking.paymentIntentId,
      });
      booking.paymentStatus = "refunded";
    }

    booking.status      = "cancelled";
    booking.cancelledBy = isGuest ? "guest" : "host";
    await bookingRepository.save(booking);
    res.json(booking);
  } catch (err) { next(err); }
};
