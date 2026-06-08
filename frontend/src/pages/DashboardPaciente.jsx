// frontend/src/pages/DashboardPaciente.jsx
import { useState, useEffect } from "react";
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
  CardActionArea,
  Avatar,
  IconButton,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios";

// Íconos
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import WavingHandIcon from "@mui/icons-material/WavingHand";

const DashboardPaciente = () => {
  const navigate = useNavigate();

  // Estado para el nombre, inicializado de forma personalizada para la vista previa
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // Obtenemos la fecha actual
  const fechaHoy = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Lógica para ir por el nombre real del usuario a la base de datos
  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return; // Si no hay token guardado, cancelamos

        // Configuramos los headers explícitamente
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const respuesta = await clienteAxios.get("/pacientes/perfil", config);

        if (respuesta.data && respuesta.data.nombres) {
          const primerNombre = respuesta.data.nombres.split(" ")[0];
          setNombrePaciente(primerNombre);
        }
      } catch (error) {
        console.error(
          "Error del backend:",
          error.response?.data || error.message,
        );
      } finally {
        setCargandoPerfil(false);
      }
    };
    obtenerPerfil();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC" }}>
      {/* NAVBAR DEL PACIENTE */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "#0284C7", borderBottom: "1px solid #0369A1" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                bgcolor: "white",
                color: "#0284C7",
                p: 0.5,
                borderRadius: 2,
                display: "flex",
                mr: 2,
              }}
            >
              <LocalHospitalLogo />
            </Box>
            <Typography
              variant="h6"
              color="white"
              fontWeight="800"
              letterSpacing={1}
            >
              MedLy
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton color="inherit">
              <NotificationsActiveOutlinedIcon />
            </IconButton>
            <Button
              color="inherit"
              onClick={handleLogout}
              endIcon={<LogoutIcon />}
              sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
        {/* BANNER DE BIENVENIDA PERSONALIZADO */}
        <Box
          sx={{
            mb: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="800"
              color="#0F172A"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              {cargandoPerfil ? (
                <Skeleton width={200} />
              ) : (
                <>
                  Hola, {nombrePaciente}{" "}
                  <WavingHandIcon sx={{ color: "#FBBF24" }} />
                </>
              )}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ textTransform: "capitalize", mt: 0.5 }}
            >
              {fechaHoy}
            </Typography>
          </Box>
          <Avatar
            sx={{ bgcolor: "#E0F2FE", color: "#0284C7", width: 56, height: 56 }}
          >
            <AccountCircleIcon fontSize="large" />
          </Avatar>
        </Box>

        {/* TARJETA DE PRÓXIMA CITA */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            mb: 5,
            border: "1px solid #E2E8F0",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{ bgcolor: "#F0F9FF", p: 2, borderBottom: "1px solid #E0F2FE" }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="#0369A1"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <CalendarMonthOutlinedIcon fontSize="small" /> MI PRÓXIMA CITA
            </Typography>
          </Box>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" mb={1}>
              No tienes citas programadas próximamente.
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Agenda una consulta general para ser atendido por uno de nuestros
              especialistas.
            </Typography>
          </CardContent>
        </Card>

        {/* ACCIONES PRINCIPALES (Expediente eliminado, botones re-centrados) */}
        <Typography variant="h6" fontWeight="bold" color="#1E293B" mb={3}>
          ¿Qué necesitas hacer hoy?
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {/* BOTÓN 1: PEDIR CITA */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                borderRadius: 4,
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 25px rgba(2, 132, 199, 0.15)",
                },
                border: "1px solid #E0F2FE",
                height: "100%",
              }}
            >
              <CardActionArea
                sx={{ p: 4, textAlign: "center", height: "100%" }}
                onClick={() => navigate("/paciente/agendar")}
              >
                <Avatar
                  sx={{
                    bgcolor: "#0284C7",
                    color: "white",
                    width: 72,
                    height: 72,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <PersonAddAlt1Icon fontSize="large" />
                </Avatar>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="#0F172A"
                  mb={1}
                >
                  Agendar Consulta
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Solicita una cita de medicina general según los horarios
                  disponibles en la clínica.
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>

          {/* BOTÓN 2: MIS CITAS */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                borderRadius: 4,
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                },
                border: "1px solid #E2E8F0",
                height: "100%",
              }}
            >
              <CardActionArea
                sx={{ p: 4, textAlign: "center", height: "100%" }}
                onClick={() => navigate("/paciente/mis-citas")}
              >
                <Avatar
                  sx={{
                    bgcolor: "#F1F5F9",
                    color: "#475569",
                    width: 72,
                    height: 72,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <CalendarMonthOutlinedIcon fontSize="large" />
                </Avatar>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="#0F172A"
                  mb={1}
                >
                  Mis Citas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Revisa tu historial de consultas pasadas y gestiona las que
                  tienes programadas.
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Componente auxiliar para el Logo
const LocalHospitalLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
  </svg>
);

export default DashboardPaciente;
