import { Router } from "express";
import { sendMessage, getConversation, getInbox } from "../controllers/messageController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);
router.post("/", sendMessage);
router.get("/inbox", getInbox);
router.get("/:otherUserId/:listingId", getConversation);

export default router;
