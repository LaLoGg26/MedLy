// frontend/src/pages/DashboardAdmin.jsx
import { useState, useEffect } from "react";
import clienteAxios from "../api/axios";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import TablaDoctores from "../components/TablaDoctores";
import TablaPacientes from "../components/TablaPacientes";

// Íconos
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import SearchIcon from "@mui/icons-material/Search";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

// Componente auxiliar para manejar el contenido de las pestañas
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [tabActual, setTabActual] = useState(0);
  const [modalCatAbierto, setModalCatAbierto] = useState(false);
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({
    nombre_especialidad: "",
    descripcion: "",
  });
  const [guardandoCat, setGuardandoCat] = useState(false);
  const [listaEspecialidades, setListaEspecialidades] = useState([]);

  const cargarCatalogo = async () => {
    try {
      const respuesta = await clienteAxios.get("/admin/especialidades");
      setListaEspecialidades(respuesta.data);
    } catch (error) {
      console.error("Error al cargar especialidades:", error);
    }
  };

  const handleCambioCat = (e) => {
    setNuevaEspecialidad({
      ...nuevaEspecialidad,
      [e.target.name]:
        e.target.name === "nombre_especialidad"
          ? e.target.value.toUpperCase()
          : e.target.value,
    });
  };

  const handleGuardarEspecialidad = async (e) => {
    e.preventDefault();
    try {
      setGuardandoCat(true);
      await clienteAxios.post("/admin/especialidades", nuevaEspecialidad);
      alert("¡Especialidad agregada al catálogo!");
      setModalCatAbierto(false);
      setNuevaEspecialidad({ nombre_especialidad: "", descripcion: "" }); // Limpiamos el form
    } catch (error) {
      console.error("Error:", error);
      alert(
        error.response?.data?.mensaje || "Error al guardar la especialidad",
      );
    } finally {
      setGuardandoCat(false);
    }
  };

  const [metricas, setMetricas] = useState({
    totalMedicos: 0,
    totalPacientes: 0,
    citasHoy: 0,
  });

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        const respuesta = await clienteAxios.get("/admin/metricas");
        setMetricas(respuesta.data);
      } catch (error) {
        console.error("Error al cargar las métricas rápidas", error);
      }
    };
    cargarMetricas();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleTabChange = (event, newValue) => {
    setTabActual(newValue);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F4F7FE" }}>
      {/* NAVBAR DE ADMIN (Oscuro para diferenciarlo del paciente) */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "#1E293B", borderBottom: "1px solid #0F172A" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.1)",
                color: "#38BDF8",
                p: 1,
                borderRadius: 2,
                display: "flex",
                mr: 2,
              }}
            >
              <AdminPanelSettingsIcon />
            </Box>
            <Typography
              variant="h6"
              color="white"
              fontWeight="800"
              letterSpacing={1}
            >
              MedLy{" "}
              <Box
                component="span"
                sx={{ fontWeight: "400", color: "#94A3B8" }}
              >
                | Centro de Control
              </Box>
            </Typography>
          </Box>

          <Button
            color="inherit"
            onClick={handleLogout}
            endIcon={<LogoutIcon />}
            sx={{
              color: "#94A3B8",
              "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        {/* SECCIÓN DE MÉTRICAS RÁPIDAS */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: "#E0F2FE",
                    color: "#0284C7",
                    width: 60,
                    height: 60,
                    mr: 3,
                  }}
                >
                  <LocalHospitalOutlinedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="subtitle2"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    Médicos Activos
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="800"
                    color="text.primary"
                  >
                    {metricas.totalMedicos}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: "#F3E8FF",
                    color: "#9333EA",
                    width: 60,
                    height: 60,
                    mr: 3,
                  }}
                >
                  <PeopleAltOutlinedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="subtitle2"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    Pacientes Registrados
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="800"
                    color="text.primary"
                  >
                    {metricas.totalPacientes}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: "#DCFCE7",
                    color: "#16A34A",
                    width: 60,
                    height: 60,
                    mr: 3,
                  }}
                >
                  <EventAvailableOutlinedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="subtitle2"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    Citas de Hoy
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="800"
                    color="text.primary"
                  >
                    {metricas.citasHoy}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ÁREA DE GESTIÓN (TABS) */}
        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "white",
              px: 2,
              pt: 1,
            }}
          >
            <Tabs
              value={tabActual}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab
                icon={<LocalHospitalOutlinedIcon />}
                iconPosition="start"
                label="Gestión de Médicos"
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              />
              <Tab
                icon={<PeopleAltOutlinedIcon />}
                iconPosition="start"
                label="Directorio de Pacientes"
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 3, bgcolor: "#FAFBFC", minHeight: "500px" }}>
            {/* PESTAÑA 1: MÉDICOS */}
            <TabPanel value={tabActual} index={0}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  Plantilla Médica
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<LocalOfferOutlinedIcon />}
                    sx={{ px: 3, py: 1, borderRadius: 2, fontWeight: "bold" }}
                    onClick={() => {
                      setModalCatAbierto(true);
                      cargarCatalogo(); // Cargamos la lista en vivo
                    }}
                  >
                    Nueva Especialidad
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddAlt1Icon />}
                    sx={{ px: 3, py: 1, borderRadius: 2, fontWeight: "bold" }}
                    onClick={() => navigate("/admin/nuevo-medico")}
                  >
                    Registrar Médico
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Aquí irá el componente <TablaDoctores /> que construiremos */}
              <TablaDoctores />
            </TabPanel>

            {/* PESTAÑA 2: PACIENTES */}
            <TabPanel value={tabActual} index={1}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  Pacientes
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<SearchIcon />}
                  sx={{ px: 3, py: 1, borderRadius: 2 }}
                >
                  Buscar Paciente
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <TablaPacientes />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 10,
                  opacity: 0.5,
                }}
              >
                <PeopleAltOutlinedIcon
                  sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  Directorio en construcción
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aquí aparecerá la lista de pacientes auto-registrados.
                </Typography>
              </Box>
            </TabPanel>
          </Box>
        </Paper>
      </Container>
      {/* MODAL: NUEVA ESPECIALIDAD */}
      <Dialog
        open={modalCatAbierto}
        onClose={() => !guardandoCat && setModalCatAbierto(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 400 } }}
      >
        <DialogTitle
          sx={{
            color: "secondary.main",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          <LocalOfferOutlinedIcon sx={{ mr: 1 }} />
          Agregar al Catálogo
        </DialogTitle>
        <form onSubmit={handleGuardarEspecialidad}>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Registra una nueva rama médica para que esté disponible en los
              perfiles de los doctores.
            </Typography>

            {/* SECCIÓN DE ESPECIALIDADES EXISTENTES */}
            <Box
              sx={{
                bgcolor: "#F8FAFC",
                p: 2,
                borderRadius: 2,
                border: "1px dashed #CBD5E1",
                mb: 3,
              }}
            >
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                display="block"
                mb={1}
              >
                ESPECIALIDADES YA REGISTRADAS:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {listaEspecialidades.length > 0 ? (
                  listaEspecialidades.map((esp) => (
                    <Chip
                      key={esp.id_especialidad}
                      label={esp.nombre_especialidad}
                      size="small"
                      variant="outlined"
                      sx={{ bgcolor: "white" }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    El catálogo está vacío.
                  </Typography>
                )}
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Nombre de la Especialidad"
              name="nombre_especialidad"
              required
              value={nuevaEspecialidad.nombre_especialidad}
              onChange={handleCambioCat}
              sx={{ mb: 3 }}
              placeholder="Ej. ONCOLOGÍA"
            />

            <TextField
              fullWidth
              label="Descripción (Opcional)"
              name="descripcion"
              multiline
              rows={3}
              value={nuevaEspecialidad.descripcion}
              onChange={handleCambioCat}
              placeholder="Breve descripción de la rama médica..."
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setModalCatAbierto(false)}
              color="inherit"
              disabled={guardandoCat}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={guardandoCat}
            >
              {guardandoCat ? "Guardando..." : "Guardar Especialidad"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DashboardAdmin;
