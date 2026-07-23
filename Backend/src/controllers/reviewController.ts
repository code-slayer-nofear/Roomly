import { Response, NextFunction } from "express";
import reviewRepository from "../repositories/ReviewRepository";
import bookingRepository from "../repositories/BookingRepository";
import listingRepository from "../repositories/ListingRepository";
import { notify } from "../services/notificationService";
import { AuthRequest } from "../types";

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId, rating, categories, comment, type } = req.body;
    const booking = await bookingRepository.findById(bookingId);
    if (!booking || booking.status !== "completed") {
      res.status(400).json({ message: "Can only review completed bookings" }); return;
    }

    const isGuest = booking.guestId.equals(req.user!._id);
    const isHost = booking.hostId.equals(req.user!._id);
    if (!isGuest && !isHost) { res.status(403).json({ message: "Forbidden" }); return; }

    const existing = await reviewRepository.findOne(bookingId, req.user!._id);
    if (existing) { res.status(409).json({ message: "Already reviewed" }); return; }

    const review = await reviewRepository.create({
      bookingId,
      listingId: booking.listingId,
      authorId: req.user!._id,
      targetId: isGuest ? booking.hostId : booking.guestId,
      type,
      rating,
      categories,
      comment,
    });

    const { avg, count } = await reviewRepository.getAverageRating(booking.listingId);
    await listingRepository.updateRating(booking.listingId, parseFloat(avg.toFixed(1)), count);

    // Notify the review target
    void notify({
      userId:  review.targetId,
      type:    "review_received",
      payload: { reviewId: review._id, listingId: booking.listingId, rating },
      io:      req.app.get("io"),
    });

    res.status(201).json(review);
  } catch (err) { next(err); }
};

export const getListingReviews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviews = await reviewRepository.findByListing(req.params.listingId as any);
    res.json(reviews);
  } catch (err) { next(err); }
};
