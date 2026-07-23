import { Response, NextFunction } from "express";
import notificationRepository from "../repositories/NotificationRepository";
import { AuthRequest } from "../types";

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await notificationRepository.findByUser(req.user!._id);
    res.json(notifications);
  } catch (err) { next(err); }
};

export const getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await notificationRepository.getUnreadCount(req.user!._id);
    res.json({ count });
  } catch (err) { next(err); }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notification = await notificationRepository.markAsRead(req.user!._id, req.params.id);
    if (!notification) { res.status(404).json({ message: "Notification not found" }); return; }
    res.json(notification);
  } catch (err) { next(err); }
};

export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await notificationRepository.markAllAsRead(req.user!._id);
    res.json({ message: "All notifications marked as read" });
  } catch (err) { next(err); }
};
