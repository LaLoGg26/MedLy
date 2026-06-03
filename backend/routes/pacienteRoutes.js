// backend/routes/pacienteRoutes.js
import express from "express";
import {
  obtenerPacientes,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente,
} from "../controllers/pacienteController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas estas rutas pasan primero por verificarToken
router.get("/", verificarToken, obtenerPacientes);
router.post("/", verificarToken, crearPaciente);

router.put("/:id", verificarToken, actualizarPaciente);
router.delete("/:id", verificarToken, eliminarPaciente);

export default router;
