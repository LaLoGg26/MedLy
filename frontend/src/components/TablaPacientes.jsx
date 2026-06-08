// frontend/src/components/TablaPacientes.jsx
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import clienteAxios from "../api/axios";

const TablaPacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ESTADO PARA ALMACENAR EL TEXTO DE BÚSQUEDA
  const [busqueda, setBusqueda] = useState("");

  const cargarPacientes = async () => {
    try {
      const respuesta = await clienteAxios.get("/admin/pacientes");
      setPacientes(respuesta.data);
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-MX", { timeZone: "UTC" });
  };

  // LÓGICA DE FILTRADO EN TIEMPO REAL
  // Filtra por nombre completo o por CURP ignorando mayúsculas/minúsculas
  const pacientesFiltrados = pacientes.filter((paciente) => {
    const nombreCompleto =
      `${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno}`.toLowerCase();
    const curp = paciente.curp.toLowerCase();
    const termino = busqueda.toLowerCase();

    return nombreCompleto.includes(termino) || curp.includes(termino);
  });

  if (cargando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      {/* BARRA DE BÚSQUEDA INTELIGENTE */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar por nombre o CURP..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{
            width: { xs: "100%", sm: 350 },
            bgcolor: "white",
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* TABLA DE RESULTADOS */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="tabla de pacientes">
          <TableHead sx={{ bgcolor: "#F8FAFC" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
                ID PACIENTE
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
                NOMBRE COMPLETO
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
                CURP
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
                FECHA NACIMIENTO
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
                CONTACTO
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map((paciente) => (
                <TableRow
                  key={paciente.id_paciente}
                  sx={{ "&:hover": { bgcolor: "#F1F5F9" } }}
                >
                  <TableCell>
                    <Chip
                      label={`PAC-${paciente.id_paciente.toString().padStart(5, "0")}`}
                      size="small"
                      sx={{
                        fontWeight: "bold",
                        bgcolor: "#F3E8FF",
                        color: "#6B21A8",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      {`${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", letterSpacing: 0.5 }}
                    >
                      {paciente.curp}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatearFecha(paciente.fecha_nacimiento)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{paciente.correo}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tel: {paciente.telefono}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron pacientes que coincidan con "{busqueda}"
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TablaPacientes;
