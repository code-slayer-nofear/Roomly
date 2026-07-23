import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db";
import errorHandler from "./middleware/errorHandler";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./routes/auth";
import listingRoutes from "./routes/listings";
import bookingRoutes from "./routes/bookings";
import reviewRoutes from "./routes/reviews";
import messageRoutes from "./routes/messages";
import webhookRoutes from "./routes/webhook";
import userRoutes from "./routes/users";
import adminRoutes from "./routes/admin";
import oauthRoutes from "./routes/oauth";
import notificationRoutes from "./routes/notifications";
import "./config/passport";
import bookingRepository from "./repositories/BookingRepository";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

app.set("io", io);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Strict rate limit on auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: "Too many requests, please try again later" } });

// Webhook must be mounted before express.json() — Stripe needs the raw body
app.use("/api/webhooks", webhookRoutes);

app.use(express.json());
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/auth/oauth", oauthRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users",          userRoutes);
app.use("/api/notifications",  notificationRoutes);
app.use("/api/admin",          adminRoutes);

app.use(errorHandler);

io.on("connection", (socket) => {
  socket.on("join", (userId: string) => socket.join(userId));
});

const PORT = process.env.PORT ?? 5000;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`Roomly server running on port ${PORT}`));
  // Mark confirmed bookings as completed every hour
  setInterval(() => bookingRepository.completeExpired(), 60 * 60 * 1000);
  bookingRepository.completeExpired(); // run once on startup too
});
