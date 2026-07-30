import pool from "./src/config/db.js"
import app from "./src/app.js"
import { configDotenv } from "dotenv";

const PORT = process.env.PORT
const startServer=async()=>{
let connection;
try{
    connection = await pool.getConnection()
    console.log("MYSQL Database connected succesfully")
    app.listen(PORT,()=>{console.log(`Server is running in at ${PORT} `)})
}catch (err){
    console.error("Server connection failed ", err)
}
finally{
    if(connection) connection.release()
}
}
startServer()