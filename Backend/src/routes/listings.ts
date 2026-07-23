import { Router } from "express";
import { createListing, getListings, getListing, updateListing, deleteListing, uploadPhotos, deletePhoto } from "../controllers/listingController";
import { protect, requireRole } from "../middleware/auth";
import upload from "../middleware/upload";
import validate from "../middleware/validate";
import { createListingSchema, updateListingSchema } from "../validation/schemas";

const router = Router();

router.get("/",     getListings);
router.get("/:id",  getListing);
router.post("/",    protect, requireRole("host", "admin"), validate(createListingSchema), createListing);
router.put("/:id",  protect, requireRole("host", "admin"), validate(updateListingSchema), updateListing);
router.delete("/:id", protect, requireRole("host", "admin"), deleteListing);

// Upload up to 10 photos for a listing
router.post("/:id/photos",        protect, requireRole("host", "admin"), upload.array("photos", 10), uploadPhotos);
// Delete a single photo by URL
router.delete("/:id/photos",      protect, requireRole("host", "admin"), deletePhoto);

export default router;
