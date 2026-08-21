import pool from "../config/db.js";

export const getNav = async (req, res) => {
    try {
        const [groups] = await pool.query("SELECT * FROM groups ORDER BY display_order ASC");
        const [categories] = await pool.query("SELECT * FROM categories ORDER BY display_order ASC");
        const [subcategories] = await pool.query("SELECT * FROM subcategories ORDER BY display_order ASC");
        const [products] = await pool.query("SELECT * FROM products ORDER BY display_order ASC");
        const [variants] = await pool.query("SELECT * FROM product_variants ORDER BY display_order ASC");
        const [specCounts] = await pool.query(
            "SELECT product_id, COUNT(*) AS cnt FROM product_specifications GROUP BY product_id"
        );

        const specCountMap = {};
        specCounts.forEach((row) => { specCountMap[row.product_id] = row.cnt; });

        const nav = groups.map(group => ({
            ...group,
            categories: categories
                .filter(cat => cat.group_id === group.id)
                .map(cat => ({
                    ...cat,
                    subcategories: subcategories
                        .filter(sub => sub.category_id === cat.id)
                        .map(sub => ({
                            ...sub,
                            products: products
                                .filter(prod => prod.subcategory_id === sub.id)
                                .map(prod => ({
                                    ...prod,
                                    has_specifications: (specCountMap[prod.id] || 0) > 0,
                                    variants: variants.filter(v => v.product_id === prod.id)
                                }))
                        }))
                }))
        }));

        res.status(200).json({ message: "Nav fetched successfully", data: nav, success: true });
    } catch (err) {
        console.error("failed to fetch nav", err);
        res.status(500).json({ message: "failed to fetch nav", success: false });
    }
};