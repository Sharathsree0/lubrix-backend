import express from "express";
import {    getCategories,    getCategoryById,    createCategory,    updateCategory,    deleteCategory,    reorderCategories} from "../controllers/category.controller.js";
const router = express.Router();

router.get("/", getCategories);
router.patch("/reorder", reorderCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;