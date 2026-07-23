import { Request, Response } from "express";
import { constructWebhookEvent } from "../config/stripe";
import bookingRepository from "../repositories/BookingRepository";
import paymentRepository from "../repositories/PaymentRepository";
import userRepository from "../repositories/UserRepository";
import listingRepository from "../repositories/ListingRepository";
import { notify } from "../services/notificationService";
import { sendBookingConfirmedEmail } from "../services/emailService";

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

          // Notify guest that booking is confirmed
          void notify({
            userId:  booking.guestId,
            type:    "booking_confirmed",
            payload: { bookingId: booking._id, listingId: booking.listingId },
          });

          // Notify guest that payment was received
          void notify({
            userId:  booking.guestId,
            type:    "payment_received",
            payload: { bookingId: booking._id, amount: booking.priceBreakdown.total },
          });

          // Email guest booking confirmation + receipt
          const [guest, listing] = await Promise.all([
            userRepository.findById(booking.guestId),
            listingRepository.findById(booking.listingId.toString()),
          ]);
          if (guest?.email) {
            sendBookingConfirmedEmail({
              guestEmail:   guest.email,
              guestName:    guest.name,
              listingTitle: listing?.title ?? "your listing",
              checkIn:      booking.checkIn.toDateString(),
              checkOut:     booking.checkOut.toDateString(),
              nights:       booking.nights,
              subtotal:     booking.priceBreakdown.subtotal,
              serviceFee:   booking.priceBreakdown.guestServiceFee,
              total:        booking.priceBreakdown.total,
            });
          }
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
        const charge = event.data.object as unknown as { payment_intent: string };
        await paymentRepository.updateStatus(charge.payment_intent, "succeeded");
        // Also mark the booking as refunded
        const refundedBooking = await bookingRepository.findByPaymentIntent(charge.payment_intent);
        if (refundedBooking) {
          refundedBooking.paymentStatus = "refunded";
          await bookingRepository.save(refundedBooking);
        }
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
