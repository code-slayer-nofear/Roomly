import { Request, Response } from "express";
import { constructWebhookEvent } from "../config/stripe";
import bookingRepository from "../repositories/BookingRepository";
import paymentRepository from "../repositories/PaymentRepository";

export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers["stripe-signature"] as string;

  let event;
  try {
    event = constructWebhookEvent(req.body as Buffer, signature);
  } catch (err: any) {
    res.status(400).json({ message: `Webhook signature verification failed: ${err.message}` });
    return;
  }

  try {
    switch (event.type) {

      case "payment_intent.succeeded": {
        const intent = event.data.object as unknown as { id: string; metadata: { bookingId: string } };
        const { bookingId } = intent.metadata;

        // Mark booking as confirmed + paid
        const booking = await bookingRepository.findById(bookingId);
        if (booking) {
          booking.status        = "confirmed";
          booking.paymentStatus = "paid";
          await bookingRepository.save(booking);
        }

        // Mark payment record as succeeded
        await paymentRepository.updateStatus(intent.id, "succeeded");
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as unknown as { id: string; metadata: { bookingId: string } };
        await paymentRepository.updateStatus(intent.id, "failed");
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as unknown as { payment_intent: string; metadata: { bookingId: string } };
        await paymentRepository.updateStatus(charge.payment_intent, "succeeded");
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};
