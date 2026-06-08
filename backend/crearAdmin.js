// backend/crearAdmin.js
import bcrypt from "bcrypt";
import pool from "./config/db.js";

const crearAdministrador = async () => {
  try {
    // Puedes cambiar este correo y contraseña por los que tú prefieras
    const correoAdmin = "ary.eddgg@gmail.com";
    const contrasenaPlana = "Lalogg26"; // Cumple con los requisitos de seguridad
    const rolAdmin = 1;

    console.log(`Creando administrador con correo: ${correoAdmin}...`);

    // 1. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(contrasenaPlana, salt);

    // 2. Insertar directamente en la base de datos (y lo marcamos como verificado)
    const [result] = await pool.query(
      `INSERT INTO usuarios (correo, contrasena, rol, verificado, activo) 
             VALUES (?, ?, ?, TRUE, TRUE)`,
      [correoAdmin, passwordHasheada, rolAdmin],
    );

    console.log("✅ ¡Administrador creado exitosamente!");
    console.log(`ID del usuario: ${result.insertId}`);

    // Cerramos la conexión para que la terminal no se quede colgada
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al crear administrador:", error);
    // Manejar si ya existe
    if (error.code === "ER_DUP_ENTRY") {
      console.log("El correo del administrador ya existe en la base de datos.");
    }
    process.exit(1);
  }
};

crearAdministrador();
