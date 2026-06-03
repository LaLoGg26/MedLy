// backend/controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { enviarCorreoVerificacion } from "../utils/mailer.js";

export const register = async (req, res) => {
  try {
    // Extraemos los datos que enviará el frontend
    const { correo, contrasena, rol } = req.body;

    // 1. Validación básica
    if (!correo || !contrasena || !rol) {
      return res
        .status(400)
        .json({ mensaje: "Todos los campos son obligatorios." });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(contrasena)) {
      return res.status(400).json({
        mensaje: "La contraseña no cumple con los requisitos de seguridad.",
      });
    }

    // 2. Verificar si el correo ya está registrado
    const [existingUser] = await pool.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo],
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ mensaje: "El correo ya está en uso." });
    }

    // 3. Encriptar la contraseña (salt = 10 es el estándar recomendado)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const codigoVerificacion = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // 4. Insertar el nuevo usuario en la base de datos
    const [result] = await pool.query(
      "INSERT INTO usuarios (correo, contrasena, rol, codigo_verificacion) VALUES (?, ?, ?, ?)",
      [correo, hashedPassword, rol, codigoVerificacion],
    );

    await enviarCorreoVerificacion(correo, codigoVerificacion);

    // 5. Respuesta exitosa
    res.status(201).json({
      mensaje:
        "Usuario creado. Se ha enviado un código de verificación a tu correo.",
      requiere_verificacion: true,
      correo: correo,
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // 1. Validar que vengan los datos
    if (!correo || !contrasena) {
      return res
        .status(400)
        .json({ mensaje: "Correo y contraseña son obligatorios." });
    }

    // 2. Buscar al usuario en la base de datos
    const [users] = await pool.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo],
    );

    if (users.length === 0) {
      return res.status(401).json({ mensaje: "Credenciales inválidas." });
    }

    const usuario = users[0];

    // 3. Verificar si el usuario está activo (por si lo banearon en el futuro)
    if (!usuario.activo) {
      return res
        .status(403)
        .json({ mensaje: "Esta cuenta ha sido desactivada." });
    }

    // 4. Comparar la contraseña enviada con la encriptada en la BD
    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!passwordValida) {
      return res.status(401).json({ mensaje: "Credenciales inválidas." });
    }

    // 5. Generar el Token JWT
    // Usamos el secreto que guardamos en tu archivo .env
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }, // El token caduca en 8 horas por seguridad
    );

    // 6. Respuesta exitosa (Nunca devolvemos la contraseña al frontend)
    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }

  if (!usuario.verificado) {
    return res.status(403).json({
      mensaje: "Debes verificar tu correo electrónico antes de iniciar sesión.",
      requiere_verificacion: true,
    });
  }

  // 3. Verificar si el usuario está activo (por si lo banearon en el futuro)
  if (!usuario.activo) {
    return res
      .status(403)
      .json({ mensaje: "Esta cuenta ha sido desactivada." });
  }
};

export const verificarCodigo = async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    if (!correo || !codigo) {
      return res
        .status(400)
        .json({ mensaje: "Correo y código son obligatorios." });
    }

    const [users] = await pool.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo],
    );

    if (users.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    const usuario = users[0];

    if (usuario.verificado) {
      return res
        .status(400)
        .json({ mensaje: "Esta cuenta ya está verificada." });
    }

    if (usuario.codigo_verificacion !== codigo) {
      return res
        .status(401)
        .json({ mensaje: "Código de verificación incorrecto." });
    }

    // Si el código es correcto, actualizamos la base de datos
    await pool.query(
      "UPDATE usuarios SET verificado = TRUE, codigo_verificacion = NULL WHERE id_usuario = ?",
      [usuario.id_usuario],
    );

    res.status(200).json({
      mensaje: "Cuenta verificada exitosamente. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    console.error("Error al verificar código:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};
