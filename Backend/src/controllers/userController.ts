import { Response, NextFunction } from "express";
import { Types } from "mongoose";
import userRepository from "../repositories/UserRepository";
import { AuthRequest } from "../types";

export const toggleWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId    = req.user!._id;
    const listingId = new Types.ObjectId(req.params.listingId);

    const isWishlisted = req.user!.wishlists.some((id) => id.equals(listingId));

    if (isWishlisted) {
      await userRepository.removeFromWishlist(userId, listingId);
      res.json({ wishlisted: false });
    } else {
      await userRepository.addToWishlist(userId, listingId);
      res.json({ wishlisted: true });
    }
  } catch (err) { next(err); }
};

export const getWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userRepository.getWishlist(req.user!._id);
    res.json(user?.wishlists ?? []);
  } catch (err) { next(err); }
};
