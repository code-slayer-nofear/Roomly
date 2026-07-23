import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../types";

export interface IUserDocument extends IUser, Document {}

interface IUserModel extends Model<IUserDocument> {}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: String,
    authProvider: { type: String, default: "local" },
    avatarUrl: String,
    phone: String,
    role: { type: [String], default: ["guest"] },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    bio: String,
    address: { country: String, city: String },
    wishlists: [{ type: Schema.Types.ObjectId, ref: "Listing" }],
    payoutInfo: { method: String, accountId: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash!);
};

export default mongoose.model<IUserDocument, IUserModel>("User", userSchema);
