import { config } from "../config.js";
import { createAuthToken } from "../services/authService.js";

export function login(req, res) {
  const { username, password } = req.body || {};

  if (username !== config.auth.username || password !== config.auth.password) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  res.json({
    token: createAuthToken(username),
    user: { username }
  });
}

export function getSession(req, res) {
  res.json({
    user: { username: req.user.username }
  });
}
