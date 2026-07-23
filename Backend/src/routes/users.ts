import { Router } from "express";
import { getMe, updateMe, getUserProfile, toggleWishlist, getWishlist } from "../controllers/userController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/me",                    protect, getMe);
router.patch("/me",                  protect, updateMe);
router.get("/:id",                   getUserProfile);
router.get("/wishlist",              protect, getWishlist);
router.post("/wishlist/:listingId",  protect, toggleWishlist);

export default router;
