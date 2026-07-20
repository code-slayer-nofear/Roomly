import { Router } from "express";
import { createListing, getListings, getListing, updateListing, deleteListing } from "../controllers/listingController";
import { protect, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", getListings);
router.get("/:id", getListing);
router.post("/", protect, requireRole("host", "admin"), createListing);
router.put("/:id", protect, requireRole("host", "admin"), updateListing);
router.delete("/:id", protect, requireRole("host", "admin"), deleteListing);

export default router;
