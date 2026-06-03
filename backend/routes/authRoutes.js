// backend/routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  verificarCodigo,
} from "../controllers/authController.js";
import { verificarToken, verificarRol } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register); //Ruta de registro de usuario
router.post("/login", login); //ruta de logeo de usuario
router.post("/verificar", verificarCodigo);

router.get("/perfil", verificarToken, (req, res) => {
  res.json({
    mensaje: "¡Entraste a la zona VIP de MedLy!",
    datos_del_token: req.usuario,
  });
});

export default router;
