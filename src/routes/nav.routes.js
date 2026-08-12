import express from "express";
import { getNav } from "../controllers/navController.js";

const router = express.Router();

router.get("/", getNav);

export default router;