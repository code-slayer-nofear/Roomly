import { Types } from "mongoose";
import { Server } from "socket.io";
import notificationRepository from "../repositories/NotificationRepository";

export type NotificationType =
  | "booking_requested"
  | "booking_confirmed"
  | "booking_cancelled"
  | "payment_received"
  | "new_message"
  | "review_received"
  | "review_reminder";

interface NotifyOptions {
  userId: Types.ObjectId;
  type: NotificationType;
  payload: Record<string, unknown>;
  io?: Server;
}

export const notify = async ({ userId, type, payload, io }: NotifyOptions): Promise<void> => {
  const notification = await notificationRepository.create({ userId, type, payload });
  // Push real-time notification to the user's socket room
  io?.to(userId.toString()).emit("notification", notification);
};
