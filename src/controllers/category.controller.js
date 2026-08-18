import pool from "../config/db.js";

export const getCategories = async (req, res) => {
    const { search } = req.query;
    let query = "SELECT c.*, g.name AS group_name FROM categories c JOIN groups g ON c.group_id = g.id WHERE 1=1";
    const params = [];
    try {
        if (search) {
            query += " AND c.name LIKE ?";
            params.push(`%${search}%`);
        }
        query += " ORDER BY c.display_order ASC";
        const [result] = await pool.query(query, params);
        res.status(200).json({ message: "successfully fetched categories", data: result, success: true });
    } catch (err) {
        console.error("failed to fetch categories", err);
        res.status(500).json({ message: "failed to fetch categories", success: false });
    }
};

export const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query(
            "SELECT c.*, g.name AS group_name FROM categories c JOIN groups g ON c.group_id = g.id WHERE c.id = ?",
            [id]
        );
        if (result.length === 0) {
            return res.status(404).json({ message: "Category not found", success: false });
        }
        res.status(200).json({ message: "Category found successfully", data: result[0], success: true });
    } catch (err) {
        console.error("failed to fetch category", err);
        res.status(500).json({ message: "failed to fetch category", success: false });
    }
};

export const createCategory = async (req, res) => {
    const { name, slug, group_id } = req.body;
    if (!name || !slug || !group_id) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }
    try {
        const [existing] = await pool.query(
            "SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND group_id = ?",
            [name, group_id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: "Category already exists", success: false });
        }

        const [[{ nextOrder }]] = await pool.query(
            "SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM categories WHERE group_id = ?",
            [group_id]
        );

        const [insertResult] = await pool.query(
            "INSERT INTO categories (name, slug, group_id, display_order) VALUES (?, ?, ?, ?)",
            [name, slug, group_id, nextOrder]
        );

        res.status(201).json({
            message: "Category added successfully",
            success: true,
            data: { id: insertResult.insertId, name, slug, group_id, display_order: nextOrder }
        });
    } catch (err) {
        console.error("failed to create category", err);
        res.status(500).json({ message: "failed to create category", success: false });
    }
};

export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, slug, group_id } = req.body;
    if (!name || !slug || !group_id) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }
    try {
        const [existing] = await pool.query(
            "SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND group_id = ? AND id != ?",
            [name, group_id, id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: "Category name already exists in this group", success: false });
        }

        const [updateResult] = await pool.query(
            "UPDATE categories SET name = ?, slug = ?, group_id = ? WHERE id = ?",
            [name, slug, group_id, id]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found", success: false });
        }

        res.status(200).json({ message: "Category updated successfully", success: true });
    } catch (err) {
        console.error("failed to update category", err);
        res.status(500).json({ message: "failed to update category", success: false });
    }
};

export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found", success: false });
        }
        res.status(200).json({ message: "Successfully deleted the category", success: true });
    } catch (err) {
        console.error("failed to delete category", err);
        res.status(500).json({ message: "failed to delete category", success: false });
    }
};

export const reorderCategories = async (req, res) => {
    const items = req.body;
    try {
        for (const item of items) {
            await pool.query(
                "UPDATE categories SET display_order = ? WHERE id = ?",
                [item.display_order, item.id]
            );
        }
        res.status(200).json({ message: "Order updated", success: true });
    } catch (err) {
        console.error("failed to reorder categories", err);
        res.status(500).json({ message: "failed to reorder categories", success: false });
    }
};