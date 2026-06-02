// backend/config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Función simple para probar la conexión al iniciar el servidor
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conexión a la base de datos medly_db exitosa.");
    connection.release();
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error.message);
  }
};

testConnection();

export default pool;
