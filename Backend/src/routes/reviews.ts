import { Router } from "express";
import { createReview, getListingReviews } from "../controllers/reviewController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/", protect, createReview);
router.get("/listing/:listingId", getListingReviews);

export default router;
