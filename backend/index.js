// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db.js"; // Importamos para que se ejecute la prueba de conexión

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json()); // Permite al servidor entender JSON en el body de las peticiones

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de MedLy funcionando correctamente 🏥");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
