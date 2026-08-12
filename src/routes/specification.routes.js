import express from "express";
import requireAdmin from "../middleware/auth.js";
import {
    getSpecifications,
    createSpecification,
    updateSpecification,
    deleteSpecification,
    reorderSpecifications
} from "../controllers/specificationController.js";

const router = express.Router();

router.get("/", getSpecifications);
router.patch("/reorder", requireAdmin, reorderSpecifications);
router.post("/", requireAdmin, createSpecification);
router.put("/:id", requireAdmin, updateSpecification);
router.delete("/:id", requireAdmin, deleteSpecification);

export default router;