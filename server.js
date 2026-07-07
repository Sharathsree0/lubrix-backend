import app from "./src/app.js";
import pool from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
 let connection;

try {
    connection = await pool.getConnection();

    console.log("✅ MySQL Connected");

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });

} catch (error) {
    console.error(error);
    process.exit(1);
} finally {
    if (connection) connection.release();
}
}

startServer();