import dotenv from "dotenv";

dotenv.config();

function normalizeOrigin(value) {
  return value.replace(/\/+$/, "");
}

const defaultPublicBaseUrl = process.env.RENDER_EXTERNAL_URL || "http://localhost:5000";
const clientOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((value) => value.trim())
  .map((value) => normalizeOrigin(value))
  .filter(Boolean);

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/event_management",
  useInMemoryDb: process.env.USE_IN_MEMORY_DB === "true",
  clientOrigins,
  clientUrl: clientOrigins[0],
  publicBaseUrl: process.env.PUBLIC_BASE_URL || defaultPublicBaseUrl,
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.MAIL_FROM || "events@example.com"
  },
  event: {
    name: process.env.EVENT_NAME || "Annual Leadership Meet",
    address: process.env.EVENT_ADDRESS || "123 Event Street, Kolkata"
  },
  badgeTemplatePath: process.env.BADGE_TEMPLATE_PATH || "",
  auth: {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
    secret: process.env.AUTH_SECRET || "replace-this-secret-in-production"
  }
};
