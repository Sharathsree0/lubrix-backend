import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Route Imports
import productRoutes from "./src/routes/product.routes.js";
import subcategoryRoutes from "./src/routes/subcategory.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import variantRoutes from "./src/routes/variant.routes.js";
import specificationRoutes from "./src/routes/specification.routes.js";
import navRoutes from "./src/routes/nav.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import groupRoutes from "./src/routes/group.routes.js";
import settingsRoutes from "./src/routes/settings.routes.js";
import slideRoutes from "./src/routes/slide.routes.js";
import teamRoutes from "./src/routes/team.routes.js";

// Database Import
import pool from "./src/config/db.js";

// Ensure absolute directory paths for dotenv and static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/specifications", specificationRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/nav", navRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/slides", slideRoutes);
app.use("/api/team", teamRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "API server is running" });
});

const PORT = process.env.PORT || 5000;

// Start server immediately so Phusion Passenger / Apache can bind to the process
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at port ${PORT}`);
});

// Test database connection in the background
(async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("MYSQL Database connected successfully");
  } catch (err) {
    console.error("Server connection failed:", err);
  } finally {
    if (connection) connection.release();
  }
})();

export default app;