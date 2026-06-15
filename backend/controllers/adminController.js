// backend/controllers/adminController.js
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { enviarCredencialesDoctor } from "../utils/mailer.js";

export const registrarDoctor = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      nombres,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento,
      sexo,
      curp,
      telefono,
      correo_personal,
      cedula,
      horario,
      calle,
      colonia,
      codigo_postal,
      ciudad,
      estado,
      especialidades,
    } = req.body;

    let prefijo = sexo === "FEMENINO" ? "dra" : "dr";
    const primerNombre = nombres
      .split(" ")[0]
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const primerApellido = apellido_paterno
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    let correoBase = `${prefijo}.${primerNombre}.${primerApellido}`;
    let correoInstitucional = `${correoBase}@medly.com`;

    let contador = 1;
    let correoExiste = true;
    while (correoExiste) {
      const [users] = await connection.query(
        "SELECT id_usuario FROM usuarios WHERE correo = ?",
        [correoInstitucional],
      );
      if (users.length === 0) {
        correoExiste = false;
      } else {
        contador++;
        correoInstitucional = `${correoBase}${contador}@medly.com`;
      }
    }

    // -------------------------------------------------------------------------
    // CAMBIO APLICADO AQUÍ: Agregamos debe_cambiar_password = TRUE
    // -------------------------------------------------------------------------
    const [userResult] = await connection.query(
      `INSERT INTO usuarios (correo, contrasena, rol, verificado, activo, debe_cambiar_password) VALUES (?, ?, 2, TRUE, TRUE, TRUE)`,
      [correoInstitucional, "temporal"],
    );
    const idNuevoUsuario = userResult.insertId;

    // 2. En doctores ya no insertamos correo_institucional, solo el correo_personal
    const [docResult] = await connection.query(
      `INSERT INTO doctores 
            (id_usuario, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, curp, telefono, correo_personal,
             cedula, calle, colonia, codigo_postal, ciudad, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idNuevoUsuario,
        nombres,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento,
        sexo,
        curp,
        telefono,
        correo_personal,
        cedula,
        calle,
        colonia,
        codigo_postal,
        ciudad,
        estado,
      ],
    );
    const idNuevoDoctor = docResult.insertId;

    if (especialidades && especialidades.length > 0) {
      for (const esp of especialidades) {
        if (esp.id_especialidad && esp.cedula_especialidad) {
          await connection.query(
            `INSERT INTO doctores_especialidades (id_doctor, id_especialidad, cedula_especialidad) VALUES (?, ?, ?)`,
            [idNuevoDoctor, esp.id_especialidad, esp.cedula_especialidad],
          );
        }
      }
    }

    const passwordOficial = `DOC-${idNuevoDoctor.toString().padStart(5, "0")}`;
    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(passwordOficial, salt);

    await connection.query(
      "UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?",
      [passwordHasheada, idNuevoUsuario],
    );
    await connection.query(
      "UPDATE doctores SET id_doctor_visible = ? WHERE id_doctor = ?",
      [passwordOficial, idNuevoDoctor],
    );

    await enviarCredencialesDoctor(
      correo_personal,
      correoInstitucional,
      passwordOficial,
      nombres,
    );
    await connection.commit();

    res.status(201).json({
      mensaje: "Doctor registrado exitosamente",
      correo_generado: correoInstitucional,
      id_doctor: passwordOficial,
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor al registrar doctor" });
  } finally {
    connection.release();
  }
};

export const obtenerDoctores = async (req, res) => {
  try {
    // 3. Hacemos JOIN con usuarios (u) para obtener el correo_institucional dinámicamente
    const [doctores] = await pool.query(`
            SELECT 
                d.id_doctor_visible, d.nombres, d.apellido_paterno, d.apellido_materno, 
                d.cedula, d.telefono, d.correo_personal,
                u.correo AS correo_institucional,
                d.calle, d.colonia, d.codigo_postal, d.ciudad, d.estado,
                IFNULL(GROUP_CONCAT(ce.nombre_especialidad SEPARATOR ', '), 'Médico General') AS especialidad
            FROM doctores d
            INNER JOIN usuarios u ON d.id_usuario = u.id_usuario
            LEFT JOIN doctores_especialidades de ON d.id_doctor = de.id_doctor
            LEFT JOIN catalogo_especialidades ce ON de.id_especialidad = ce.id_especialidad
            GROUP BY d.id_doctor
            ORDER BY d.id_doctor DESC
        `);
    res.status(200).json(doctores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al cargar médicos" });
  }
};

export const actualizarDoctor = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id_doctor_visible } = req.params;
    const {
      telefono,
      correo_personal,
      calle,
      colonia,
      codigo_postal,
      ciudad,
      estado,
      nuevasEspecialidades,
    } = req.body;

    // 1. Obtener el ID interno del médico
    const [docRow] = await connection.query(
      "SELECT id_doctor FROM doctores WHERE id_doctor_visible = ?",
      [id_doctor_visible],
    );
    if (docRow.length === 0) {
      return res.status(404).json({ mensaje: "Médico no encontrado." });
    }
    const id_doctor = docRow[0].id_doctor;

    // 2. Actualizar solo la información permitida
    await connection.query(
      `UPDATE doctores SET 
                telefono = ?, correo_personal = ?, calle = ?, colonia = ?, codigo_postal = ?, ciudad = ?, estado = ? 
             WHERE id_doctor = ?`,
      [
        telefono,
        correo_personal,
        calle,
        colonia,
        codigo_postal,
        ciudad,
        estado,
        id_doctor,
      ],
    );

    // 3. Insertar las nuevas especialidades si el administrador decidió agregar alguna
    if (nuevasEspecialidades && nuevasEspecialidades.length > 0) {
      for (const esp of nuevasEspecialidades) {
        if (esp.id_especialidad && esp.cedula_especialidad) {
          await connection.query(
            `INSERT INTO doctores_especialidades (id_doctor, id_especialidad, cedula_especialidad) 
                         VALUES (?, ?, ?) 
                         ON DUPLICATE KEY UPDATE cedula_especialidad = ?`,
            [
              id_doctor,
              esp.id_especialidad,
              esp.cedula_especialidad,
              esp.cedula_especialidad,
            ],
          );
        }
      }
    }

    await connection.commit();
    res
      .status(200)
      .json({ mensaje: "Perfil médico actualizado correctamente." });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ mensaje: "Error al actualizar el perfil médico." });
  } finally {
    connection.release();
  }
};

export const eliminarDoctor = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id_doctor_visible } = req.params;

    // Buscamos primero el id_usuario vinculado a ese doctor
    const [rows] = await connection.query(
      "SELECT id_usuario FROM doctores WHERE id_doctor_visible = ?",
      [id_doctor_visible],
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Médico no encontrado." });
    }
    const id_usuario = rows[0].id_usuario;

    // Borramos de manera explícita en ambas tablas para evitar conflictos de llaves foráneas
    // Al borrar al doctor, por ON DELETE CASCADE se limpiará también la tabla pivote de especialidades
    await connection.query("DELETE FROM doctores WHERE id_doctor_visible = ?", [
      id_doctor_visible,
    ]);
    await connection.query("DELETE FROM usuarios WHERE id_usuario = ?", [
      id_usuario,
    ]);

    await connection.commit();
    res
      .status(200)
      .json({ mensaje: "Médico y cuenta eliminados exitosamente." });
  } catch (error) {
    await connection.rollback();
    console.error("Error al eliminar doctor:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor al eliminar al médico" });
  } finally {
    connection.release();
  }
};

// 1. Agregar una nueva especialidad al catálogo
export const crearEspecialidad = async (req, res) => {
  try {
    const { nombre_especialidad, descripcion } = req.body;

    // Validación básica
    if (!nombre_especialidad) {
      return res
        .status(400)
        .json({ mensaje: "El nombre de la especialidad es obligatorio." });
    }

    // Insertamos en la tabla catálogo (convertimos el nombre a MAYÚSCULAS para estandarizar)
    await pool.query(
      "INSERT INTO catalogo_especialidades (nombre_especialidad, descripcion) VALUES (?, ?)",
      [nombre_especialidad.toUpperCase().trim(), descripcion],
    );

    res.status(201).json({
      mensaje: "Especialidad agregada al catálogo exitosamente",
    });
  } catch (error) {
    console.error("Error al crear especialidad:", error);
    // Validar si intentan duplicar una especialidad que ya existe
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensaje: "Esta especialidad ya se encuentra registrada en el catálogo.",
      });
    }
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor al gestionar el catálogo" });
  }
};

// 2. Obtener todas las especialidades activas del catálogo
export const obtenerEspecialidadesCatalogo = async (req, res) => {
  try {
    // Traemos solo las especialidades que estén activas
    const [especialidades] = await pool.query(
      "SELECT id_especialidad, nombre_especialidad, descripcion FROM catalogo_especialidades WHERE activa = TRUE ORDER BY nombre_especialidad ASC",
    );

    res.status(200).json(especialidades);
  } catch (error) {
    console.error("Error al obtener el catálogo de especialidades:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor al cargar el catálogo" });
  }
};

export const obtenerMetricas = async (req, res) => {
  try {
    // Contamos el total de doctores
    const [medicos] = await pool.query(
      "SELECT COUNT(*) AS total FROM doctores",
    );

    // Contamos el total de pacientes
    const [pacientes] = await pool.query(
      "SELECT COUNT(*) AS total FROM pacientes",
    );

    // (A futuro aquí agregaremos la consulta para contar las citas del día de hoy)

    res.status(200).json({
      totalMedicos: medicos[0].total,
      totalPacientes: pacientes[0].total,
      citasHoy: 0, // Placeholder temporal
    });
  } catch (error) {
    console.error("Error al cargar métricas:", error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener los datos del dashboard" });
  }
};

export const obtenerPacientes = async (req, res) => {
  try {
    // Hacemos JOIN con usuarios para traer también su correo electrónico de registro
    const [pacientes] = await pool.query(`
            SELECT p.id_paciente, p.nombres, p.apellido_paterno, p.apellido_materno, 
                   p.curp, p.telefono, p.fecha_nacimiento, u.correo
            FROM pacientes p
            INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
            ORDER BY p.id_paciente DESC
        `);

    res.status(200).json(pacientes);
  } catch (error) {
    console.error("Error al obtener pacientes:", error);
    res.status(500).json({
      mensaje:
        "Error interno del servidor al cargar el directorio de pacientes",
    });
  }
};

export const obtenerHorarioDoctor = async (req, res) => {
  try {
    const { id_doctor_visible } = req.params;

    // Primero obtenemos el ID interno
    const [docRow] = await pool.query(
      "SELECT id_doctor FROM doctores WHERE id_doctor_visible = ?",
      [id_doctor_visible],
    );
    if (docRow.length === 0) {
      return res.status(404).json({ mensaje: "Médico no encontrado." });
    }
    const id_doctor = docRow[0].id_doctor;

    // Buscamos sus horarios ordenados por día de la semana
    const [horarios] = await pool.query(
      "SELECT dia_semana, hora_inicio, hora_fin FROM horarios_doctores WHERE id_doctor = ? ORDER BY dia_semana ASC",
      [id_doctor],
    );

    res.status(200).json(horarios);
  } catch (error) {
    console.error("Error al obtener el horario:", error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener el horario del médico." });
  }
};

export const guardarHorarioDoctor = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id_doctor_visible } = req.params;
    const { horarios } = req.body; // Esperamos un arreglo: [{ dia_semana: 1, hora_inicio: '08:00', hora_fin: '14:00' }, ...]

    // Obtenemos el ID interno
    const [docRow] = await connection.query(
      "SELECT id_doctor FROM doctores WHERE id_doctor_visible = ?",
      [id_doctor_visible],
    );
    if (docRow.length === 0) {
      return res.status(404).json({ mensaje: "Médico no encontrado." });
    }
    const id_doctor = docRow[0].id_doctor;

    // ESTRATEGIA LIMPIA: Borramos el horario anterior completo y guardamos el nuevo
    await connection.query(
      "DELETE FROM horarios_doctores WHERE id_doctor = ?",
      [id_doctor],
    );

    // Insertamos los nuevos bloques de tiempo
    if (horarios && horarios.length > 0) {
      for (const bloque of horarios) {
        // Validación básica de datos
        if (
          bloque.dia_semana !== undefined &&
          bloque.hora_inicio &&
          bloque.hora_fin
        ) {
          await connection.query(
            "INSERT INTO horarios_doctores (id_doctor, dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)",
            [id_doctor, bloque.dia_semana, bloque.hora_inicio, bloque.hora_fin],
          );
        }
      }
    }

    await connection.commit();
    res
      .status(200)
      .json({ mensaje: "Horario del médico guardado correctamente." });
  } catch (error) {
    await connection.rollback();
    console.error("Error al guardar el horario:", error);
    res.status(500).json({ mensaje: "Error interno al guardar el horario." });
  } finally {
    connection.release();
  }
};
