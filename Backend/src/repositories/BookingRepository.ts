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

  save(booking: IBookingDocument) {
    return booking.save();
  }
}

export default new BookingRepository();
