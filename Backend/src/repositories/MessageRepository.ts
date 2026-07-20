import { Types } from "mongoose";
import Message, { IMessageDocument } from "../models/Message";

export class MessageRepository {
  create(data: Partial<IMessageDocument>) {
    return Message.create(data);
  }

  findByConversation(conversationId: Types.ObjectId) {
    return Message.find({ conversationId }).sort("createdAt");
  }

  markAsRead(conversationId: Types.ObjectId, receiverId: Types.ObjectId) {
    return Message.updateMany(
      { conversationId, receiverId, readAt: null },
      { readAt: new Date() }
    );
  }

  getInbox(userId: Types.ObjectId) {
    return Message.aggregate([
      { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$conversationId", lastMessage: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$lastMessage" } },
    ]);
  }
}

export default new MessageRepository();
