import db from "../config/db.js";
import slugify from "../utils/slugify.js";

export const createCategory = async (req, res) =>{
  try {
    const { name, parentGroup = null, displayOrder = 0 } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const slug = slugify(name);

    // Check duplicate
    const [existing] = await db.query(
      "SELECT id FROM categories WHERE slug = ?",
      [slug]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    // Insert
    const [result] = await db.query(
      `INSERT INTO categories (name, slug, parentGroup, displayOrder)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), slug, parentGroup, displayOrder]
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        id: result.insertId,
        name: name.trim(),
        slug,
        parentGroup,
        displayOrder,
      },
    });
  } catch (error) {
    console.error("Create Category:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};