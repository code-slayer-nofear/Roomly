import { Router } from "express";
import { createReview, getListingReviews } from "../controllers/reviewController";
import { protect } from "../middleware/auth";
import validate from "../middleware/validate";
import { createReviewSchema } from "../validation/schemas";

const router = Router();

router.post("/", protect, validate(createReviewSchema), createReview);
router.get("/listing/:listingId", getListingReviews);

export default router;
