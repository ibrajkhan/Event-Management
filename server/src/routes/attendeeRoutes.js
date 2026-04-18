import { Router } from "express";
import multer from "multer";
import { exportAttendees, importAttendees, listAttendees, sendAllBadgeEmails, sendBadgeEmail } from "../controllers/attendeeController.js";
import { getBadgePdf } from "../controllers/badgeController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", listAttendees);
router.post("/import", upload.single("file"), importAttendees);
router.get("/export", exportAttendees);
router.post("/send-all-emails", sendAllBadgeEmails);
router.get("/:token/badge", getBadgePdf);
router.post("/:id/send-email", sendBadgeEmail);

export default router;
