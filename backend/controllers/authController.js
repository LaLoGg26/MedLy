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

    // --- AQUÍ DEFINIMOS AL USUARIO ---
    const usuario = users[0];

    // 3. NUEVA VALIDACIÓN: Revisar si ya verificó su correo
    // (Ahora sí funciona porque 'usuario' ya existe en la línea anterior)
    if (!usuario.verificado) {
      return res.status(403).json({
        mensaje:
          "Debes verificar tu correo electrónico antes de iniciar sesión.",
        requiere_verificacion: true,
      });
    }

    // 4. Verificar si el usuario está activo (por si lo banearon en el futuro)
    if (!usuario.activo) {
      return res
        .status(403)
        .json({ mensaje: "Esta cuenta ha sido desactivada." });
    }

    // 5. Comparar la contraseña enviada con la encriptada en la BD
    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!passwordValida) {
      return res.status(401).json({ mensaje: "Credenciales inválidas." });
    }

    // 6. Generar el Token JWT
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    // 7. Verificar si el paciente ya completó su perfil
    let perfilCompletado = true; // Por defecto asumimos que sí (útil para admins y doctores)

    if (usuario.rol === 3) {
      // Solo verificamos esto si es un paciente
      const [paciente] = await pool.query(
        "SELECT id_paciente FROM pacientes WHERE id_usuario = ?",
        [usuario.id_usuario],
      );

      if (paciente.length === 0) {
        perfilCompletado = false; // No encontramos su expediente, le falta llenarlo
      }
    }

    // 8. Respuesta exitosa
    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      token,
      perfil_completado: perfilCompletado,
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

    // 1. Actualizamos la base de datos a verificado
    await pool.query(
      "UPDATE usuarios SET verificado = TRUE, codigo_verificacion = NULL WHERE id_usuario = ?",
      [usuario.id_usuario],
    );

    // 2. NUEVO: Generamos el Token para el auto-login
    // Importante: Asegúrate de tener importado 'jwt' arriba en este archivo
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    // 3. Devolvemos la respuesta exitosa con el token
    res.status(200).json({
      mensaje: "Cuenta verificada exitosamente.",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error al verificar código:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};
