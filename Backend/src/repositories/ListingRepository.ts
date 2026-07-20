import { FilterQuery, Types } from "mongoose";
import Listing, { IListingDocument } from "../models/Listing";

export interface ListingFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  amenities?: string[];
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export class ListingRepository {
  findMany(filters: ListingFilters) {
    const { city, minPrice, maxPrice, guests, amenities, lat, lng, radius = 50, page = 1, limit = 20 } = filters;
    const query: FilterQuery<IListingDocument> = { status: "published" };

    if (city) query["location.city"] = new RegExp(city, "i");
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.pricePerNight = {};
      if (minPrice !== undefined) query.pricePerNight.$gte = minPrice;
      if (maxPrice !== undefined) query.pricePerNight.$lte = maxPrice;
    }
    if (guests) query.maxGuests = { $gte: guests };
    if (amenities?.length) query.amenities = { $all: amenities };
    if (lat !== undefined && lng !== undefined) {
      query["location.geo"] = {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radius * 1000,
        },
      };
    }

    return Listing.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-availability");
  }

  findById(id: string) {
    return Listing.findById(id).populate("hostId", "name avatarUrl bio createdAt");
  }

  create(data: Partial<IListingDocument>) {
    return Listing.create(data);
  }

  findByIdAndUpdate(id: string, hostId: Types.ObjectId, data: Partial<IListingDocument>) {
    return Listing.findOneAndUpdate({ _id: id, hostId }, data, { new: true, runValidators: true });
  }

  findByIdAndDelete(id: string, hostId: Types.ObjectId) {
    return Listing.findOneAndDelete({ _id: id, hostId });
  }

  updateRating(listingId: Types.ObjectId, avgRating: number, reviewCount: number) {
    return Listing.findByIdAndUpdate(listingId, { avgRating, reviewCount });
  }
}

export default new ListingRepository();
