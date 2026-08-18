import pool from "../config/db.js";

export const getSettings = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT setting_key, setting_value FROM site_settings");
        const settings = {};
        rows.forEach((r) => { settings[r.setting_key] = r.setting_value; });
        res.status(200).json({ message: "success", data: settings, success: true });
    } catch (err) {
        console.error("failed to fetch settings", err);
        res.status(500).json({ message: "failed to fetch settings", success: false });
    }
};

export const updateSettings = async (req, res) => {
    const updates = req.body; // { setting_key: value, ... }
    try {
        for (const key of Object.keys(updates)) {
            await pool.query(
                "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
                [key, updates[key], updates[key]]
            );
        }
        res.status(200).json({ message: "Settings updated", success: true });
    } catch (err) {
        console.error("failed to update settings", err);
        res.status(500).json({ message: "failed to update settings", success: false });
    }
};