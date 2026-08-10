import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import productRoutes from "./routes/product.routes.js";
import subcategoryRoutes from "./routes/subcategory.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import variantRoutes from "./routes/variant.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("public/uploads"));

  app.use("/api/products",productRoutes)
  app.use("/api/subcategories", subcategoryRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/variants", variantRoutes);
export default app;