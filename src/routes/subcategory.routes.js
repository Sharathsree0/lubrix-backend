import express from "express";
import {    getSubcategories,    getSubcategoryById,    createSubcategory,    updateSubcategory,    deleteSubcategory,    reorderSubcategories} from "../controllers/subcategory.controller.js"; 

const router = express.Router();

router.get("/", getSubcategories);
router.patch("/reorder", reorderSubcategories);
router.get("/:id", getSubcategoryById);
router.post("/", createSubcategory);
router.put("/:id", updateSubcategory);
router.delete("/:id", deleteSubcategory);

export default router;