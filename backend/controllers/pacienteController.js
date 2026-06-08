// backend/controllers/pacienteController.js
import pool from "../config/db.js";

// Obtener todos los pacientes
export const obtenerPacientes = async (req, res) => {
  try {
    const [pacientes] = await pool.query("SELECT * FROM pacientes");
    res.status(200).json(pacientes);
  } catch (error) {
    console.error("Error al obtener pacientes:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Crear un nuevo paciente
export const crearPaciente = async (req, res) => {
  try {
    // Aseguramos capturar 'estado' y 'cp' (como lo manda el frontend)
    const {
      id_usuario,
      nombres,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento,
      sexo,
      curp,
      telefono,
      calle,
      colonia,
      cp,
      ciudad,
      estado,
    } = req.body;

    if (!id_usuario || !nombres || !apellido_paterno || !curp) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
    }

    const [result] = await pool.query(
      `INSERT INTO pacientes 
            (id_usuario, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, curp, telefono, calle, colonia, codigo_postal, ciudad, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_usuario,
        nombres,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento,
        sexo,
        curp,
        telefono,
        calle,
        colonia,
        cp,
        ciudad,
        estado,
      ],
    );

    const idGenerado = `PAC-${result.insertId.toString().padStart(5, "0")}`;

    await pool.query(
      "UPDATE pacientes SET id_paciente_visible = ? WHERE id_paciente = ?",
      [idGenerado, result.insertId],
    );

    res.status(201).json({
      mensaje: "Expediente de paciente creado exitosamente",
      id_paciente: idGenerado,
    });
  } catch (error) {
    console.error("Error al crear paciente:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensaje: "La CURP o el usuario ya están registrados en el sistema.",
      });
    }
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Actualizar un paciente existente
export const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombres,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento,
      sexo,
      curp,
      telefono,
      calle,
      colonia,
      codigo_postal,
      ciudad,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE pacientes 
            SET nombres = ?, apellido_paterno = ?, apellido_materno = ?, 
                fecha_nacimiento = ?, sexo = ?, curp = ?, telefono = ?, 
                calle = ?, colonia = ?, codigo_postal = ?, ciudad = ? 
            WHERE id_paciente = ?`,
      [
        nombres,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento,
        sexo,
        curp,
        telefono,
        calle,
        colonia,
        codigo_postal,
        ciudad,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Paciente no encontrado." });
    }

    res
      .status(200)
      .json({ mensaje: "Expediente de paciente actualizado correctamente." });
  } catch (error) {
    console.error("Error al actualizar paciente:", error);
    // Manejo de error si intentan poner una CURP que ya le pertenece a otro
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensaje: "La CURP ingresada ya está registrada en otro expediente.",
      });
    }
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Eliminar un paciente
export const eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM pacientes WHERE id_paciente = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Paciente no encontrado." });
    }

    res
      .status(200)
      .json({ mensaje: "Expediente de paciente eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar paciente:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

export const obtenerPerfilPaciente = async (req, res) => {
  try {
    // Hacemos un console.log rápido para ver qué trae tu token realmente
    console.log("Datos del token:", req.usuario);

    // Atrapamos la variable, ya sea que la hayas llamado id_usuario o id en el login
    const idUsuarioLogueado = req.usuario.id_usuario || req.usuario.id;

    if (!idUsuarioLogueado) {
      return res
        .status(400)
        .json({ mensaje: "El token no contiene un ID válido" });
    }

    const [rows] = await pool.query(
      // Asegúrate de tener importado 'pool' arriba
      "SELECT nombres, apellido_paterno FROM pacientes WHERE id_usuario = ?",
      [idUsuarioLogueado],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "Perfil de paciente no encontrado." });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al obtener el perfil del paciente:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor al cargar el perfil." });
  }
};
