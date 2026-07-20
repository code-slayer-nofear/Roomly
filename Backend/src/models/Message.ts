import mongoose, { Schema, Document, Model } from "mongoose";
import { IMessage } from "../types";

export interface IMessageDocument extends IMessage, Document {}

const messageSchema = new Schema<IMessageDocument>({
  conversationId: { type: Schema.Types.ObjectId, required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  listingId: { type: Schema.Types.ObjectId, ref: "Listing" },
  text: { type: String, required: true },
  readAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMessageDocument, Model<IMessageDocument>>("Message", messageSchema);
