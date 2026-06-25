// backend/routes/doctorRoutes.js
import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import {
  obtenerPerfilDoctor,
  enviarCodigoPassword,
  actualizarPasswordPrimero,
  obtenerCitasProgramadas,
  obtenerDirectorioPacientes,
  obtenerExpedienteBase,
  guardarExpedienteBase,
  guardarConsultaActual,
  emitirReceta,
} from "../controllers/doctorController.js";

const router = express.Router();

router.get("/perfil", verificarToken, obtenerPerfilDoctor);
router.post("/enviar-codigo-seguridad", verificarToken, enviarCodigoPassword);
router.post(
  "/cambiar-password-primero",
  verificarToken,
  actualizarPasswordPrimero,
);
router.get("/citas-programadas", verificarToken, obtenerCitasProgramadas);
router.get("/pacientes", verificarToken, obtenerDirectorioPacientes);
router.get("/expediente/:id_paciente", verificarToken, obtenerExpedienteBase);
router.post("/expediente", verificarToken, guardarExpedienteBase);
router.post("/consulta-actual", verificarToken, guardarConsultaActual);
router.post("/emitir-receta", verificarToken, emitirReceta);

export default router;
