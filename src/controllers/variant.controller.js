import pool from "../config/db.js";
import fs from "fs";
import path from "path";

export const getVariants = async (req, res) => {
    const { product_id } = req.query;
    let query = `
        SELECT pv.*, p.name AS product_name 
        FROM product_variants pv
        JOIN products p ON pv.product_id = p.id
        WHERE 1=1
    `;
    const params = [];
    try {
        if (product_id) {
            query += " AND pv.product_id = ?";
            params.push(product_id);
        }
        query += " ORDER BY pv.display_order ASC";
        const [result] = await pool.query(query, params);

        const formatted = result.map(v => ({ ...v, image: v.image_url }));

        res.status(200).json({ message: "successfully fetched variants", data: formatted, success: true });
    } catch (err) {
        console.error("failed to fetch variants", err);
        res.status(500).json({ message: "failed to fetch variants", success: false });
    }
};

export const getVariantById = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query(
            `SELECT pv.*, p.name AS product_name 
             FROM product_variants pv
             JOIN products p ON pv.product_id = p.id
             WHERE pv.id = ?`,
            [id]
        );
        if (result.length === 0) {
            return res.status(404).json({ message: "Variant not found", success: false });
        }
        const variant = { ...result[0], image: result[0].image_url };
        res.status(200).json({ message: "Variant found successfully", data: variant, success: true });
    } catch (err) {
        console.error("failed to fetch variant", err);
        res.status(500).json({ message: "failed to fetch variant", success: false });
    }
};

export const createVariant = async (req, res) => {
    const { product_id, quantity_label, price } = req.body;

    if (!product_id || !quantity_label || !price) {
        return res.status(400).json({ message: "All fields required", success: false });
    }
    if (!req.file) {
        return res.status(400).json({ message: "Image is required", success: false });
    }

    try {
        const imagePath = `/uploads/variants/${req.file.filename}`;

        const [[{ nextOrder }]] = await pool.query(
            "SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM product_variants WHERE product_id = ?",
            [product_id]
        );

        const [insertResult] = await pool.query(
            "INSERT INTO product_variants (product_id, quantity_label, image_url, price, display_order) VALUES (?, ?, ?, ?, ?)",
            [product_id, quantity_label, imagePath, price, nextOrder]
        );

        res.status(201).json({
            message: "Variant created successfully",
            success: true,
            data: {
                id: insertResult.insertId,
                product_id,
                quantity_label,
                image_url: imagePath,
                price,
                display_order: nextOrder
            }
        });
    } catch (err) {
        console.error("failed to create variant", err);
        res.status(500).json({ message: "failed to create variant", success: false });
    }
};

export const updateVariant = async (req, res) => {
    const { id } = req.params;
    const { quantity_label, price } = req.body;

    if (!quantity_label || !price) {
        return res.status(400).json({ message: "All fields required", success: false });
    }

    try {
        const [existing] = await pool.query("SELECT * FROM product_variants WHERE id = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: "Variant not found", success: false });
        }

        let imagePath = existing[0].image_url;

        if (req.file) {
            const oldFilePath = path.join("public", existing[0].image_url);
            fs.unlink(oldFilePath, (err) => {
                if (err) console.error("old image delete failed (non-blocking):", err.message);
            });
            imagePath = `/uploads/variants/${req.file.filename}`;
        }

        await pool.query(
            "UPDATE product_variants SET quantity_label = ?, price = ?, image_url = ? WHERE id = ?",
            [quantity_label, price, imagePath, id]
        );

        res.status(200).json({ message: "Variant updated successfully", success: true, data: { id, quantity_label, price, image_url: imagePath } });
    } catch (err) {
        console.error("failed to update variant", err);
        res.status(500).json({ message: "failed to update variant", success: false });
    }
};

export const deleteVariant = async (req, res) => {
    const { id } = req.params;
    try {
        const [existing] = await pool.query("SELECT image_url FROM product_variants WHERE id = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: "Variant not found", success: false });
        }

        const filePath = path.join("public", existing[0].image_url);
        fs.unlink(filePath, (err) => {
            if (err) console.error("image delete failed (non-blocking):", err.message);
        });

        await pool.query("DELETE FROM product_variants WHERE id = ?", [id]);

        res.status(200).json({ message: "Variant deleted successfully", success: true });
    } catch (err) {
        console.error("failed to delete variant", err);
        res.status(500).json({ message: "failed to delete variant", success: false });
    }
};

export const reorderVariants = async (req, res) => {
    const items = req.body;
    try {
        for (const item of items) {
            await pool.query(
                "UPDATE product_variants SET display_order = ? WHERE id = ?",
                [item.display_order, item.id]
            );
        }
        res.status(200).json({ message: "Order updated", success: true });
    } catch (err) {
        console.error("failed to reorder variants", err);
        res.status(500).json({ message: "failed to reorder variants", success: false });
    }
};