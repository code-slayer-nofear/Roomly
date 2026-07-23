import { Types } from "mongoose";
import Booking, { IBookingDocument } from "../models/Booking";

export class BookingRepository {
  findConflict(listingId: string, checkIn: Date, checkOut: Date) {
    return Booking.findOne({
      listingId,
      status: { $in: ["pending", "confirmed"] },
      $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }],
    });
  }

  create(data: Partial<IBookingDocument>) {
    return Booking.create(data);
  }

  findByGuest(guestId: Types.ObjectId) {
    return Booking.find({ guestId })
      .populate("listingId", "title photos location pricePerNight")
      .sort("-createdAt");
  }

  findByHost(hostId: Types.ObjectId) {
    return Booking.find({ hostId })
      .populate("listingId", "title photos")
      .populate("guestId", "name avatarUrl")
      .sort("-createdAt");
  }

  findById(id: string) {
    return Booking.findById(id);
  }

  findByPaymentIntent(paymentIntentId: string) {
    return Booking.findOne({ paymentIntentId });
  }

  save(booking: IBookingDocument) {
    return booking.save();
  }

  // Marks all confirmed bookings whose checkOut has passed as completed
  completeExpired() {
    return Booking.updateMany(
      { status: "confirmed", checkOut: { $lte: new Date() } },
      { status: "completed" }
    );
  }

  getAnalytics() {
    return Promise.all([
      // Total GMV — sum of all paid booking totals
      Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, gmv: { $sum: "$priceBreakdown.total" } } },
      ]),
      // Bookings per day for the last 30 days
      Booking.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "cancelled" }),
    ]).then(([gmvResult, bookingsPerDay, total, confirmed, cancelled]) => ({
      gmv: gmvResult[0]?.gmv ?? 0,
      bookingsPerDay,
      total,
      confirmed,
      cancelled,
    }));
  }
}

export default new BookingRepository();
