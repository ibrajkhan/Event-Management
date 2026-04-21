import { Router } from "express";
import { getSession, login } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.get("/session", requireAuth, getSession);

export default router;
