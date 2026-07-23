import { Router } from "express";
import { createBooking, getMyBookings, getHostBookings, cancelBooking, initiatePayment } from "../controllers/bookingController";
import { protect, requireRole } from "../middleware/auth";
import validate from "../middleware/validate";
import { createBookingSchema } from "../validation/schemas";

const router = Router();

router.use(protect);
router.post("/",            validate(createBookingSchema), createBooking);
router.get("/my",               getMyBookings);
router.get("/host",             requireRole("host", "admin"), getHostBookings);
router.post("/:id/pay",         initiatePayment);
router.patch("/:id/cancel",     cancelBooking);

export default router;
