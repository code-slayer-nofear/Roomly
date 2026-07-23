import { FilterQuery, Types } from "mongoose";
import User, { IUserDocument } from "../models/User";

export class UserRepository {
  findById(id: string | Types.ObjectId) {
    return User.findById(id).select("-passwordHash");
  }

  findByEmail(email: string) {
    return User.findOne({ email });
  }

  create(data: { name: string; email: string; passwordHash: string }) {
    return User.create(data);
  }

  findOrCreateOAuth(data: { email: string; name: string; avatarUrl?: string; authProvider: string }) {
    return User.findOneAndUpdate(
      { email: data.email },
      { $setOnInsert: { ...data, isVerified: true } },
      { upsert: true, new: true }
    ).select("-passwordHash");
  }

  findByIdAndUpdate(id: string | Types.ObjectId, update: Partial<IUserDocument>) {
    return User.findByIdAndUpdate(id, update, { new: true }).select("-passwordHash");
  }

  addToWishlist(userId: Types.ObjectId, listingId: Types.ObjectId) {
    return User.findByIdAndUpdate(userId, { $addToSet: { wishlists: listingId } }, { new: true });
  }

  removeFromWishlist(userId: Types.ObjectId, listingId: Types.ObjectId) {
    return User.findByIdAndUpdate(userId, { $pull: { wishlists: listingId } }, { new: true });
  }

  getWishlist(userId: Types.ObjectId) {
    return User.findById(userId)
      .select("wishlists")
      .populate("wishlists", "title photos location pricePerNight avgRating reviewCount status");
  }

  findAll(page: number, limit: number) {
    return User.find()
      .select("-passwordHash")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit);
  }

  setSuspended(id: string, isSuspended: boolean) {
    return User.findByIdAndUpdate(id, { isSuspended }, { new: true }).select("-passwordHash");
  }
}

export default new UserRepository();
