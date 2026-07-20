import { Response, NextFunction } from "express";
import listingRepository from "../repositories/ListingRepository";
import cloudinary from "../config/cloudinary";
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

export const uploadPhotos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) { res.status(400).json({ message: "No files uploaded" }); return; }

    const urls = files.map((f: any) => f.path as string);
    const listing = await listingRepository.addPhotos(req.params.id, req.user!._id, urls);
    if (!listing) { res.status(404).json({ message: "Listing not found or unauthorized" }); return; }

    res.json({ photos: listing.photos });
  } catch (err) { next(err); }
};

export const deletePhoto = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { url } = req.body;
    if (!url) { res.status(400).json({ message: "Photo URL is required" }); return; }

    // Extract Cloudinary public_id from the URL and delete from Cloudinary
    const publicId = url.split("/").slice(-2).join("/").replace(/\.[^.]+$/, "");
    await cloudinary.uploader.destroy(publicId);

    const listing = await listingRepository.removePhoto(req.params.id, req.user!._id, url);
    if (!listing) { res.status(404).json({ message: "Listing not found or unauthorized" }); return; }

    res.json({ photos: listing.photos });
  } catch (err) { next(err); }
};
