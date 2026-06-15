import express from "express";
import {
  agendarCitaAutomatica,
  obtenerCitasPaciente,
} from "../controllers/citaController.js";
import { verificarToken } from "../middlewares/authMiddleware.js"; // Asegúrate que el nombre y exportación coincidan con tu archivo

const router = express.Router();

// Ruta protegida para que el paciente solicite cita
router.post("/agendar", verificarToken, agendarCitaAutomatica);
router.get("/paciente", verificarToken, obtenerCitasPaciente);

export default router;
