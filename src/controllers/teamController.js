import pool from "../config/db.js";

export const getTeamMembers = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM team_members ORDER BY display_order ASC");
        res.status(200).json({ message: "success", data: rows, success: true });
    } catch (err) {
        res.status(500).json({ message: "failed to fetch team", success: false });
    }
};

export const createTeamMember = async (req, res) => {
    const { name, role, department, bio, is_chairman } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required", success: false });
    try {
        const imagePath = req.file ? `/uploads/team/${req.file.filename}` : null;
        const [[{ nextOrder }]] = await pool.query("SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM team_members");
        const [insertResult] = await pool.query(
            "INSERT INTO team_members (name, role, department, image_url, bio, is_chairman, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [name, role || null, department || null, imagePath, bio || null, is_chairman ? 1 : 0, nextOrder]
        );
        res.status(201).json({ message: "Team member added", success: true, data: { id: insertResult.insertId } });
    } catch (err) {
        console.error("failed to create team member", err);
        res.status(500).json({ message: "failed to create team member", success: false });
    }
};

export const updateTeamMember = async (req, res) => {
    const { id } = req.params;
    const { name, role, department, bio, is_chairman } = req.body;
    try {
        const [current] = await pool.query("SELECT image_url FROM team_members WHERE id = ?", [id]);
        if (current.length === 0) return res.status(404).json({ message: "Not found", success: false });
        const imagePath = req.file ? `/uploads/team/${req.file.filename}` : current[0].image_url;
        await pool.query(
            "UPDATE team_members SET name=?, role=?, department=?, image_url=?, bio=?, is_chairman=? WHERE id=?",
            [name, role || null, department || null, imagePath, bio || null, is_chairman ? 1 : 0, id]
        );
        res.status(200).json({ message: "Updated", success: true });
    } catch (err) {
        res.status(500).json({ message: "failed to update", success: false });
    }
};

export const deleteTeamMember = async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM team_members WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Not found", success: false });
        res.status(200).json({ message: "Deleted", success: true });
    } catch (err) {
        res.status(500).json({ message: "failed to delete", success: false });
    }
};

export const reorderTeamMembers = async (req, res) => {
    const items = req.body;
    try {
        for (const item of items) {
            await pool.query("UPDATE team_members SET display_order = ? WHERE id = ?", [item.display_order, item.id]);
        }
        res.status(200).json({ message: "Order updated", success: true });
    } catch (err) {
        res.status(500).json({ message: "failed to reorder", success: false });
    }
};