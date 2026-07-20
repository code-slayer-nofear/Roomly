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

  findByIdAndUpdate(id: string | Types.ObjectId, update: Partial<IUserDocument>) {
    return User.findByIdAndUpdate(id, update, { new: true }).select("-passwordHash");
  }

  addToWishlist(userId: Types.ObjectId, listingId: Types.ObjectId) {
    return User.findByIdAndUpdate(userId, { $addToSet: { wishlists: listingId } }, { new: true });
  }

  removeFromWishlist(userId: Types.ObjectId, listingId: Types.ObjectId) {
    return User.findByIdAndUpdate(userId, { $pull: { wishlists: listingId } }, { new: true });
  }
}

export default new UserRepository();
