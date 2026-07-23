import { Types } from "mongoose";
import Notification, { INotificationDocument } from "../models/Notification";

export class NotificationRepository {
  create(data: Partial<INotificationDocument>) {
    return Notification.create(data);
  }

  findByUser(userId: Types.ObjectId) {
    return Notification.find({ userId }).sort("-createdAt").limit(50);
  }

  markAsRead(userId: Types.ObjectId, notificationId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  }

  markAllAsRead(userId: Types.ObjectId) {
    return Notification.updateMany({ userId, isRead: false }, { isRead: true });
  }

  getUnreadCount(userId: Types.ObjectId) {
    return Notification.countDocuments({ userId, isRead: false });
  }
}

export default new NotificationRepository();
