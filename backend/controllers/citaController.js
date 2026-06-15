import pool from "../config/db.js";
import { enviarCorreoConfirmacionCita } from "../utils/mailer.js";

export const agendarCitaAutomatica = async (req, res) => {
  try {
    // 1. Extraer el id_usuario del token (ajustado a tu consola)
    const id_usuario = req.usuario.id_usuario;

    // 2. Buscar cuál es el id_paciente real vinculado a este usuario
    const [pacienteInfo] = await pool.query(
      `SELECT id_paciente FROM pacientes WHERE id_usuario = ?`,
      [id_usuario],
    );

    // Validar que el paciente realmente haya completado su perfil
    if (pacienteInfo.length === 0) {
      return res.status(404).json({
        message: "No se encontró el perfil médico de este paciente.",
      });
    }

    const id_paciente = pacienteInfo[0].id_paciente;

    // 3. Iniciar la búsqueda a partir del día de mañana
    let fechaBusqueda = new Date();
    fechaBusqueda.setDate(fechaBusqueda.getDate() + 1);

    let citaAgendada = null;
    let diasBuscados = 0;
    const MAX_DIAS_BUSQUEDA = 30;

    const transformarATiempoString = (minutosTotales) => {
      const hrs = String(Math.floor(minutosTotales / 60)).padStart(2, "0");
      const mins = String(minutosTotales % 60).padStart(2, "0");
      return `${hrs}:${mins}:00`;
    };

    const transformarAMinutos = (tiempoStr) => {
      const [hrs, mins] = tiempoStr.split(":").map(Number);
      return hrs * 60 + mins;
    };

    while (!citaAgendada && diasBuscados < MAX_DIAS_BUSQUEDA) {
      const year = fechaBusqueda.getFullYear();
      const month = String(fechaBusqueda.getMonth() + 1).padStart(2, "0");
      const day = String(fechaBusqueda.getDate()).padStart(2, "0");
      const fechaStr = `${year}-${month}-${day}`;

      const diaSemana = fechaBusqueda.getDay();

      const [horarios] = await pool.query(
        `SELECT id_doctor, hora_inicio, hora_fin FROM horarios_doctores WHERE dia_semana = ?`,
        [diaSemana],
      );

      if (horarios.length > 0) {
        const [citasOcupadas] = await pool.query(
          `SELECT id_doctor, hora FROM citas WHERE fecha = ? AND estado = 'programada'`,
          [fechaStr],
        );

        const [cargaTrabajo] = await pool.query(
          `SELECT id_doctor, COUNT(*) as total_citas FROM citas WHERE fecha = ? AND estado = 'programada' GROUP BY id_doctor`,
          [fechaStr],
        );

        const mapaCarga = {};
        // Aseguramos que la carga se convierta a número real para que la resta del empate no falle
        cargaTrabajo.forEach((row) => {
          mapaCarga[row.id_doctor] = parseInt(row.total_citas) || 0;
        });

        let minutosInicioClinica = 24 * 60;
        let minutosFinClinica = 0;
        horarios.forEach((h) => {
          const minInicio = transformarAMinutos(h.hora_inicio);
          const minFin = transformarAMinutos(h.hora_fin);
          if (minInicio < minutosInicioClinica)
            minutosInicioClinica = minInicio;
          if (minFin > minutosFinClinica) minutosFinClinica = minFin;
        });

        let minutosActuales = minutosInicioClinica;

        // 3. Iterar en el día actual en bloques de 60 minutos
        while (minutosActuales + 60 <= minutosFinClinica) {
          const horaActualStr = transformarATiempoString(minutosActuales); // Ej: "08:00:00"
          const horaCortaStr = horaActualStr.substring(0, 5); // Ej: "08:00"

          const doctoresActivos = horarios.filter((h) => {
            const inicioDoc = transformarAMinutos(h.hora_inicio);
            const finDoc = transformarAMinutos(h.hora_fin);
            return (
              minutosActuales >= inicioDoc && minutosActuales + 60 <= finDoc
            );
          });

          // BLINDAJE: Comparar solo Horas y Minutos ("08:00")
          const doctoresDisponibles = doctoresActivos.filter((doc) => {
            const estaOcupado = citasOcupadas.some((cita) => {
              const horaCitaDb = String(cita.hora).substring(0, 5);
              return (
                cita.id_doctor === doc.id_doctor && horaCitaDb === horaCortaStr
              );
            });
            return !estaOcupado;
          });

          if (doctoresDisponibles.length > 0) {
            // DESEMPATE: Ordenar explícitamente de menor a mayor carga
            doctoresDisponibles.sort((a, b) => {
              const cargaA = mapaCarga[a.id_doctor] || 0;
              const cargaB = mapaCarga[b.id_doctor] || 0;
              return cargaA - cargaB;
            });

            // Se asigna al que quedó en la primera posición (el de menor carga)
            const doctorElegido = doctoresDisponibles[0].id_doctor;

            // Insertar en la BD
            await pool.query(
              `INSERT INTO citas (id_paciente, id_doctor, fecha, hora) VALUES (?, ?, ?, ?)`,
              [id_paciente, doctorElegido, fechaStr, horaActualStr],
            );

            const [infoCorreo] = await pool.query(
              `SELECT 
                                u.correo, 
                                p.nombres AS paciente_nombre, 
                                d.nombres AS doctor_nombre, 
                                d.apellido_paterno AS doctor_apellido
                             FROM usuarios u
                             JOIN pacientes p ON u.id_usuario = p.id_usuario
                             JOIN doctores d ON d.id_doctor = ?
                             WHERE u.id_usuario = ?`,
              [doctorElegido, id_usuario],
            );

            if (infoCorreo.length > 0) {
              const datos = infoCorreo[0];

              // Formatear la fecha a texto amigable
              const fechaFormateada = new Date(
                `${fechaStr}T00:00:00`,
              ).toLocaleDateString("es-MX", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              // Disparamos la función asíncrona sin "await" para que el frontend reciba la respuesta de éxito instantáneamente sin esperar a Gmail
              enviarCorreoConfirmacionCita(
                datos.correo,
                datos.paciente_nombre.split(" ")[0],
                `${datos.doctor_nombre} ${datos.doctor_apellido}`,
                fechaFormateada,
                horaCortaStr, // Esta variable la declaramos en la solución del desempate (ej. "08:00")
              );
            }

            citaAgendada = {
              fecha: fechaStr,
              hora: horaCortaStr,
            };
            break;
          }

          minutosActuales += 60;
        }
      }
      if (!citaAgendada) {
        fechaBusqueda.setDate(fechaBusqueda.getDate() + 1);
        diasBuscados++;
      }
    }

    if (!citaAgendada) {
      return res.status(404).json({
        message: "No encontramos disponibilidad en los próximos 30 días.",
      });
    }

    return res
      .status(201)
      .json({ message: "Cita asignada exitosamente.", data: citaAgendada });
  } catch (error) {
    console.error("Error en el motor de asignación:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const obtenerCitasPaciente = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    // 1. Traducir id_usuario a id_paciente
    const [pacienteInfo] = await pool.query(
      `SELECT id_paciente FROM pacientes WHERE id_usuario = ?`,
      [id_usuario],
    );

    if (pacienteInfo.length === 0) {
      return res.status(404).json({ message: "Perfil médico no encontrado." });
    }

    const id_paciente = pacienteInfo[0].id_paciente;

    // 2. Obtener las citas con un JOIN a la tabla doctores
    const [citas] = await pool.query(
      `SELECT 
                c.id_cita, c.fecha, c.hora, c.estado, 
                d.nombres AS doctor_nombre, d.apellido_paterno AS doctor_apellido 
             FROM citas c
             JOIN doctores d ON c.id_doctor = d.id_doctor
             WHERE c.id_paciente = ?
             ORDER BY c.fecha ASC, c.hora ASC`,
      [id_paciente],
    );

    return res.json({ data: citas });
  } catch (error) {
    console.error("Error al obtener el historial de citas:", error);
    return res
      .status(500)
      .json({ message: "Error interno al cargar tus citas." });
  }
};
