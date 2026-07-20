import { Router } from "express";
import { toggleWishlist, getWishlist } from "../controllers/userController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);
router.get("/wishlist",                 getWishlist);
router.post("/wishlist/:listingId",     toggleWishlist);

export default router;
