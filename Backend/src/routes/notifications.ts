import { Router } from "express";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "../controllers/notificationController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);
router.get("/",              getNotifications);
router.get("/unread-count",  getUnreadCount);
router.patch("/read-all",    markAllAsRead);
router.patch("/:id/read",    markAsRead);

export default router;
