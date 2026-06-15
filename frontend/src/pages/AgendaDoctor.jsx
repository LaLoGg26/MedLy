// frontend/src/pages/AgendaDoctor.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import clienteAxios from "../api/axios";

const AgendaDoctor = () => {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerCitas = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const respuesta = await clienteAxios.get(
          "/doctores/citas-programadas",
          config,
        );
        setCitas(respuesta.data);
      } catch (error) {
        console.error("Error al cargar agenda:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerCitas();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <IconButton
            onClick={() => navigate("/doctor")}
            sx={{ bgcolor: "white", boxShadow: 1 }}
          >
            <ArrowBackIcon color="primary" />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" color="#0F766E">
            Mi Agenda de Consultas
          </Typography>
        </Box>

        {cargando ? (
          <Typography textAlign="center">Cargando tu agenda...</Typography>
        ) : citas.length === 0 ? (
          <Card
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              border: "1px dashed #CBD5E1",
              boxShadow: "none",
            }}
          >
            <Typography color="text.secondary">
              No tienes citas programadas por el momento.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {citas.map((cita) => (
              <Grid item xs={12} key={cita.id_cita}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    {/* Sección Fecha/Hora */}
                    <Box
                      sx={{
                        minWidth: 150,
                        textAlign: "center",
                        borderRight: { sm: "1px solid #E2E8F0" },
                        pr: { sm: 3 },
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="#0F766E"
                        fontWeight="bold"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <AccessTimeIcon fontSize="small" />{" "}
                        {cita.hora.slice(0, 5)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <EventIcon fontSize="small" /> {cita.fecha}
                      </Typography>
                      <Chip
                        label="Programada"
                        color="success"
                        size="small"
                        sx={{ mt: 1.5, fontWeight: "bold" }}
                      />
                    </Box>

                    {/* Sección Paciente */}
                    <Box
                      sx={{
                        flexGrow: 1,
                        textAlign: { xs: "center", sm: "left" },
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="#1E293B"
                      >
                        {cita.nombres} {cita.apellido_paterno}{" "}
                        {cita.apellido_materno}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: { xs: "center", sm: "flex-start" },
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <PhoneIcon fontSize="small" />{" "}
                        {cita.telefono || "Sin teléfono registrado"}
                      </Typography>
                    </Box>

                    {/* Acciones */}
                    <Box>
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{ borderRadius: 2 }}
                        onClick={() =>
                          navigate("/doctor/consulta", {
                            state: {
                              id_cita: cita.id_cita,
                              id_paciente: cita.id_paciente,
                              nombre_paciente: `${cita.nombres} ${cita.apellido_paterno}`,
                            },
                          })
                        }
                      >
                        Iniciar Consulta
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default AgendaDoctor;
