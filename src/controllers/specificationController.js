import pool from "../config/db.js";

export const getSpecifications = async (req, res) => {
    const { product_id } = req.query;
    if (!product_id) {
        return res.status(400).json({ message: "product_id is required", success: false });
    }
    try {
        const [result] = await pool.query(
            "SELECT * FROM product_specifications WHERE product_id = ? ORDER BY display_order ASC",
            [product_id]
        );
        res.status(200).json({ message: "successfully fetched specifications", data: result, success: true });
    } catch (err) {
        console.error("failed to fetch specifications", err);
        res.status(500).json({ message: "failed to fetch specifications", success: false });
    }
};

export const createSpecification = async (req, res) => {
    const { product_id, test_parameter, test_method, typical_value } = req.body;
    if (!product_id || !test_parameter) {
        return res.status(400).json({ message: "product_id and test_parameter are required", success: false });
    }
    try {
        const [[{ nextOrder }]] = await pool.query(
            "SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM product_specifications WHERE product_id = ?",
            [product_id]
        );

        const [insertResult] = await pool.query(
            "INSERT INTO product_specifications (product_id, test_parameter, test_method, typical_value, display_order) VALUES (?, ?, ?, ?, ?)",
            [product_id, test_parameter, test_method || null, typical_value || null, nextOrder]
        );

        res.status(201).json({
            message: "Specification added successfully",
            success: true,
            data: { id: insertResult.insertId, product_id, test_parameter, test_method, typical_value, display_order: nextOrder }
        });
    } catch (err) {
        console.error("failed to create specification", err);
        res.status(500).json({ message: "failed to create specification", success: false });
    }
};

export const updateSpecification = async (req, res) => {
    const { id } = req.params;
    const { test_parameter, test_method, typical_value } = req.body;
    if (!test_parameter) {
        return res.status(400).json({ message: "test_parameter is required", success: false });
    }
    try {
        const [updateResult] = await pool.query(
            "UPDATE product_specifications SET test_parameter = ?, test_method = ?, typical_value = ? WHERE id = ?",
            [test_parameter, test_method || null, typical_value || null, id]
        );
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Specification not found", success: false });
        }
        res.status(200).json({ message: "Specification updated successfully", success: true });
    } catch (err) {
        console.error("failed to update specification", err);
        res.status(500).json({ message: "failed to update specification", success: false });
    }
};

export const deleteSpecification = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query("DELETE FROM product_specifications WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Specification not found", success: false });
        }
        res.status(200).json({ message: "Specification deleted successfully", success: true });
    } catch (err) {
        console.error("failed to delete specification", err);
        res.status(500).json({ message: "failed to delete specification", success: false });
    }
};

export const reorderSpecifications = async (req, res) => {
    const items = req.body;
    try {
        for (const item of items) {
            await pool.query(
                "UPDATE product_specifications SET display_order = ? WHERE id = ?",
                [item.display_order, item.id]
            );
        }
        res.status(200).json({ message: "Order updated", success: true });
    } catch (err) {
        console.error("failed to reorder specifications", err);
        res.status(500).json({ message: "failed to reorder specifications", success: false });
    }
};