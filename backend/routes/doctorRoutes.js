// backend/routes/doctorRoutes.js
import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import {
  obtenerPerfilDoctor,
  enviarCodigoPassword,
  actualizarPasswordPrimero,
} from "../controllers/doctorController.js";

const router = express.Router();

router.get("/perfil", verificarToken, obtenerPerfilDoctor);
router.post("/enviar-codigo-seguridad", verificarToken, enviarCodigoPassword);
router.post(
  "/cambiar-password-primero",
  verificarToken,
  actualizarPasswordPrimero,
);

export default router;
