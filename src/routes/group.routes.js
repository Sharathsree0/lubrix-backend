import express from "express";
import requireAdmin from "../middleware/auth.js";
import { getGroups, createGroup, updateGroup, deleteGroup, reorderGroups } from "../controllers/groupController.js";

const router = express.Router();

router.get("/", getGroups);
router.patch("/reorder", requireAdmin, reorderGroups);
router.post("/", requireAdmin, createGroup);
router.put("/:id", requireAdmin, updateGroup);
router.delete("/:id", requireAdmin, deleteGroup);

export default router;