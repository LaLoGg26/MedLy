// frontend/src/pages/DashboardPaciente.jsx
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Íconos
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LogoutIcon from "@mui/icons-material/Logout";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const DashboardPaciente = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí después limpiaremos el token de seguridad
    console.log("Cerrando sesión...");
    navigate("/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* NAVBAR */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "white", borderBottom: "1px solid #E0F7F7" }}
      >
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Box
              sx={{
                bgcolor: "primary.light",
                color: "white",
                p: 1,
                borderRadius: "50%",
                display: "flex",
                mr: 1.5,
              }}
            >
              <MedicalServicesIcon />
            </Box>
            <Typography variant="h6" color="primary.main" fontWeight="800">
              MedLy
            </Typography>
          </Box>

          <Button
            color="inherit"
            onClick={handleLogout}
            endIcon={<LogoutIcon />}
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main", bgcolor: "transparent" },
            }}
          >
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      {/* SECCIÓN HERO */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Textos de Bienvenida */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h3"
              color="text.primary"
              fontWeight="800"
              gutterBottom
            >
              Tu salud, en las{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                mejores manos
              </Box>
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, fontWeight: 400, lineHeight: 1.6 }}
            >
              Bienvenido a tu portal personal. Aquí podrás agendar citas,
              revisar tus recetas médicas y mantener un control total de tu
              bienestar, todo en un solo lugar.
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<CalendarMonthIcon />}
                sx={{ color: "secondary.contrastText", px: 4, py: 1.5 }}
              >
                Agendar Cita
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5, bgcolor: "white" }}
              >
                Mi Expediente
              </Button>
            </Box>
          </Grid>

          {/* Imagen Hero */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: "relative" }}>
              {/* Elemento decorativo detrás de la imagen */}
              <Box
                sx={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: "100%",
                  height: "100%",
                  bgcolor: "secondary.light",
                  borderRadius: "24px",
                  zIndex: 0,
                  opacity: 0.5,
                }}
              />
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Doctora sonriendo"
                sx={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "24px",
                  position: "relative",
                  zIndex: 1,
                  boxShadow: "0px 20px 40px rgba(190, 132, 199, 0.15)",
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPaciente;
