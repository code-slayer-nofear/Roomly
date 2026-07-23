import { Router } from "express";
import { sendMessage, getConversation, getInbox } from "../controllers/messageController";
import { protect } from "../middleware/auth";
import validate from "../middleware/validate";
import { sendMessageSchema } from "../validation/schemas";

const router = Router();

router.use(protect);
router.post("/",   validate(sendMessageSchema), sendMessage);
router.get("/inbox", getInbox);
router.get("/:otherUserId/:listingId", getConversation);

export default router;
