import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const FROM = process.env.EMAIL_FROM!;

const send = (to: string, subject: string, html: string): void => {
  void sgMail.send({ to, from: FROM, subject, html }).catch((err) =>
    console.error("Email send error:", err?.response?.body ?? err.message)
  );
};

// ─── Email types ─────────────────────────────────────────────────────────────

export interface BookingRequestedData {
  hostEmail:    string;
  hostName:     string;
  guestName:    string;
  listingTitle: string;
  checkIn:      string;
  checkOut:     string;
  nights:       number;
  total:        number;
}

export interface BookingConfirmedData {
  guestEmail:   string;
  guestName:    string;
  listingTitle: string;
  checkIn:      string;
  checkOut:     string;
  nights:       number;
  subtotal:     number;
  serviceFee:   number;
  total:        number;
}

export interface BookingCancelledData {
  email:        string;
  name:         string;
  listingTitle: string;
  checkIn:      string;
  checkOut:     string;
  refunded:     boolean;
  total:        number;
}

// ─── Senders ─────────────────────────────────────────────────────────────────

export const sendBookingRequestedEmail = (d: BookingRequestedData): void =>
  send(
    d.hostEmail,
    "New booking request — Roomly",
    `<p>Hi ${d.hostName},</p>
     <p><strong>${d.guestName}</strong> has requested to book <strong>${d.listingTitle}</strong>.</p>
     <ul>
       <li>Check-in: ${d.checkIn}</li>
       <li>Check-out: ${d.checkOut}</li>
       <li>Nights: ${d.nights}</li>
       <li>Total: $${d.total}</li>
     </ul>
     <p>Log in to Roomly to accept or decline.</p>`
  );

export const sendBookingConfirmedEmail = (d: BookingConfirmedData): void =>
  send(
    d.guestEmail,
    "Your booking is confirmed — Roomly",
    `<p>Hi ${d.guestName},</p>
     <p>Your booking for <strong>${d.listingTitle}</strong> is confirmed!</p>
     <ul>
       <li>Check-in: ${d.checkIn}</li>
       <li>Check-out: ${d.checkOut}</li>
       <li>Nights: ${d.nights}</li>
     </ul>
     <h3>Receipt</h3>
     <ul>
       <li>Subtotal: $${d.subtotal}</li>
       <li>Service fee: $${d.serviceFee}</li>
       <li><strong>Total charged: $${d.total}</strong></li>
     </ul>
     <p>Have a great stay!</p>`
  );

export const sendBookingCancelledEmail = (d: BookingCancelledData): void =>
  send(
    d.email,
    "Booking cancelled — Roomly",
    `<p>Hi ${d.name},</p>
     <p>Your booking for <strong>${d.listingTitle}</strong> has been cancelled.</p>
     <ul>
       <li>Check-in: ${d.checkIn}</li>
       <li>Check-out: ${d.checkOut}</li>
     </ul>
     ${d.refunded ? `<p>A refund of <strong>$${d.total}</strong> has been initiated and should appear within 5–10 business days.</p>` : ""}
     <p>If you have questions, contact Roomly support.</p>`
  );
