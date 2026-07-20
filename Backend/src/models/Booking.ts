import mongoose, { Schema, Document, Model } from "mongoose";
import { IBooking } from "../types";

export interface IBookingDocument extends IBooking, Document {}

const bookingSchema = new Schema<IBookingDocument>({
  listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
  guestId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { adults: Number, children: Number, infants: Number },
  nights: Number,
  priceBreakdown: {
    subtotal: Number,
    guestServiceFee: Number,
    hostServiceFee: Number,
    cleaningFee: Number,
    taxes: Number,
    total: Number,
  },
  status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
  paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
  paymentIntentId: String,
  cancelledBy: String,
  createdAt: { type: Date, default: Date.now },
});

bookingSchema.index({ listingId: 1, checkIn: 1, checkOut: 1 });

export default mongoose.model<IBookingDocument, Model<IBookingDocument>>("Booking", bookingSchema);
