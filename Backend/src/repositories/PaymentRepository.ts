import { Types } from "mongoose";
import Payment, { IPaymentDocument } from "../models/Payment";

export class PaymentRepository {
  create(data: Partial<IPaymentDocument>) {
    return Payment.create(data);
  }

  findByBooking(bookingId: Types.ObjectId | string) {
    return Payment.find({ bookingId }).sort("-createdAt");
  }

  findByProviderRef(providerRef: string) {
    return Payment.findOne({ providerRef });
  }

  updateStatus(providerRef: string, status: "pending" | "succeeded" | "failed") {
    return Payment.findOneAndUpdate({ providerRef }, { status }, { new: true });
  }
}

export default new PaymentRepository();
