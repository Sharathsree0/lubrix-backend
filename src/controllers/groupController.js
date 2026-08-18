import pool from "../config/db.js";

export const getGroups = async (req, res) => {
    try {
        const [result] = await pool.query("SELECT * FROM groups ORDER BY display_order ASC");
        res.status(200).json({ message: "successfully fetched groups", data: result, success: true });
    } catch (err) {
        console.error("failed to fetch groups", err);
        res.status(500).json({ message: "failed to fetch groups", success: false });
    }
};

export const createGroup = async (req, res) => {
    const { name, slug } = req.body;
    if (!name || !slug) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }
    try {
        const [existing] = await pool.query("SELECT id FROM groups WHERE LOWER(name) = LOWER(?)", [name]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "Group already exists", success: false });
        }

        const [[{ nextOrder }]] = await pool.query(
            "SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM groups"
        );

        const [insertResult] = await pool.query(
            "INSERT INTO groups (name, slug, display_order) VALUES (?, ?, ?)",
            [name, slug, nextOrder]
        );

        res.status(201).json({
            message: "Group added successfully",
            success: true,
            data: { id: insertResult.insertId, name, slug, display_order: nextOrder }
        });
    } catch (err) {
        console.error("failed to create group", err);
        res.status(500).json({ message: "failed to create group", success: false });
    }
};

export const updateGroup = async (req, res) => {
    const { id } = req.params;
    const { name, slug } = req.body;
    if (!name || !slug) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }
    try {
        const [existing] = await pool.query(
            "SELECT id FROM groups WHERE LOWER(name) = LOWER(?) AND id != ?",
            [name, id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: "Group name already exists", success: false });
        }

        const [updateResult] = await pool.query(
            "UPDATE groups SET name = ?, slug = ? WHERE id = ?",
            [name, slug, id]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Group not found", success: false });
        }

        res.status(200).json({ message: "Group updated successfully", success: true });
    } catch (err) {
        console.error("failed to update group", err);
        res.status(500).json({ message: "failed to update group", success: false });
    }
};

export const deleteGroup = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query("DELETE FROM groups WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Group not found", success: false });
        }
        res.status(200).json({ message: "Successfully deleted the group", success: true });
    } catch (err) {
        console.error("failed to delete group", err);
        res.status(500).json({ message: "failed to delete group", success: false });
    }
};

export const reorderGroups = async (req, res) => {
    const items = req.body;
    try {
        for (const item of items) {
            await pool.query("UPDATE groups SET display_order = ? WHERE id = ?", [item.display_order, item.id]);
        }
        res.status(200).json({ message: "Order updated", success: true });
    } catch (err) {
        console.error("failed to reorder groups", err);
        res.status(500).json({ message: "failed to reorder groups", success: false });
    }
};