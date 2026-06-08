// backend/routes/adminRoutes.js
import express from "express";
import {
  registrarDoctor,
  obtenerDoctores,
  crearEspecialidad,
  eliminarDoctor,
  obtenerEspecialidadesCatalogo,
  actualizarDoctor,
  obtenerMetricas,
  obtenerPacientes,
  guardarHorarioDoctor,
  obtenerHorarioDoctor,
} from "../controllers/adminController.js";

const router = express.Router();

// Nota: A futuro aquí agregaremos un middleware para asegurar que SOLO el Rol 1 pueda usar esto.
router.post("/doctores", registrarDoctor);
router.get("/doctores", obtenerDoctores);
router.delete("/doctores/:id_doctor_visible", eliminarDoctor);
router.put("/doctores/:id_doctor_visible", actualizarDoctor);
router.post("/especialidades", crearEspecialidad);
router.get("/especialidades", obtenerEspecialidadesCatalogo);
router.get("/metricas", obtenerMetricas);
router.get("/pacientes", obtenerPacientes);
router.get("/doctores/:id_doctor_visible/horarios", obtenerHorarioDoctor);
router.post("/doctores/:id_doctor_visible/horarios", guardarHorarioDoctor);

export default router;
