// frontend/src/pages/DirectorioPacientes.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import clienteAxios from "../api/axios";

const DirectorioPacientes = () => {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const respuesta = await clienteAxios.get("/doctores/pacientes", config);
        setPacientes(respuesta.data);
      } catch (error) {
        console.error("Error al obtener directorio:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarPacientes();
  }, []);

  // Filtro en tiempo real
  const pacientesFiltrados = pacientes.filter((paciente) => {
    const termino = busqueda.toLowerCase();
    const nombreCompleto =
      `${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno}`.toLowerCase();
    return (
      nombreCompleto.includes(termino) ||
      paciente.id_paciente_visible.toLowerCase().includes(termino)
    );
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 4 }}>
      <Container maxWidth="lg">
        {/* HEADER */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ bgcolor: "white", boxShadow: 1 }}
          >
            <ArrowBackIcon color="primary" />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" color="#0F766E">
            Directorio de Pacientes
          </Typography>
        </Box>

        {/* BUSCADOR */}
        <Paper
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          }}
        >
          <TextField
            fullWidth
            placeholder="Buscar paciente por nombre o ID Oficial (Ej. PAC-00001)..."
            variant="outlined"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: "#F1F5F9" },
            }}
          />
        </Paper>

        {/* TABLA DE RESULTADOS */}
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#F0FDFA" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", color: "#0F766E" }}>
                  ID Oficial
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#0F766E" }}>
                  Nombre Completo
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#0F766E" }}>
                  Sexo / Nacimiento
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#0F766E" }}>
                  Contacto
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", color: "#0F766E" }}
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    Cargando base de datos...
                  </TableCell>
                </TableRow>
              ) : pacientesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 3, color: "text.secondary" }}
                  >
                    No se encontraron pacientes con ese criterio.
                  </TableCell>
                </TableRow>
              ) : (
                pacientesFiltrados.map((p) => (
                  <TableRow key={p.id_paciente} hover>
                    <TableCell>
                      <Chip
                        label={p.id_paciente_visible}
                        size="small"
                        sx={{ fontWeight: "bold", bgcolor: "#E2E8F0" }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: "500", color: "#1E293B" }}>
                      {p.nombres} {p.apellido_paterno} {p.apellido_materno}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{p.sexo}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(p.fecha_nacimiento).toLocaleDateString(
                          "es-MX",
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {p.telefono || "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.correo}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityOutlinedIcon />}
                        sx={{ borderRadius: 2 }}
                        onClick={() =>
                          alert(`Próximamente: Historial de ${p.nombres}`)
                        }
                      >
                        Expediente
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default DirectorioPacientes;
