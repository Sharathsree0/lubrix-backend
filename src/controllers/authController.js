import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required", success: false });
    }

    try {
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({ message: "Invalid credentials", success: false });
        }

        const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials", success: false });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ message: "Login successful", success: true, token });
    } catch (err) {
        console.error("login failed", err);
        res.status(500).json({ message: "login failed", success: false });
    }
};