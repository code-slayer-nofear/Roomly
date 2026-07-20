import mongoose, { Schema, Document, Model } from "mongoose";
import { IListing } from "../types";

export interface IListingDocument extends IListing, Document {}

const listingSchema = new Schema<IListingDocument>(
  {
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    propertyType: String,
    roomType: String,
    location: {
      address: String,
      city: String,
      country: String,
      geo: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number] },
      },
    },
    pricePerNight: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    maxGuests: Number,
    bedrooms: Number,
    beds: Number,
    bathrooms: Number,
    amenities: [String],
    photos: [String],
    houseRules: [String],
    cancellationPolicy: { type: String, enum: ["flexible", "moderate", "strict"], default: "flexible" },
    availability: [
      {
        date: Date,
        isBlocked: { type: Boolean, default: false },
        priceOverride: Number,
      },
    ],
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published", "suspended"], default: "draft" },
  },
  { timestamps: true }
);

listingSchema.index({ "location.geo": "2dsphere" });
listingSchema.index({ "location.city": 1, status: 1 });

export default mongoose.model<IListingDocument, Model<IListingDocument>>("Listing", listingSchema);
