// backend/controllers/doctorController.js
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { transporter } from "../utils/mailer.js"; // Ajusta la ruta si tu mailer está en otra parte

// 1. Obtener el perfil del doctor conectado y validar si está en su horario laboral
export const obtenerPerfilDoctor = async (req, res) => {
  try {
    const idUsuarioLogueado = req.usuario.id_usuario || req.usuario.id;

    const [rows] = await pool.query(
      `
            SELECT d.id_doctor, d.nombres, d.apellido_paterno, d.apellido_materno, d.correo_personal, u.debe_cambiar_password
            FROM doctores d
            INNER JOIN usuarios u ON d.id_usuario = u.id_usuario
            WHERE d.id_usuario = ?
        `,
      [idUsuarioLogueado],
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Médico no encontrado." });
    }

    const doctor = rows[0];

    // --- CÁLCULO MATEMÁTICO DE HORARIO LABORAL ---
    const ahora = new Date();
    const diaSemana = ahora.getDay();
    const horaActualStr = ahora.toTimeString().split(" ")[0];

    const [horarioHoy] = await pool.query(
      `
            SELECT hora_inicio, hora_fin 
            FROM horarios_doctores 
            WHERE id_doctor = ? AND dia_semana = ?
        `,
      [doctor.id_doctor, diaSemana],
    );

    let enHorarioLaboral = false;

    if (horarioHoy.length > 0) {
      const { hora_inicio, hora_fin } = horarioHoy[0];
      if (horaActualStr >= hora_inicio && horaActualStr <= hora_fin) {
        enHorarioLaboral = true;
      }
    }

    res.status(200).json({
      nombres: doctor.nombres,
      apellido_paterno: doctor.apellido_paterno,
      apellido_materno: doctor.apellido_materno,
      correo_personal: doctor.correo_personal,
      debeCambiarPassword: doctor.debe_cambiar_password,
      enHorarioLaboral: enHorarioLaboral,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al cargar el perfil del médico." });
  }
};

// 2. Generar y enviar código de verificación al correo personal
export const enviarCodigoPassword = async (req, res) => {
  try {
    const idUsuarioLogueado = req.usuario.id_usuario || req.usuario.id;

    const [rows] = await pool.query(
      "SELECT correo_personal FROM doctores WHERE id_usuario = ?",
      [idUsuarioLogueado],
    );
    if (rows.length === 0)
      return res.status(404).json({ mensaje: "Doctor no encontrado." });

    const correoPersonal = rows[0].correo_personal;
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const tiempoExpira = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "UPDATE usuarios SET codigo_verificacion = ?, codigo_expira = ? WHERE id_usuario = ?",
      [codigo, tiempoExpira, idUsuarioLogueado],
    );

    const mailOptions = {
      from: '"MedLy Seguridad" <soporte@medly.com>',
      to: correoPersonal,
      subject: "Código de Verificación - Primer Inicio de Sesión MedLy",
      html: `
                <div style="font-family: sans-serif; padding: 20px; color: #334155;">
                    <h2 style="color: #0F766E;">Verificación de Seguridad</h2>
                    <p>Estimado profesional médico, para activar su cuenta y definir su contraseña personalizada, use el siguiente código:</p>
                    <div style="background: #F0FDF4; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #115E59;">${codigo}</span>
                    </div>
                    <p style="font-size: 12px; color: #64748B;">Este código es de un solo uso y expirará en 10 minutos.</p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({
      mensaje: "Código enviado con éxito a tu correo personal registrado.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al procesar el envío del código." });
  }
};

// 3. Validar código y actualizar a la contraseña definitiva
export const actualizarPasswordPrimero = async (req, res) => {
  try {
    const idUsuarioLogueado = req.usuario.id_usuario || req.usuario.id;
    const { codigo, nuevaPassword } = req.body;

    const [userRows] = await pool.query(
      "SELECT codigo_verificacion, codigo_expira FROM usuarios WHERE id_usuario = ?",
      [idUsuarioLogueado],
    );

    if (userRows.length === 0)
      return res.status(404).json({ mensaje: "Usuario no encontrado." });

    const usuario = userRows[0];
    const ahora = new Date();

    if (
      !usuario.codigo_verificacion ||
      usuario.codigo_verificacion !== codigo
    ) {
      return res
        .status(400)
        .json({ mensaje: "El código de verificación es incorrecto." });
    }

    if (ahora > new Date(usuario.codigo_expira)) {
      return res.status(400).json({
        mensaje: "El código ha expirado. Por favor solicita uno nuevo.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(nuevaPassword, salt);

    await pool.query(
      `UPDATE usuarios 
             SET contrasena = ?, debe_cambiar_password = FALSE, codigo_verificacion = NULL, codigo_expira = NULL 
             WHERE id_usuario = ?`,
      [passwordHasheada, idUsuarioLogueado],
    );

    res.status(200).json({
      mensaje:
        "Contraseña actualizada correctamente. ¡Tu cuenta ya está activa!",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Error interno al actualizar la contraseña." });
  }
};
