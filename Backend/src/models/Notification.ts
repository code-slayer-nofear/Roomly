import mongoose, { Schema, Document, Model } from "mongoose";
import { INotification } from "../types";

export interface INotificationDocument extends INotification, Document {}

const notificationSchema = new Schema<INotificationDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<INotificationDocument, Model<INotificationDocument>>("Notification", notificationSchema);
