import mongoose, { Schema, Document, Model } from "mongoose";
import { IPayment } from "../types";

export interface IPaymentDocument extends IPayment, Document {}

const paymentSchema = new Schema<IPaymentDocument>({
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  type: { type: String, enum: ["charge", "payout", "refund"], required: true },
  status: { type: String, enum: ["pending", "succeeded", "failed"], default: "pending" },
  provider: { type: String, default: "stripe" },
  providerRef: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPaymentDocument, Model<IPaymentDocument>>("Payment", paymentSchema);
