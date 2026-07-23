import { Response, NextFunction } from "express";
import listingRepository from "../repositories/ListingRepository";
import userRepository from "../repositories/UserRepository";
import bookingRepository from "../repositories/BookingRepository";
import { AuthRequest } from "../types";

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 20;
    const users = await userRepository.findAll(page, limit);
    res.json(users);
  } catch (err) { next(err); }
};

export const suspendUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userRepository.setSuspended(req.params.id, true);
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    res.json(user);
  } catch (err) { next(err); }
};

export const unsuspendUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userRepository.setSuspended(req.params.id, false);
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    res.json(user);
  } catch (err) { next(err); }
};

export const getListings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page     = Number(req.query.page)  || 1;
    const limit    = Number(req.query.limit) || 20;
    const listings = await listingRepository.findAll(page, limit);
    res.json(listings);
  } catch (err) { next(err); }
};

export const approveListing = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const listing = await listingRepository.setStatus(req.params.id, "published");
    if (!listing) { res.status(404).json({ message: "Listing not found" }); return; }
    res.json(listing);
  } catch (err) { next(err); }
};

export const suspendListing = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const listing = await listingRepository.setStatus(req.params.id, "suspended");
    if (!listing) { res.status(404).json({ message: "Listing not found" }); return; }
    res.json(listing);
  } catch (err) { next(err); }
};

export const getAnalytics = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const analytics = await bookingRepository.getAnalytics();
    res.json(analytics);
  } catch (err) { next(err); }
};
