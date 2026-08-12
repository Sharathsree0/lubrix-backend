import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import productRoutes from "./routes/product.routes.js";
import subcategoryRoutes from "./routes/subcategory.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import variantRoutes from "./routes/variant.routes.js";
import specificationRoutes from "./routes/specification.routes.js";
import navRoutes from "./routes/nav.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("public/uploads"));

  app.use("/api/products",productRoutes)
  app.use("/api/subcategories", subcategoryRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/variants", variantRoutes);
  app.use("/api/specifications", specificationRoutes);
  app.use("/api/nav", navRoutes);
  app.use("/api/auth", authRoutes);
export default app;