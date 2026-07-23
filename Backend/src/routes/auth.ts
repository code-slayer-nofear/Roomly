import { Router } from "express";
import { register, login, refresh, logout, getMe } from "../controllers/authController";
import { protect } from "../middleware/auth";
import validate from "../middleware/validate";
import { registerSchema, loginSchema } from "../validation/schemas";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login",    validate(loginSchema),    login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
