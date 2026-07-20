import { Router } from "express";
import { createBooking, getMyBookings, getHostBookings, cancelBooking } from "../controllers/bookingController";
import { protect, requireRole } from "../middleware/auth";

const router = Router();

router.use(protect);
router.post("/", createBooking);
router.get("/my", getMyBookings);
router.get("/host", requireRole("host", "admin"), getHostBookings);
router.patch("/:id/cancel", cancelBooking);

export default router;
