import pool from "../config/db.js";

export const getSlides = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM homepage_slides ORDER BY display_order ASC");
        res.status(200).json({ message: "success", data: rows, success: true });
    } catch (err) {
        console.error("failed to fetch slides", err);
        res.status(500).json({ message: "failed to fetch slides", success: false });
    }
};

export const createSlide = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Image is required", success: false });
    try {
        const imagePath = `/uploads/slides/${req.file.filename}`;
        const [[{ nextOrder }]] = await pool.query(
            "SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM homepage_slides"
        );
        const [insertResult] = await pool.query(
            "INSERT INTO homepage_slides (image_url, display_order) VALUES (?, ?)",
            [imagePath, nextOrder]
        );
        res.status(201).json({ message: "Slide added", success: true, data: { id: insertResult.insertId, image_url: imagePath, display_order: nextOrder } });
    } catch (err) {
        console.error("failed to create slide", err);
        res.status(500).json({ message: "failed to create slide", success: false });
    }
};

export const deleteSlide = async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM homepage_slides WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Slide not found", success: false });
        res.status(200).json({ message: "Slide deleted", success: true });
    } catch (err) {
        res.status(500).json({ message: "failed to delete slide", success: false });
    }
};

export const reorderSlides = async (req, res) => {
    const items = req.body;
    try {
        for (const item of items) {
            await pool.query("UPDATE homepage_slides SET display_order = ? WHERE id = ?", [item.display_order, item.id]);
        }
        res.status(200).json({ message: "Order updated", success: true });
    } catch (err) {
        res.status(500).json({ message: "failed to reorder", success: false });
    }
};