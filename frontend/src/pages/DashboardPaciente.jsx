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
  Skeleton,
  Chip,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios";

// Íconos
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

const DashboardPaciente = () => {
  const navigate = useNavigate();

  const [nombrePaciente, setNombrePaciente] = useState("");
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [proximaCita, setProximaCita] = useState(null);

  const fechaHoy = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const resPerfil = await clienteAxios.get("/pacientes/perfil");
        if (resPerfil.data && resPerfil.data.nombres) {
          setNombrePaciente(resPerfil.data.nombres.split(" ")[0]);
        }

        const resCitas = await clienteAxios.get("/citas/paciente");
        const citas = resCitas.data.data;

        const citaPendiente = citas.find((c) => c.estado === "programada");
        if (citaPendiente) {
          setProximaCita(citaPendiente);
        }

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
    <Box sx={{ minHeight: "100vh", bgcolor: "#F1F5F9" }}>
      {/* NAVBAR DEL PACIENTE - Refinada con efecto de cristal (backdrop-filter si decides aplicar CSS puro luego) */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#0284C7",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 4px 20px rgba(2, 132, 199, 0.15)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                bgcolor: "white",
                color: "#0284C7",
                p: 0.75,
                borderRadius: "12px",
                display: "flex",
                mr: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <LocalHospitalLogo />
            </Box>
            <Typography
              variant="h6"
              color="white"
              fontWeight="800"
              letterSpacing={0.5}
            >
              MedLy
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              color="inherit"
              sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.15)" } }}
            >
              <NotificationsActiveOutlinedIcon />
            </IconButton>
            <Button
              color="inherit"
              onClick={handleLogout}
              endIcon={<LogoutIcon />}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "10px",
                px: 2,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 6, mb: 10 }}>
        {/* BANNER DE BIENVENIDA */}
        <Box sx={{ mb: 6, display: "flex", alignItems: "center", gap: 3 }}>
          {/* Avatar dinámico que actúa como ancla visual */}
          <Avatar
            sx={{
              bgcolor: "#E0F2FE",
              color: "#0284C7",
              width: 64,
              height: 64,
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.15)",
              border: "3px solid white",
            }}
          >
            {cargandoPerfil ? (
              <Skeleton variant="circular" width={64} height={64} />
            ) : (
              nombrePaciente.charAt(0).toUpperCase()
            )}
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              fontWeight="800"
              color="#0F172A"
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}
            >
              {cargandoPerfil ? (
                <Skeleton width={180} height={40} />
              ) : (
                <>
                  Hola, {nombrePaciente}
                  <WavingHandIcon
                    sx={{
                      color: "#FBBF24",
                      fontSize: 32,
                      animation: "wave 2.5s infinite",
                    }}
                  />
                </>
              )}
            </Typography>
            <Typography
              variant="body1"
              color="#64748B"
              sx={{ textTransform: "capitalize", fontWeight: 500 }}
            >
              {fechaHoy}
            </Typography>
          </Box>
        </Box>

        {/* TARJETA DE PRÓXIMA CITA - Mejorada visualmente con gradientes */}
        <Card
          elevation={0}
          sx={{
            borderRadius: "20px",
            mb: 6,
            border: "1px solid #E2E8F0",
            background: "linear-gradient(145deg, #ffffff 0%, #F8FAFC 100%)",
            boxShadow: "0 10px 30px -5px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              bgcolor: "#F0F9FF",
              px: 3,
              py: 1.5,
              borderBottom: "1px solid #E0F2FE",
            }}
          >
            <Typography
              variant="overline"
              fontWeight="800"
              color="#0284C7"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                letterSpacing: 1,
              }}
            >
              <EventAvailableIcon fontSize="small" /> MI PRÓXIMA CITA
            </Typography>
          </Box>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {cargandoPerfil ? (
              // Corregido el Layout Shift con una altura realista
              <Skeleton
                variant="rounded"
                height={100}
                sx={{ borderRadius: 3 }}
              />
            ) : proximaCita ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    color="#0F172A"
                    fontWeight="800"
                    mb={0.5}
                  >
                    {new Date(
                      `${proximaCita.fecha.split("T")[0]}T00:00:00`,
                    ).toLocaleDateString("es-MX", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="#0369A1"
                    fontWeight="600"
                    mb={1}
                  >
                    {proximaCita.hora.substring(0, 5)} hrs{" "}
                    <Typography component="span" color="#94A3B8">
                      |
                    </Typography>{" "}
                    Consulta General
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{ width: 24, height: 24, bgcolor: "#CBD5E1" }}
                    />
                    <Typography
                      variant="body2"
                      color="#475569"
                      fontWeight="500"
                    >
                      Dr(a). {proximaCita.doctor_nombre}{" "}
                      {proximaCita.doctor_apellido}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label="Confirmada"
                  sx={{
                    bgcolor: "#DCFCE7",
                    color: "#166534",
                    fontWeight: "bold",
                    px: 1,
                    py: 2.5,
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography
                  variant="h6"
                  color="#334155"
                  fontWeight="600"
                  mb={1}
                >
                  No tienes citas programadas
                </Typography>
                <Typography variant="body2" color="#64748B">
                  Tu agenda está libre. Solicita una consulta cuando lo
                  necesites.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* ACCIONES PRINCIPALES */}
        <Typography
          variant="h6"
          fontWeight="800"
          color="#0F172A"
          mb={3}
          sx={{ pl: 1 }}
        >
          ¿Qué necesitas hacer hoy?
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {/* BOTÓN 1: PEDIR CITA */}
          <Grid item xs={12} sm={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: "20px",
                border: "1px solid #E0F2FE",
                bgcolor: "#ffffff",
                height: "100%",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 20px 40px -10px rgba(2, 132, 199, 0.15)",
                  borderColor: "#BAE6FD",
                  "& .MuiAvatar-root": {
                    transform: "scale(1.1) rotate(5deg)", // Microinteracción
                    bgcolor: "#0369A1",
                  },
                },
              }}
            >
              <CardActionArea
                sx={{
                  p: 4,
                  textAlign: "left",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 2,
                }}
                onClick={() => navigate("/paciente/agendar")}
              >
                <Avatar
                  sx={{
                    bgcolor: "#0284C7",
                    color: "white",
                    width: 64,
                    height: 64,
                    transition: "all 0.3s ease",
                    boxShadow: "0 8px 16px rgba(2, 132, 199, 0.2)",
                  }}
                >
                  <PersonAddAlt1Icon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="800"
                    color="#0F172A"
                    mb={1}
                  >
                    Agendar Consulta
                  </Typography>
                  <Typography variant="body2" color="#64748B" lineHeight={1.6}>
                    Solicita una cita de medicina general según los horarios
                    disponibles en la clínica.
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>

          {/* BOTÓN 2: MIS CITAS - Ajustado para evitar que parezca deshabilitado */}
          <Grid item xs={12} sm={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: "20px",
                border: "1px solid #F1F5F9",
                bgcolor: "#ffffff",
                height: "100%",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.08)",
                  borderColor: "#E2E8F0",
                  "& .MuiAvatar-root": {
                    transform: "scale(1.1) rotate(-5deg)", // Microinteracción invertida
                    bgcolor: "#DBEAFE",
                    color: "#1D4ED8",
                  },
                },
              }}
            >
              <CardActionArea
                sx={{
                  p: 4,
                  textAlign: "left",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 2,
                }}
                onClick={() => navigate("/paciente/mis-citas")}
              >
                <Avatar
                  sx={{
                    bgcolor: "#F8FAFC",
                    color: "#0284C7", // Cambio clave: Tono de la marca en lugar de gris oscuro
                    width: 64,
                    height: 64,
                    transition: "all 0.3s ease",
                    border: "1px solid #E0F2FE",
                  }}
                >
                  <CalendarMonthOutlinedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="800"
                    color="#0F172A"
                    mb={1}
                  >
                    Mis Citas
                  </Typography>
                  <Typography variant="body2" color="#64748B" lineHeight={1.6}>
                    Revisa tu historial de consultas pasadas y gestiona las que
                    tienes programadas.
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Estilos globales inyectados para animaciones simples (Opcional, lo ideal es moverlo a tu index.css) */}
      <style>
        {`
          @keyframes wave {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(14deg); }
            20% { transform: rotate(-8deg); }
            30% { transform: rotate(14deg); }
            40% { transform: rotate(-4deg); }
            50% { transform: rotate(10deg); }
            60% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
          }
        `}
      </style>
    </Box>
  );
};

const LocalHospitalLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
  </svg>
);

export default DashboardPaciente;
