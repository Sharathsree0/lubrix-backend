import express from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, reorderProducts, downloadDatasheet } from "../controllers/product.controller.js";
import requireAdmin from "../middleware/auth.js";
import { uploadDatasheet } from "../middleware/createUploader.js";

const router = express.Router()


router.get("/", getProducts);             
router.get("/:id", getProductById);        
router.post("/", requireAdmin, uploadDatasheet.single("datasheet"), createProduct);
router.put("/:id", requireAdmin, uploadDatasheet.single("datasheet"), updateProduct)    
router.delete("/:id", requireAdmin, deleteProduct);  
router.patch("/reorder", requireAdmin, reorderProducts); 
router.get("/:id/download", downloadDatasheet);
export default router;