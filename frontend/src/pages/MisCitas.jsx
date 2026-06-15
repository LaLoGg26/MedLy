import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Grid,
  Chip,
  Divider,
  Stack,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const MisCitas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarCitas = async () => {
      try {
        const respuesta = await clienteAxios.get("/citas/paciente");
        setCitas(respuesta.data.data);
      } catch (error) {
        console.error("Error al cargar citas:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarCitas();
  }, []);

  const getColorEstado = (estado) => {
    switch (estado) {
      case "programada":
        return "primary";
      case "completada":
        return "success";
      case "cancelada":
        return "error";
      default:
        return "default";
    }
  };

  const formatearFecha = (fechaISO) => {
    // Cortamos la cadena para que "2026-06-15T00:00:00.000Z" quede como "2026-06-15"
    const soloFecha = fechaISO.split("T")[0];

    return new Date(`${soloFecha}T00:00:00`).toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8 }}>
      <Button onClick={() => navigate("/dashboard")} sx={{ mb: 3 }}>
        &larr; Volver al Dashboard
      </Button>

      <Typography variant="h4" fontWeight="bold" color="#0F172A" mb={1}>
        Historial de Citas
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Aquí puedes consultar todas tus consultas programadas y pasadas.
      </Typography>

      {/* NUEVA TARJETA DE AVISO DE CANCELACIÓN */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="inherit" />}
        sx={{ mb: 4, borderRadius: 2 }}
      >
        <AlertTitle sx={{ fontWeight: "bold" }}>
          Política de Cancelación y Reprogramación
        </AlertTitle>
        Para mantener el orden de nuestra agenda médica, las cancelaciones no se
        pueden realizar desde esta plataforma. Si necesitas cancelar o reagendar
        tu cita, por favor comunícate directamente con la{" "}
        <strong>recepción de la clínica</strong>.
      </Alert>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : citas.length === 0 ? (
        <Card sx={{ textAlign: "center", p: 5, borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Aún no tienes ninguna cita registrada en el sistema.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {citas.map((cita) => (
            <Grid item xs={12} key={cita.id_cita}>
              <Card
                elevation={1}
                sx={{
                  borderRadius: 3,
                  borderLeft:
                    cita.estado === "programada"
                      ? "6px solid #1976d2"
                      : "6px solid #e0e0e0",
                  transition: "0.2s",
                  "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
                }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <Stack spacing={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarMonthIcon color="action" fontSize="small" />
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ textTransform: "capitalize" }}
                        >
                          {formatearFecha(cita.fecha)}
                        </Typography>
                      </Box>

                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        color="text.secondary"
                      >
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="body2">
                          {cita.hora.substring(0, 5)} hrs (Duración: 1 hora)
                        </Typography>
                      </Box>

                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        color="text.secondary"
                      >
                        <PersonIcon fontSize="small" />
                        <Typography variant="body2">
                          Dr. {cita.doctor_nombre} {cita.doctor_apellido}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box textAlign="right">
                      <Chip
                        label={cita.estado.toUpperCase()}
                        color={getColorEstado(cita.estado)}
                        variant={
                          cita.estado === "programada" ? "filled" : "outlined"
                        }
                        sx={{ fontWeight: "bold" }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MisCitas;
