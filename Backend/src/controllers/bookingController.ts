import { Response, NextFunction } from "express";
import bookingRepository from "../repositories/BookingRepository";
import listingRepository from "../repositories/ListingRepository";
import { AuthRequest } from "../types";

const GUEST_FEE_RATE = 0.12;
const HOST_FEE_RATE = 0.04;

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;
    const listing = await listingRepository.findById(listingId);
    if (!listing || listing.status !== "published") {
      res.status(404).json({ message: "Listing not available" }); return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    if (nights < 1) { res.status(400).json({ message: "Invalid dates" }); return; }

    const conflict = await bookingRepository.findConflict(listingId, checkInDate, checkOutDate);
    if (conflict) { res.status(409).json({ message: "Dates not available" }); return; }

    const subtotal = listing.pricePerNight * nights;
    const guestServiceFee = Math.round(subtotal * GUEST_FEE_RATE);
    const hostServiceFee = Math.round(subtotal * HOST_FEE_RATE);

    const booking = await bookingRepository.create({
      listingId,
      guestId: req.user!._id,
      hostId: listing.hostId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      nights,
      priceBreakdown: { subtotal, guestServiceFee, hostServiceFee, cleaningFee: 0, taxes: 0, total: subtotal + guestServiceFee },
    });

    res.status(201).json(booking);
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
    const isHost = booking.hostId.equals(req.user!._id);
    if (!isGuest && !isHost) { res.status(403).json({ message: "Forbidden" }); return; }
    if (booking.status === "cancelled") { res.status(400).json({ message: "Already cancelled" }); return; }

    booking.status = "cancelled";
    booking.cancelledBy = isGuest ? "guest" : "host";
    await bookingRepository.save(booking);
    res.json(booking);
  } catch (err) { next(err); }
};
