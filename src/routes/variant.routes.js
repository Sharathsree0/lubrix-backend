import express from "express";
import upload from "../middleware/upload.js";
import { createVariant, deleteVariant, getVariantById, getVariants, reorderVariants, updateVariant } from "../controllers/variant.controller.js";

const router = express.Router();

router.get("/", getVariants);
router.patch("/reorder", reorderVariants);
router.get("/:id", getVariantById);
router.post("/", upload.single("image"), createVariant);
router.put("/:id", upload.single("image"), updateVariant);
router.delete("/:id", deleteVariant);

export default router;