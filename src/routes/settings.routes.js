import express from "express";
import requireAdmin from "../middleware/auth.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
const router = express.Router();
router.get("/", getSettings);
router.put("/", requireAdmin, updateSettings);
export default router;