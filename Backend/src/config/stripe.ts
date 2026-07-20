import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createPaymentIntent = async (
  amountInCents: number,
  currency: string,
  metadata: Record<string, string>
): Promise<Stripe.PaymentIntent> => {
  return stripe.paymentIntents.create({
    amount: amountInCents,
    currency: currency.toLowerCase(),
    metadata,
    automatic_payment_methods: { enabled: true },
  });
};

export const refundPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.Refund> => {
  return stripe.refunds.create({ payment_intent: paymentIntentId });
};

export const constructWebhookEvent = (
  payload: Buffer,
  signature: string
): Stripe.Event => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
};

export default stripe;
