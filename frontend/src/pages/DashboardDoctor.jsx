// frontend/src/pages/DashboardDoctor.jsx
import { useState, useEffect, useRef } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios";

import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import RecentActorsOutlinedIcon from "@mui/icons-material/RecentActorsOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

const DashboardDoctor = () => {
  const navigate = useNavigate();
  const temporizadorInactividad = useRef(null);

  const [nombreDoctor, setNombreDoctor] = useState("");
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // --- ESTADOS DE SEGURIDAD (PRIMER LOGIN) ---
  const [modalSeguridad, setModalSeguridad] = useState(false);
  const [correoDestino, setCorreoDestino] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  const [formularioPass, setFormularioPass] = useState({
    codigo: "",
    nuevaPassword: "",
    confirmarPassword: "",
  });
  const [guardandoPass, setGuardandoPass] = useState(false);

  const fechaHoy = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleLogout = () => {
    limpiarTemporizador();
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Lógica de detección de Inactividad (5 Minutos fuera de horario laboral)
  const reiniciarTemporizadorInactividad = () => {
    limpiarTemporizador();
    // 5 minutos = 300,000 milisegundos
    temporizadorInactividad.current = setTimeout(() => {
      alert(
        "Tu sesión ha sido cerrada automáticamente por inactividad fuera de tu horario laboral configurado.",
      );
      handleLogout();
    }, 300000);
  };

  const limpiarTemporizador = () => {
    if (temporizadorInactividad.current)
      clearTimeout(temporizadorInactividad.current);
  };

  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const respuesta = await clienteAxios.get("/doctores/perfil", config);

        if (respuesta.data) {
          const {
            nombres,
            apellido_paterno,
            apellido_materno,
            correo_personal,
            debeCambiarPassword,
            enHorarioLaboral,
          } = respuesta.data;
          setNombreDoctor(
            `Dr. ${nombres.split(" ")[0]} ${apellido_paterno} ${apellido_materno}`,
          );
          setCorreoDestino(correo_personal);

          // CONDICIÓN 1: Evaluar si requiere cambio obligatorio de password
          if (debeCambiarPassword) {
            setModalSeguridad(true);
          }

          // CONDICIÓN 2: Lógica de protección por inactividad según su horario laboral
          if (!enHorarioLaboral) {
            console.log(
              "Modo Seguro: El doctor está fuera de horario de trabajo. Temporizador de 5min activo.",
            );
            reiniciarTemporizadorInactividad();
            // Escuchamos movimientos del usuario para resetear los 5 minutos
            window.addEventListener(
              "mousemove",
              reiniciarTemporizadorInactividad,
            );
            window.addEventListener(
              "keydown",
              reiniciarTemporizadorInactividad,
            );
            window.addEventListener("click", reiniciarTemporizadorInactividad);
          } else {
            console.log(
              "Modo Turno: El doctor está en horario laboral. Sesión ilimitada permitida.",
            );
            limpiarTemporizador();
          }
        }
      } catch (error) {
        console.error(error);
        handleLogout();
      } finally {
        setCargandoPerfil(false);
      }
    };

    obtenerPerfil();

    // Limpieza al salir de la pantalla
    return () => {
      limpiarTemporizador();
      window.removeEventListener("mousemove", reiniciarTemporizadorInactividad);
      window.removeEventListener("keydown", reiniciarTemporizadorInactividad);
      window.removeEventListener("click", reiniciarTemporizadorInactividad);
    };
  }, []);

  // SOLICITAR CÓDIGO DE VERIFICACIÓN
  const handlePedirCodigo = async () => {
    try {
      setEnviandoCodigo(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await clienteAxios.post("/doctores/enviar-codigo-seguridad", {}, config);
      setCodigoEnviado(true);
      alert(
        `Código enviado con éxito. Revisa tu buzón personal: ${correoDestino}`,
      );
    } catch (error) {
      alert("Error al enviar el código de seguridad.");
    } finally {
      setEnviandoCodigo(false);
    }
  };

  // APLICAR NUEVA CONTRASEÑA DEFINITIVA
  const handleGuardarNuevaPassword = async (e) => {
    e.preventDefault();
    if (formularioPass.nuevaPassword !== formularioPass.confirmarPassword) {
      alert("Las contraseñas escritas no coinciden.");
      return;
    }
    if (formularioPass.nuevaPassword.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setGuardandoPass(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await clienteAxios.post(
        "/doctores/cambiar-password-primero",
        {
          codigo: formularioPass.codigo,
          nuevaPassword: formularioPass.nuevaPassword,
        },
        config,
      );

      alert(
        "¡Contraseña actualizada con éxito! Tu cuenta ha sido activada de forma segura.",
      );
      setModalSeguridad(false);
    } catch (error) {
      alert(
        error.response?.data?.mensaje || "El código es inválido o ya caducó.",
      );
    } finally {
      setGuardandoPass(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F0FDF4" }}>
      {/* NAVBAR */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "#0F766E", borderBottom: "1px solid #115E59" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                bgcolor: "white",
                color: "#0F766E",
                p: 0.5,
                borderRadius: 2,
                display: "flex",
                mr: 2,
              }}
            >
              <MedicalServicesOutlinedIcon />
            </Box>
            <Typography
              variant="h6"
              color="white"
              fontWeight="800"
              letterSpacing={1}
            >
              MedLy - Portal Médico
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
            >
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
        {/* BANNER BIENVENIDA */}
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
            <Typography variant="h4" fontWeight="800" color="#134E4A">
              {cargandoPerfil ? (
                <Skeleton width={250} />
              ) : (
                `Bienvenido, ${nombreDoctor}`
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
            sx={{ bgcolor: "#CCFBF1", color: "#0F766E", width: 56, height: 56 }}
          >
            <AccountCircleIcon fontSize="large" />
          </Avatar>
        </Box>

        {/* CONTENIDO INTERFAZ (Resumen diario y tarjetas de navegación) */}
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
            sx={{ bgcolor: "#F0FDFA", p: 2, borderBottom: "1px solid #CCFBF1" }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="#0F766E"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <EventAvailableOutlinedIcon fontSize="small" /> MI AGENDA DE HOY
            </Typography>
          </Box>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h3" fontWeight="bold" color="#134E4A" mb={1}>
              0
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Citas programadas para el día de hoy.
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="h6" fontWeight="bold" color="#1E293B" mb={3}>
          Herramientas Clínicas
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                borderRadius: 4,
                border: "1px solid #CCFBF1",
                height: "100%",
              }}
            >
              <CardActionArea
                sx={{ p: 4, textAlign: "center" }}
                onClick={() => navigate("/doctor/agenda")}
              >
                <Avatar
                  sx={{
                    bgcolor: "#0F766E",
                    color: "white",
                    width: 72,
                    height: 72,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <RecentActorsOutlinedIcon fontSize="large" />
                </Avatar>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="#134E4A"
                  mb={1}
                >
                  Consultas Programadas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visualiza tu lista de pacientes del día y redacta notas
                  médicas.
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                borderRadius: 4,
                border: "1px solid #E2E8F0",
                height: "100%",
              }}
            >
              <CardActionArea
                sx={{ p: 4, textAlign: "center" }}
                onClick={() => navigate("/doctor/pacientes")}
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
                  <AssignmentIndOutlinedIcon fontSize="large" />
                </Avatar>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="#1E293B"
                  mb={1}
                >
                  Directorio de Pacientes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Busca pacientes en la base de datos y revisa su historial
                  clínico.
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ============================================================ */}
      {/* MODAL DE SEGURIDAD OBLIGATORIO (BLOQUEA LA NAVEGACIÓN TOTAL) */}
      {/* ============================================================ */}
      <Dialog
        open={modalSeguridad}
        disableEscapeKeyDown
        PaperProps={{ sx: { borderRadius: 4, p: 2, maxWidth: 480 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "#0F766E",
          }}
        >
          <ShieldOutlinedIcon color="secondary" /> Actualización de Seguridad
          Requerida
        </DialogTitle>
        <form onSubmit={handleGuardarNuevaPassword}>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Detectamos que es tu primer ingreso con una contraseña temporal.
              Por regulación interna de protección de datos clínicos, debes
              crear una credencial secreta propia.
            </Typography>

            {!codigoEnviado ? (
              <Box
                sx={{
                  bgcolor: "#F8FAFC",
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #E2E8F0",
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" mb={2}>
                  Enviaremos un código de seguridad de 6 dígitos a tu buzón
                  personal registrado.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handlePedirCodigo}
                  disabled={enviandoCodigo}
                >
                  {enviandoCodigo ? "Enviando..." : "Enviar Código por Correo"}
                </Button>
              </Box>
            ) : (
              <Box>
                <TextField
                  fullWidth
                  required
                  label="Código de 6 Dígitos"
                  value={formularioPass.codigo}
                  onChange={(e) =>
                    setFormularioPass({
                      ...formularioPass,
                      codigo: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  inputProps={{ maxLength: 6 }}
                  sx={{ mb: 2.5 }}
                  placeholder="Escribe el código recibido"
                />
                <TextField
                  fullWidth
                  required
                  label="Nueva Contraseña"
                  type="password"
                  value={formularioPass.nuevaPassword}
                  onChange={(e) =>
                    setFormularioPass({
                      ...formularioPass,
                      nuevaPassword: e.target.value,
                    })
                  }
                  sx={{ mb: 2.5 }}
                />
                <TextField
                  fullWidth
                  required
                  label="Confirmar Nueva Contraseña"
                  type="password"
                  value={formularioPass.confirmarPassword}
                  onChange={(e) =>
                    setFormularioPass({
                      ...formularioPass,
                      confirmarPassword: e.target.value,
                    })
                  }
                  sx={{ mb: 1 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              pb: 2,
              px: 3,
              justifyContent: codigoEnviado ? "space-between" : "flex-end",
            }}
          >
            {codigoEnviado && (
              <Button
                onClick={handlePedirCodigo}
                color="inherit"
                size="small"
                disabled={enviandoCodigo}
              >
                Reenviar Código
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!codigoEnviado || guardandoPass}
            >
              {guardandoPass ? "Guardando..." : "Activar Cuenta"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DashboardDoctor;
