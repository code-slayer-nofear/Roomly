import { Response, NextFunction } from "express";
import crypto from "crypto";
import mongoose, { Types } from "mongoose";
import messageRepository from "../repositories/MessageRepository";
import { AuthRequest } from "../types";

const getConversationId = (userId1: Types.ObjectId, userId2: string, listingId: string): Types.ObjectId => {
  const sorted = [userId1.toString(), userId2].sort().join("_");
  const hex = crypto.createHash("md5").update(`${sorted}_${listingId}`).digest("hex").slice(0, 24);
  return new mongoose.Types.ObjectId(hex);
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { receiverId, listingId, text } = req.body;
    const conversationId = getConversationId(req.user!._id, receiverId, listingId);
    const message = await messageRepository.create({
      conversationId,
      senderId: req.user!._id,
      receiverId,
      listingId,
      text,
    });
    req.app.get("io")?.to(receiverId).emit("new_message", message);
    res.status(201).json(message);
  } catch (err) { next(err); }
};

export const getConversation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { otherUserId, listingId } = req.params;
    const conversationId = getConversationId(req.user!._id, otherUserId, listingId);
    const messages = await messageRepository.findByConversation(conversationId);
    await messageRepository.markAsRead(conversationId, req.user!._id);
    res.json(messages);
  } catch (err) { next(err); }
};

export const getInbox = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const messages = await messageRepository.getInbox(req.user!._id);
    res.json(messages);
  } catch (err) { next(err); }
};
