import { Types } from "mongoose";
import Review, { IReviewDocument } from "../models/Review";

export class ReviewRepository {
  findOne(bookingId: string, authorId: Types.ObjectId) {
    return Review.findOne({ bookingId, authorId });
  }

  create(data: Partial<IReviewDocument>) {
    return Review.create(data);
  }

  findByListing(listingId: Types.ObjectId) {
    return Review.find({ listingId, type: "guest_to_host" })
      .populate("authorId", "name avatarUrl")
      .sort("-createdAt");
  }

  getAverageRating(listingId: Types.ObjectId): Promise<{ avg: number; count: number }> {
    return Review.aggregate([
      { $match: { listingId, type: "guest_to_host" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]).then(([result]) => result ?? { avg: 0, count: 0 });
  }
}

export default new ReviewRepository();
