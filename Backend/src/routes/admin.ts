import { Router } from "express";
import { protect, requireRole } from "../middleware/auth";
import { getUsers, suspendUser, unsuspendUser, getListings, approveListing, suspendListing, getAnalytics } from "../controllers/adminController";

const router = Router();

router.use(protect, requireRole("admin"));

// Users
router.get("/users",                    getUsers);
router.patch("/users/:id/suspend",      suspendUser);
router.patch("/users/:id/unsuspend",    unsuspendUser);

// Listings
router.get("/listings",                 getListings);
router.patch("/listings/:id/approve",   approveListing);
router.patch("/listings/:id/suspend",   suspendListing);

// Analytics
router.get("/analytics",                getAnalytics);

export default router;
