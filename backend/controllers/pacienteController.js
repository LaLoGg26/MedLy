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
      codigo_postal,
      ciudad,
    } = req.body;

    // Validación rápida de campos esenciales
    if (!id_usuario || !nombres || !apellido_paterno || !curp) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
    }

    // Insertar en la base de datos
    const [result] = await pool.query(
      `INSERT INTO pacientes 
            (id_usuario, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, curp, telefono, calle, colonia, codigo_postal, ciudad) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        codigo_postal,
        ciudad,
      ],
    );

    res.status(201).json({
      mensaje: "Expediente de paciente creado exitosamente",
      id_paciente: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear paciente:", error);
    // Manejo de error si la CURP ya existe
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ mensaje: "La CURP ya está registrada en el sistema." });
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
      return res
        .status(409)
        .json({
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
