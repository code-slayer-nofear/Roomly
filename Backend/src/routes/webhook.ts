import { Router } from "express";
import express from "express";
import { handleStripeWebhook } from "../controllers/webhookController";

const router = Router();

// Stripe requires the raw body — must use express.raw() here, NOT express.json()
router.post("/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

export default router;
