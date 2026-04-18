import { Router } from "express";
import { recordScan, resolveQr } from "../controllers/scanController.js";

const router = Router();

router.get("/resolve/:token", resolveQr);
router.post("/:type/:token", recordScan);

export default router;
