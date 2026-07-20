import { Response, NextFunction } from "express";
import listingRepository from "../repositories/ListingRepository";
import { AuthRequest } from "../types";

export const createListing = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const listing = await listingRepository.create({ ...req.body, hostId: req.user!._id });
    res.status(201).json(listing);
  } catch (err) { next(err); }
};

export const getListings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { city, minPrice, maxPrice, guests, amenities, lat, lng, radius, page, limit } = req.query;
    const listings = await listingRepository.findMany({
      city: city as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      guests: guests ? Number(guests) : undefined,
      amenities: amenities ? (amenities as string).split(",") : undefined,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      radius: radius ? Number(radius) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(listings);
  } catch (err) { next(err); }
};

export const getListing = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const listing = await listingRepository.findById(req.params.id);
    if (!listing) { res.status(404).json({ message: "Listing not found" }); return; }
    res.json(listing);
  } catch (err) { next(err); }
};

export const updateListing = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const listing = await listingRepository.findByIdAndUpdate(req.params.id, req.user!._id, req.body);
    if (!listing) { res.status(404).json({ message: "Listing not found or unauthorized" }); return; }
    res.json(listing);
  } catch (err) { next(err); }
};

export const deleteListing = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const listing = await listingRepository.findByIdAndDelete(req.params.id, req.user!._id);
    if (!listing) { res.status(404).json({ message: "Listing not found or unauthorized" }); return; }
    res.json({ message: "Listing deleted" });
  } catch (err) { next(err); }
};
