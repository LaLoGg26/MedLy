// frontend/src/components/TablaDoctores.jsx
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Divider,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import AddIcon from "@mui/icons-material/Add";
import clienteAxios from "../api/axios";

// Plantilla base para los 7 días de la semana
const DIAS_BASE = [
  { id: 1, label: "Lunes", activo: false, inicio: "08:00", fin: "16:00" },
  { id: 2, label: "Martes", activo: false, inicio: "08:00", fin: "16:00" },
  { id: 3, label: "Miércoles", activo: false, inicio: "08:00", fin: "16:00" },
  { id: 4, label: "Jueves", activo: false, inicio: "08:00", fin: "16:00" },
  { id: 5, label: "Viernes", activo: false, inicio: "08:00", fin: "16:00" },
  { id: 6, label: "Sábado", activo: false, inicio: "08:00", fin: "14:00" },
  { id: 0, label: "Domingo", activo: false, inicio: "08:00", fin: "14:00" },
];

const TablaDoctores = () => {
  const [doctores, setDoctores] = useState([]);
  const [cargando, setCargando] = useState(true);

  // --- ESTADOS DE EDICIÓN ---
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [catalogoEspecialidades, setCatalogoEspecialidades] = useState([]);
  const [doctorEditando, setDoctorEditando] = useState(null);
  const [nuevaEspTemporal, setNuevaEspTemporal] = useState({
    id_especialidad: "",
    cedula_especialidad: "",
  });
  const [listaNuevasEspecialidades, setListaNuevasEspecialidades] = useState(
    [],
  );
  const [guardandoCambios, setGuardandoCambios] = useState(false);

  // --- ESTADOS DE BORRADO ---
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [doctorAEliminar, setDoctorAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // --- ESTADOS DE HORARIO (NUEVO) ---
  const [modalHorarioAbierto, setModalHorarioAbierto] = useState(false);
  const [doctorHorario, setDoctorHorario] = useState(null);
  const [horarioSemana, setHorarioSemana] = useState(DIAS_BASE);
  const [guardandoHorario, setGuardandoHorario] = useState(false);

  const cargarDoctores = async () => {
    try {
      const respuesta = await clienteAxios.get("/admin/doctores");
      setDoctores(respuesta.data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDoctores();
  }, []);

  // ====== LÓGICA DE EDICIÓN ======
  const handleAbrirEditar = async (doctor) => {
    setDoctorEditando({ ...doctor });
    setListaNuevasEspecialidades([]);
    setNuevaEspTemporal({ id_especialidad: "", cedula_especialidad: "" });
    setModalEditarAbierto(true);
    try {
      const resp = await clienteAxios.get("/admin/especialidades");
      setCatalogoEspecialidades(resp.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCambioForm = (e) => {
    setDoctorEditando({
      ...doctorEditando,
      [e.target.name]:
        e.target.name === "correo_personal"
          ? e.target.value
          : e.target.value.toUpperCase(),
    });
  };

  const handleAgregarEspecialidadLista = () => {
    if (
      !nuevaEspTemporal.id_especialidad ||
      !nuevaEspTemporal.cedula_especialidad
    ) {
      alert(
        "Debes seleccionar una especialidad y escribir su cédula correspondiente.",
      );
      return;
    }
    const encontrada = catalogoEspecialidades.find(
      (e) => e.id_especialidad === nuevaEspTemporal.id_especialidad,
    );
    setListaNuevasEspecialidades([
      ...listaNuevasEspecialidades,
      {
        id_especialidad: nuevaEspTemporal.id_especialidad,
        cedula_especialidad: nuevaEspTemporal.cedula_especialidad,
        nombre: encontrada.nombre_especialidad,
      },
    ]);
    setNuevaEspTemporal({ id_especialidad: "", cedula_especialidad: "" });
  };

  const handleGuardarCambios = async (e) => {
    e.preventDefault();
    try {
      setGuardandoCambios(true);
      const payload = {
        telefono: doctorEditando.telefono,
        correo_personal: doctorEditando.correo_personal,
        calle: doctorEditando.calle,
        colonia: doctorEditando.colonia,
        codigo_postal: doctorEditando.codigo_postal,
        ciudad: doctorEditando.ciudad,
        estado: doctorEditando.estado,
        nuevasEspecialidades: listaNuevasEspecialidades,
      };
      await clienteAxios.put(
        `/admin/doctores/${doctorEditando.id_doctor_visible}`,
        payload,
      );
      alert("Perfil médico actualizado exitosamente.");
      setModalEditarAbierto(false);
      cargarDoctores();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al intentar actualizar el perfil médico.");
    } finally {
      setGuardandoCambios(false);
    }
  };

  // ====== LÓGICA DE BORRADO ======
  const handleConfirmarEliminar = (doctor) => {
    setDoctorAEliminar(doctor);
    setModalEliminarAbierto(true);
  };

  const ejecutarEliminacion = async () => {
    try {
      setEliminando(true);
      await clienteAxios.delete(
        `/admin/doctores/${doctorAEliminar.id_doctor_visible}`,
      );
      alert("El médico ha sido dado de baja correctamente.");
      setModalEliminarAbierto(false);
      cargarDoctores();
    } catch (error) {
      console.error(error);
      alert("Error al intentar eliminar el registro.");
    } finally {
      setEliminando(false);
    }
  };

  // ====== LÓGICA DE HORARIOS (NUEVO) ======
  const handleAbrirHorario = async (doctor) => {
    setDoctorHorario(doctor);
    setModalHorarioAbierto(true);
    try {
      // Pedimos al backend si el doctor ya tiene un horario configurado
      const resp = await clienteAxios.get(
        `/admin/doctores/${doctor.id_doctor_visible}/horarios`,
      );
      const horariosGuardados = resp.data;

      // Mapeamos los datos de MySQL a nuestra interfaz de 7 días
      const diasFormateados = DIAS_BASE.map((diaBase) => {
        const existeEnBD = horariosGuardados.find(
          (h) => h.dia_semana === diaBase.id,
        );
        if (existeEnBD) {
          return {
            ...diaBase,
            activo: true,
            inicio: existeEnBD.hora_inicio.substring(0, 5), // Extraemos '08:00' de '08:00:00'
            fin: existeEnBD.hora_fin.substring(0, 5),
          };
        }
        return { ...diaBase }; // Si no existe, lo dejamos desactivado y con valores por defecto
      });
      setHorarioSemana(diasFormateados);
    } catch (error) {
      console.error("Error al cargar horario", error);
      setHorarioSemana([...DIAS_BASE]); // Si falla, reseteamos
    }
  };

  const handleCambioDia = (index, campo, valor) => {
    const nuevosDias = [...horarioSemana];
    nuevosDias[index][campo] = valor;
    setHorarioSemana(nuevosDias);
  };

  const handleGuardarHorario = async (e) => {
    e.preventDefault();
    try {
      setGuardandoHorario(true);
      // Filtramos solo los días que el Admin marcó como activos y los preparamos para MySQL
      const payload = horarioSemana
        .filter((dia) => dia.activo)
        .map((dia) => ({
          dia_semana: dia.id,
          hora_inicio: dia.inicio,
          hora_fin: dia.fin,
        }));

      await clienteAxios.post(
        `/admin/doctores/${doctorHorario.id_doctor_visible}/horarios`,
        { horarios: payload },
      );
      alert(
        "Horario configurado exitosamente. Ahora el sistema puede asignar citas para este médico.",
      );
      setModalHorarioAbierto(false);
    } catch (error) {
      console.error("Error al guardar horario:", error);
      alert("Hubo un problema al guardar los bloques de tiempo.");
    } finally {
      setGuardandoHorario(false);
    }
  };

  if (cargando)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  if (doctores.length === 0)
    return (
      <Typography align="center" sx={{ py: 5 }}>
        No hay médicos registrados.
      </Typography>
    );

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}
    >
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: "#F8FAFC" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
              ID MÉDICO
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
              NOMBRE COMPLETO
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
              ESPECIALIDAD(ES)
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
              CONTACTO INSTITUCIONAL
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontWeight: "bold", color: "#475569" }}
            >
              ACCIONES
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {doctores.map((doctor) => (
            <TableRow
              key={doctor.id_doctor_visible}
              sx={{ "&:hover": { bgcolor: "#F1F5F9" } }}
            >
              <TableCell>
                <Chip
                  label={doctor.id_doctor_visible}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: "bold" }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  {`${doctor.nombres} ${doctor.apellido_paterno} ${doctor.apellido_materno}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cédula Gral: {doctor.cedula}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  color="primary.dark"
                  fontWeight="500"
                >
                  {doctor.especialidad}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {doctor.correo_institucional}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tel: {doctor.telefono}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {/* NUEVO BOTÓN DE HORARIO */}
                <IconButton
                  color="secondary"
                  size="small"
                  title="Configurar Horario"
                  onClick={() => handleAbrirHorario(doctor)}
                  sx={{ mr: 1 }}
                >
                  <ScheduleOutlinedIcon />
                </IconButton>

                <IconButton
                  color="primary"
                  size="small"
                  title="Editar Perfil"
                  onClick={() => handleAbrirEditar(doctor)}
                  sx={{ mr: 1 }}
                >
                  <EditOutlinedIcon />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  title="Dar de Baja"
                  onClick={() => handleConfirmarEliminar(doctor)}
                >
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* --- MODAL DE EDICIÓN (Se mantiene idéntico) --- */}
      {doctorEditando && (
        <Dialog
          open={modalEditarAbierto}
          onClose={() => !guardandoCambios && setModalEditarAbierto(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle
            sx={{
              fontWeight: "bold",
              bgcolor: "#F8FAFC",
              borderBottom: "1px solid #E2E8F0",
            }}
          >
            Modificar Perfil Médico — {doctorEditando.id_doctor_visible}
          </DialogTitle>
          <form onSubmit={handleGuardarCambios}>
            <DialogContent sx={{ mt: 1 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight="bold"
                mb={2}
              >
                INFORMACIÓN DE IDENTIDAD FIJA (NO EDITABLE)
              </Typography>
              <Grid container spacing={2} mb={4}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Médico"
                    disabled
                    value={`${doctorEditando.nombres} ${doctorEditando.apellido_paterno} ${doctorEditando.apellido_materno}`}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Cédula General"
                    disabled
                    value={doctorEditando.cedula}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Correo Corporativo"
                    disabled
                    value={doctorEditando.correo_institucional}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              <Typography
                variant="subtitle2"
                color="primary"
                fontWeight="bold"
                mb={2}
              >
                DATOS DE CONTACTO Y DIRECCIÓN (EDITABLE)
              </Typography>
              <Grid container spacing={2} mb={4}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Teléfono Móvil"
                    name="telefono"
                    value={doctorEditando.telefono || ""}
                    onChange={handleCambioForm}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Correo Personal"
                    name="correo_personal"
                    type="email"
                    value={doctorEditando.correo_personal || ""}
                    onChange={handleCambioForm}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    required
                    label="Calle y Número"
                    name="calle"
                    value={doctorEditando.calle || ""}
                    onChange={handleCambioForm}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                  <TextField
                    fullWidth
                    required
                    label="C.P."
                    name="codigo_postal"
                    value={doctorEditando.codigo_postal || ""}
                    onChange={handleCambioForm}
                    inputProps={{ maxLength: 5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={8} md={5}>
                  <TextField
                    fullWidth
                    required
                    label="Colonia"
                    name="colonia"
                    value={doctorEditando.colonia || ""}
                    onChange={handleCambioForm}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Ciudad / Municipio"
                    name="ciudad"
                    value={doctorEditando.ciudad || ""}
                    onChange={handleCambioForm}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Estado"
                    name="estado"
                    value={doctorEditando.estado || ""}
                    onChange={handleCambioForm}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              <Typography
                variant="subtitle2"
                color="secondary"
                fontWeight="bold"
                mb={1}
              >
                ASIGNAR NUEVA ESPECIALIDAD
              </Typography>
              <Grid container spacing={2} alignItems="center" mb={2}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    select
                    label="Especialidad disponible"
                    value={nuevaEspTemporal.id_especialidad}
                    onChange={(e) =>
                      setNuevaEspTemporal({
                        ...nuevaEspTemporal,
                        id_especialidad: e.target.value,
                      })
                    }
                  >
                    {catalogoEspecialidades.map((esp) => (
                      <MenuItem
                        key={esp.id_especialidad}
                        value={esp.id_especialidad}
                      >
                        {esp.nombre_especialidad}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Cédula de Especialidad"
                    value={nuevaEspTemporal.cedula_especialidad}
                    onChange={(e) =>
                      setNuevaEspTemporal({
                        ...nuevaEspTemporal,
                        cedula_especialidad: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    inputProps={{ maxLength: 8 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={handleAgregarEspecialidadLista}
                  >
                    Adherir
                  </Button>
                </Grid>
              </Grid>

              {listaNuevasEspecialidades.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    p: 2,
                    bgcolor: "#F0FDF4",
                    borderRadius: 2,
                    border: "1px solid #BBF7D0",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="success.main"
                    sx={{ width: "100%" }}
                  >
                    POR AGREGAR AL GUARDAR:
                  </Typography>
                  {listaNuevasEspecialidades.map((esp, i) => (
                    <Chip
                      key={i}
                      label={`${esp.nombre} (Cédula: ${esp.cedula_especialidad})`}
                      size="small"
                      color="success"
                      variant="outlined"
                      onDelete={() =>
                        setListaNuevasEspecialidades(
                          listaNuevasEspecialidades.filter(
                            (_, idx) => idx !== i,
                          ),
                        )
                      }
                    />
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions
              sx={{
                px: 3,
                pb: 3,
                bgcolor: "#F8FAFC",
                borderTop: "1px solid #E2E8F0",
              }}
            >
              <Button
                onClick={() => setModalEditarAbierto(false)}
                color="inherit"
                disabled={guardandoCambios}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={guardandoCambios}
              >
                {guardandoCambios ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}

      {/* --- MODAL DE BORRADO (Se mantiene idéntico) --- */}
      <Dialog
        open={modalEliminarAbierto}
        onClose={() => !eliminando && setModalEliminarAbierto(false)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 450 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "error.main", pt: 3 }}>
          ¿Deseas eliminar este perfil médico?
        </DialogTitle>
        <DialogContent>
          {doctorAEliminar && (
            <Typography variant="body1">
              Estás a punto de eliminar permanentemente al **
              {doctorAEliminar.nombres} {doctorAEliminar.apellido_paterno}**
              (ID: {doctorAEliminar.id_doctor_visible}).
              <br />
              <br />
              Esta acción **borrará su cuenta de acceso institucional**, sus
              cédulas registradas y no podrá revertirse.
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{ px: 3, pb: 3, pt: 2, justifyContent: "space-between" }}
        >
          <Button
            onClick={() => setModalEliminarAbierto(false)}
            color="inherit"
            variant="outlined"
            disabled={eliminando}
          >
            No, Cancelar
          </Button>
          <Button
            onClick={ejecutarEliminacion}
            color="error"
            variant="contained"
            disabled={eliminando}
          >
            {eliminando ? "Eliminando..." : "Sí, Dar de Baja"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- NUEVO MODAL DE HORARIOS --- */}
      {doctorHorario && (
        <Dialog
          open={modalHorarioAbierto}
          onClose={() => !guardandoHorario && setModalHorarioAbierto(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle
            sx={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              bgcolor: "#F8FAFC",
              borderBottom: "1px solid #E2E8F0",
            }}
          >
            <ScheduleOutlinedIcon sx={{ mr: 1, color: "secondary.main" }} />
            Configurar Disponibilidad
          </DialogTitle>
          <form onSubmit={handleGuardarHorario}>
            <DialogContent sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Habilita los días que labora el/la dr.{" "}
                <strong>
                  {doctorHorario.nombres} {doctorHorario.apellido_paterno}
                </strong>{" "}
                y establece su horario de consulta. El sistema usará esto para
                asignar citas automáticamente.
              </Typography>

              {horarioSemana.map((dia, index) => (
                <Box
                  key={dia.id}
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    border: "1px solid",
                    borderColor: dia.activo ? "secondary.main" : "#E2E8F0",
                    borderRadius: 2,
                    bgcolor: dia.activo ? "#FAF5FF" : "transparent",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={dia.activo}
                        onChange={(e) =>
                          handleCambioDia(index, "activo", e.target.checked)
                        }
                        color="secondary"
                      />
                    }
                    label={
                      <Typography fontWeight={dia.activo ? "bold" : "normal"}>
                        {dia.label}
                      </Typography>
                    }
                    sx={{ width: "130px" }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      opacity: dia.activo ? 1 : 0.4,
                      pointerEvents: dia.activo ? "auto" : "none",
                    }}
                  >
                    <TextField
                      label="Entrada"
                      type="time"
                      size="small"
                      value={dia.inicio}
                      onChange={(e) =>
                        handleCambioDia(index, "inicio", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 1800 }} // Incrementos de 30 minutos
                    />
                    <TextField
                      label="Salida"
                      type="time"
                      size="small"
                      value={dia.fin}
                      onChange={(e) =>
                        handleCambioDia(index, "fin", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 1800 }}
                    />
                  </Box>
                </Box>
              ))}
            </DialogContent>
            <DialogActions
              sx={{
                px: 3,
                pb: 3,
                bgcolor: "#F8FAFC",
                borderTop: "1px solid #E2E8F0",
              }}
            >
              <Button
                onClick={() => setModalHorarioAbierto(false)}
                color="inherit"
                disabled={guardandoHorario}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={guardandoHorario}
              >
                {guardandoHorario ? "Guardando..." : "Aplicar Horario"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </TableContainer>
  );
};

export default TablaDoctores;
