import { verifyAuthToken } from "../services/authService.js";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const payload = verifyAuthToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Authentication required." });
  }

  req.user = payload;
  next();
}
