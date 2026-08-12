import pool from "../config/db.js";

export const getNav = async (req, res) => {
    try {
        const [categories] = await pool.query("SELECT * FROM categories ORDER BY display_order ASC");
        const [subcategories] = await pool.query("SELECT * FROM subcategories ORDER BY display_order ASC");
        const [products] = await pool.query("SELECT * FROM products ORDER BY display_order ASC");
        const [variants] = await pool.query("SELECT * FROM product_variants ORDER BY display_order ASC");

        const tree = categories.map(category => ({
            ...category,
            subcategories: subcategories
                .filter(sub => sub.category_id === category.id)
                .map(sub => ({
                    ...sub,
                    products: products
                        .filter(prod => prod.subcategory_id === sub.id)
                        .map(prod => ({
                            ...prod,
                            variants: variants.filter(v => v.product_id === prod.id)
                        }))
                }))
        }));

        res.status(200).json({ message: "Nav fetched successfully", data: tree, success: true });
    } catch (err) {
        console.error("failed to fetch nav", err);
        res.status(500).json({ message: "failed to fetch nav", success: false });
    }
};