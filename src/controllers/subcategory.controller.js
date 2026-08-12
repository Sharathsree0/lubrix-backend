import pool from "../config/db.js";

export const getSubcategories = async (req, res) => {
    const { category, search } = req.query;
    let query = "SELECT * FROM subcategories WHERE 1=1";
    const params = [];
    try {
        if (category) {
            query += " AND category_id = ?";
            params.push(category);
        }
        if (search) {
            query += " AND name LIKE ?";
            params.push(`%${search}%`);
        }
        query += " ORDER BY display_order ASC";
        const [result] = await pool.query(query, params);
        res.status(200).json({ message: "successfully fetched subcategories", data: result, success: true });
    } catch (err) {
        console.error("failed to fetch subcategories", err);
        res.status(500).json({ message: "failed to fetch subcategories", success: false });
    }
};

export const getSubcategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query("SELECT * FROM subcategories WHERE id = ?", [id]);
        if (result.length === 0) {
            return res.status(404).json({ message: "Subcategory not found", success: false });
        }
        res.status(200).json({ message: "Subcategory found successfully", data: result[0], success: true });
    } catch (err) {
        console.error("failed to fetch subcategory", err);
        res.status(500).json({ message: "failed to fetch subcategory", success: false });
    }
};

export const createSubcategory = async (req, res) => {
    const { category_id, name, slug } = req.body;
    if (!category_id || !name || !slug) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }
    try {
        const [existing] = await pool.query(
            "SELECT id FROM subcategories WHERE LOWER(name) = LOWER(?) AND category_id = ?",
            [name, category_id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: "Subcategory already exists", success: false });
        }

        const [[{ nextOrder }]] = await pool.query(
            "SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM subcategories WHERE category_id = ?",
            [category_id]
        );

        const bannerPath = req.file ? `/uploads/subcategories/${req.file.filename}` : null;

        const [insertResult] = await pool.query(
            "INSERT INTO subcategories (category_id, name, slug, banner_image, display_order) VALUES (?, ?, ?, ?, ?)",
            [category_id, name, slug, bannerPath, nextOrder]
        );

        res.status(201).json({
            message: "Subcategory added successfully",
            success: true,
            data: { id: insertResult.insertId, category_id, name, slug, banner_image: bannerPath, display_order: nextOrder }
        });
    } catch (err) {
        console.error("failed to create subcategory", err);
        res.status(500).json({ message: "failed to create subcategory", success: false });
    }
};

export const updateSubcategory = async (req, res) => {
    const { id } = req.params;
    const { category_id, name, slug } = req.body;
    if (!category_id || !name || !slug) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }
    try {
        const [existing] = await pool.query(
            "SELECT id FROM subcategories WHERE LOWER(name) = LOWER(?) AND category_id = ? AND id != ?",
            [name, category_id, id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: "Subcategory name already exists in this category", success: false });
        }

        const [current] = await pool.query("SELECT banner_image FROM subcategories WHERE id = ?", [id]);
        if (current.length === 0) {
            return res.status(404).json({ message: "Subcategory not found", success: false });
        }

        const bannerPath = req.file ? `/uploads/subcategories/${req.file.filename}` : current[0].banner_image;

        const [updateResult] = await pool.query(
            "UPDATE subcategories SET name = ?, slug = ?, banner_image = ? WHERE id = ?",
            [name, slug, bannerPath, id]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Subcategory not found", success: false });
        }

        res.status(200).json({ message: "Subcategory updated successfully", success: true });
    } catch (err) {
        console.error("failed to update subcategory", err);
        res.status(500).json({ message: "failed to update subcategory", success: false });
    }
};

export const deleteSubcategory = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query("DELETE FROM subcategories WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Subcategory not found", success: false });
        }
        res.status(200).json({ message: "Successfully deleted the subcategory", success: true });
    } catch (err) {
        console.error("failed to delete subcategory", err);
        res.status(500).json({ message: "failed to delete subcategory", success: false });
    }
};

export const reorderSubcategories = async (req, res) => {
    const items = req.body;
    try {
        for (const item of items) {
            await pool.query(
                "UPDATE subcategories SET display_order = ? WHERE id = ?",
                [item.display_order, item.id]
            );
        }
        res.status(200).json({ message: "Order updated", success: true });
    } catch (err) {
        console.error("failed to reorder subcategories", err);
        res.status(500).json({ message: "failed to reorder subcategories", success: false });
    }
};