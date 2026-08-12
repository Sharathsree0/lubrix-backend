import express from "express";
import { uploadBanner } from "../middleware/createUploader.js";
import requireAdmin from "../middleware/auth.js";
import {    getSubcategories,    getSubcategoryById,    createSubcategory,    updateSubcategory,    deleteSubcategory,    reorderSubcategories} from "../controllers/subcategory.controller.js"; 

const router = express.Router();

router.get("/", getSubcategories);
router.patch("/reorder", reorderSubcategories);
router.get("/:id", getSubcategoryById);
router.post("/", requireAdmin, uploadBanner.single("banner"), createSubcategory);
router.put("/:id", requireAdmin, uploadBanner.single("banner"), updateSubcategory);
router.delete("/:id", deleteSubcategory);

export default router;