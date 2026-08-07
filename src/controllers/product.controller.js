import pool from "../config/db.js";

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
        res.status(200).json({ Message: "successfully fetched products", Data: result, Success: true })
    } catch (err) {
        console.error("failed to fetch", err)
        res.status(500).json({ Message: "failed to fetch products", Success: false })
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
        res.status(200).json({ Message: "Product found successfully", data: result[0], success: true })
    } catch (err) {
        console.error("faild to get", err)
        res.status(500).json({ Message: "Failed to fetch product", Success: false })
    }
}

export const createProduct = async (req, res) => {

    const { subcategory_id, name, slug, description, standard, viscosity } = req.body;

    if (!subcategory_id || !name || !slug || slug === null || !description || description === null || !standard || !viscosity) {
        return res.status(400).json({ Message: "All fields are required", Success: false });
    }
    try {
        const [existingProducts] = await pool.query(
            "SELECT id FROM products WHERE LOWER(name) = LOWER(?) AND subcategory_id = ?",
            [name, subcategory_id]
        );

        if (existingProducts.length > 0) {
            return res.status(409).json({ Message: "Product already exists", Success: false });
        }
        const [[{ nextOrder }]] = await pool.query(
            "SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM products WHERE subcategory_id = ?",
            [subcategory_id]
        );

        const [insertResult] = await pool.query(
            "INSERT INTO products (subcategory_id, name, slug, description, standard, viscosity, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [subcategory_id, name, slug, description, standard, viscosity, nextOrder]
        );

        res.status(201).json({
            message: "Product added successfully",
            success: true,
            data: { id: insertResult.insertId, subcategory_id, name, slug, description, standard, viscosity, display_order: nextOrder }
        });
    } catch (err) {
        console.error("failed to create product", err);
        res.status(500).json({ message: "failed to create product", success: false });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { subcategory_id, name, slug, description, standard, viscosity } = req.body;
    if (!subcategory_id || !name || !slug || !description || !standard || !viscosity) {
        return res.status(400).json({ Message: "All fields are required", success: false });
    }
    try {

        const [existingProducts] = await pool.query(
            'SELECT id FROM products WHERE LOWER(name) = LOWER(?) AND subcategory_id = ? AND id != ?',
            [name, subcategory_id, id]
        );
        if (existingProducts.length > 0) {
            return res.status(409).json({ Message: "Product name already exists in this subcategory", success: false });
        }

        const [updateResult] = await pool.query(
            "UPDATE products SET name = ?, slug = ?, description = ?, standard = ?, viscosity = ? WHERE id = ?",
            [name, slug, description, standard, viscosity, id]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ Message: "Product not found", success: false });
        }

        res.status(200).json({ Message: "Product updated successfully", success: true });
    } catch (err) {
        console.log("Product updation failed", err);
        res.status(500).json({ Message: "Failed to update product", success: false });
    }
};


export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {

    const [result] = await pool.query(
        'DELETE FROM products WHERE id = ?', [id]
    )
    if(result.affectedRows === 0){
        return res.status(404).json({ Message : "product not found", success : false})
    }
res.status(200).json({Message :"successfully deleted the product", success: true, data:result })
  } catch (err) {
    console.error("failed to delete product", err);
    res.status(500).json({ message: "failed to delete product", success: false });
  }
};

export const reorderProducts = async (req, res) => {
  const items = req.body; // expect: [{id: 1, display_order: 0}, {id: 2, display_order: 1}, ...]

  try {

    for (const item of items){
        const [result] = await pool.query(
            'UPDATE products SET display_order = ? WHERE id = ?',[item.display_order,item.id])
    }
    res.status(200).json({ message: "Order updated", success: true });
  } catch (err) {
    console.error("failed to reorder", err);
    res.status(500).json({ message: "failed to reorder", success: false });
  }
};