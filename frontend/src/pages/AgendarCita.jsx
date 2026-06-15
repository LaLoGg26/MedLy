import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  AlertTitle,
  Stack,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios"; // Importamos tu instancia de axios

const AgendarCita = () => {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const solicitarCita = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      // Como axios.js ya tiene interceptor, NO necesitamos pasar el token manualmente
      const response = await clienteAxios.post("/citas/agendar");
      setResultado(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Ocurrió un error al asignar la cita.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      {/* Botón para regresar al dashboard */}
      <Button
        onClick={() => navigate("/dashboard")}
        sx={{ mb: 2 }}
        color="primary"
      >
        &larr; Volver al Dashboard
      </Button>

      <Card
        elevation={3}
        sx={{ borderRadius: 3, borderLeft: "6px solid #1976d2" }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <EventAvailableIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography
              variant="h5"
              component="h1"
              fontWeight="bold"
              color="text.primary"
              textAlign="center"
            >
              Solicitar Consulta General
            </Typography>
          </Stack>

          {!resultado ? (
            <Box>
              <Alert
                icon={<InfoOutlinedIcon fontSize="inherit" />}
                severity="info"
                sx={{ mb: 4, borderRadius: 2 }}
              >
                <AlertTitle sx={{ fontWeight: "bold" }}>
                  ¿Cómo funciona?
                </AlertTitle>
                Nuestro sistema buscará y te asignará automáticamente{" "}
                <strong>
                  el próximo horario disponible a partir de mañana
                </strong>
                . Duración: 1 hora.
              </Alert>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={solicitarCita}
                disabled={loading}
                sx={{
                  py: 1.5,
                  backgroundColor: "#1976d2",
                  "&:hover": { backgroundColor: "#115293" },
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Asignarme la Próxima Cita"
                )}
              </Button>
            </Box>
          ) : (
            <Alert
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
              severity="success"
              sx={{ borderRadius: 2, "& .MuiAlert-message": { width: "100%" } }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                ¡Tu cita ha sido confirmada!
              </Typography>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "rgba(255,255,255,0.5)",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1">
                  <strong>Fecha asignada:</strong> {resultado.fecha}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Horario:</strong> {resultado.hora} hrs
                </Typography>
              </Box>
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AgendarCita;
