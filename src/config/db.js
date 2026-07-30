import { createPool } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config()

const pool = await createPool({
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  user:process.env.DB_USER,
  database:process.env.DB_NAME,
  password:process.env.DB_PASSWORD,

  waitForConnections:true,
  connectionLimit:10
})

export default pool;