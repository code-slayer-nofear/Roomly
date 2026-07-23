import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import userRepository from "../repositories/UserRepository";

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:  `${process.env.SERVER_URL}/api/auth/oauth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email     = profile.emails?.[0].value;
        const avatarUrl = profile.photos?.[0].value;
        if (!email) return done(new Error("No email from Google"));
        const user = await userRepository.findOrCreateOAuth({
          email,
          name:         profile.displayName,
          avatarUrl,
          authProvider: "google",
        });
        done(null, user!);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID:     process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL:  `${process.env.SERVER_URL}/api/auth/oauth/facebook/callback`,
      profileFields: ["id", "emails", "displayName", "photos"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email     = profile.emails?.[0].value;
        const avatarUrl = profile.photos?.[0].value;
        if (!email) return done(new Error("No email from Facebook"));
        const user = await userRepository.findOrCreateOAuth({
          email,
          name:         profile.displayName,
          avatarUrl,
          authProvider: "facebook",
        });
        done(null, user!);
      } catch (err) {
        done(err);
      }
    }
  )
);

export default passport;
