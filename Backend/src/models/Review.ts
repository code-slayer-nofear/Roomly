import mongoose, { Schema, Document, Model } from "mongoose";
import { IReview } from "../types";

export interface IReviewDocument extends IReview, Document {}

const reviewSchema = new Schema<IReviewDocument>({
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  targetId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["guest_to_host", "host_to_guest"], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  categories: {
    cleanliness: Number,
    communication: Number,
    checkIn: Number,
    accuracy: Number,
    location: Number,
    value: Number,
  },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

reviewSchema.index({ listingId: 1 });

export default mongoose.model<IReviewDocument, Model<IReviewDocument>>("Review", reviewSchema);
