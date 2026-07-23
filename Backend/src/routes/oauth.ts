import { Router, Request, Response } from "express";
import passport from "../config/passport";
import { signToken, signRefreshToken } from "../utils/jwt";
import { IUserDocument } from "../models/User";

const router = Router();

const handleOAuthCallback = (req: Request, res: Response): void => {
  const user = req.user as IUserDocument;
  const token        = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });

  // Redirect to frontend with access token in query param
  // The frontend should immediately store it and strip it from the URL
  res.redirect(`${process.env.CLIENT_URL}/oauth/callback?token=${token}`);
};

// Google
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
  handleOAuthCallback
);

// Facebook
router.get("/facebook",
  passport.authenticate("facebook", { scope: ["email"], session: false })
);
router.get("/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
  handleOAuthCallback
);

export default router;
