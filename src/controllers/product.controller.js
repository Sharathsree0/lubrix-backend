import pool from "../config/db.js";
import path from "path";

export const getProducts = async (req, res) => {
    const { category, search } = req.query;
    let query = "SELECT * FROM products WHERE 1=1"
    const params = [];
    try {
        if (category) {
            query += " AND subcategory_id = ?"
            params.push(category)
        }
        if (search) {
            query += " AND name LIKE ?"
            params.push(`%${search}%`)
        }
        query += " ORDER BY display_order ASC"
        const [result] = await pool.query(query, params)
        res.status(200).json({ message: "successfully fetched products", data: result, success: true })
    } catch (err) {
        console.error("failed to fetch", err)
        res.status(500).json({ message: "failed to fetch products", success: false })
    }
}

export const getProductById = async (req, res) => {
    const { id } = req.params;
    const query = " SELECT * FROM products WHERE id = ?"
    try {

        const [result] = await pool.query(query, [id])
        if (result.length === 0) {
            return res.status(404).json({ Message: "Product not found", success: false })
        }
        res.status(200).json({ message: "Product found successfully", data: result[0], success: true })
    } catch (err) {
        console.error("faild to get", err)
        res.status(500).json({ message: "Failed to fetch product", success: false })
    }
}
// ...

export const createProduct = async (req, res) => {
    const { subcategory_id, name, slug, description, standard, viscosity, oil_type, features, applications, badges, spec_col1_label, spec_col2_label, spec_col3_label, recommendations, } = req.body;

    if (!subcategory_id || !name || !slug || !description) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }
    try {
        const [existingProducts] = await pool.query(
            "SELECT id FROM products WHERE LOWER(name) = LOWER(?) AND subcategory_id = ?",
            [name, subcategory_id]
        );
        if (existingProducts.length > 0) {
            return res.status(409).json({ message: "Product already exists", success: false });
        }

        const [[{ nextOrder }]] = await pool.query(
            "SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM products WHERE subcategory_id = ?",
            [subcategory_id]
        );

        const pdfPath = req.file ? `/uploads/datasheets/${req.file.filename}` : null;

        const [insertResult] = await pool.query(
            `INSERT INTO products 
     (subcategory_id, name, slug, description, standard, viscosity, oil_type, features, applications, badges,spec_col1_label, spec_col2_label, spec_col3_label, recommendations, pdf_url, display_order) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [subcategory_id, name, slug, description, standard || null, viscosity || null, oil_type || null, features || null, applications || null, badges || null, spec_col1_label || null, spec_col2_label || null, spec_col3_label || null, recommendations || null, pdfPath, nextOrder]
        );

        res.status(201).json({
            message: "Product added successfully",
            success: true,
            data: { id: insertResult.insertId, subcategory_id, name, slug, description, standard, viscosity, oil_type, features, applications, pdf_url: pdfPath, display_order: nextOrder }
        });
    } catch (err) {
        console.error("failed to create product", err);
        res.status(500).json({ message: "failed to create product", success: false });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { subcategory_id, name, slug, description, standard, viscosity, oil_type, features, applications, badges, spec_col1_label, spec_col2_label, spec_col3_label, recommendations, } = req.body;

    if (!subcategory_id || !name || !slug || !description || !standard || !viscosity) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }

    try {
        const [existingProducts] = await pool.query(
            "SELECT id FROM products WHERE LOWER(name) = LOWER(?) AND subcategory_id = ? AND id != ?",
            [name, subcategory_id, id]
        );
        if (existingProducts.length > 0) {
            return res.status(409).json({ message: "Product name already exists in this subcategory", success: false });
        }

        const [current] = await pool.query("SELECT pdf_url FROM products WHERE id = ?", [id]);
        if (current.length === 0) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        const pdfPath = req.file ? `/uploads/datasheets/${req.file.filename}` : current[0].pdf_url;

        const [insertResult] = await pool.query(
            `INSERT INTO products 
     (subcategory_id, name, slug, description, standard, viscosity, oil_type, features, applications, badges,spec_col1_label, spec_col2_label, spec_col3_label, recommendations, pdf_url, display_order) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [subcategory_id, name, slug, description, standard || null, viscosity || null, oil_type || null, features || null, applications || null, badges || null, spec_col1_label || null, spec_col2_label || null, spec_col3_label || null, recommendations || null, pdfPath, nextOrder]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        res.status(200).json({ message: "Product updated successfully", success: true });
    } catch (err) {
        console.error("failed to update product", err);
        res.status(500).json({ message: "failed to update product", success: false });
    }
};


export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {

        const [result] = await pool.query(
            'DELETE FROM products WHERE id = ?', [id]
        )
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "product not found", success: false })
        }
        res.status(200).json({ message: "successfully deleted the product", success: true, data: result })
    } catch (err) {
        console.error("failed to delete product", err);
        res.status(500).json({ message: "failed to delete product", success: false });
    }
};

export const reorderProducts = async (req, res) => {
    const items = req.body; // expect: [{id: 1, display_order: 0}, {id: 2, display_order: 1}, ...]

    try {

        for (const item of items) {
            const [result] = await pool.query(
                'UPDATE products SET display_order = ? WHERE id = ?', [item.display_order, item.id])
        }
        res.status(200).json({ message: "Order updated", success: true });
    } catch (err) {
        console.error("failed to reorder", err);
        res.status(500).json({ message: "failed to reorder", success: false });
    }
};


export const downloadDatasheet = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query("SELECT pdf_url, name FROM products WHERE id = ?", [id]);
        if (result.length === 0 || !result[0].pdf_url) {
            return res.status(404).json({ message: "Datasheet not found", success: false });
        }
        const filePath = path.join(process.cwd(), "public", result[0].pdf_url);
        const downloadName = `${result[0].name.replace(/[^a-z0-9]+/gi, "-")}-datasheet.pdf`;
        res.download(filePath, downloadName);
    } catch (err) {
        console.error("failed to download datasheet", err);
        res.status(500).json({ message: "failed to download datasheet", success: false });
    }
};