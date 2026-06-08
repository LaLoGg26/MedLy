// frontend/src/pages/CompletarPerfil.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import clienteAxios from "../api/axios";

// Íconos para mejorar la UX
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const CompletarPerfil = () => {
  const navigate = useNavigate();
  const [idUsuario, setIdUsuario] = useState(null);

  const [datos, setDatos] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    sexo: "",
    curp: "",
    telefono: "",
    calle: "",
    numero: "",
    colonia: "",
    cp: "",
    ciudad: "",
    estado: "",
  });

  const [modalAbierto, setModalAbierto] = useState(false);
  const [confirmarAbierto, setConfirmarAbierto] = useState(false);
  const [idGenerado, setIdGenerado] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodificado = jwtDecode(token);
      setIdUsuario(decodificado.id_usuario);
    }
  }, []);

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value.toUpperCase() });
  };

  // 1. Esta función se ejecuta al darle clic al botón rosa del formulario
  const solicitarGuardado = (e) => {
    e.preventDefault(); // Evitamos que la página se recargue
    setConfirmarAbierto(true); // Abrimos la advertencia
  };

  // 2. Esta función se ejecuta solo si el usuario le da a "Confirmar" en la advertencia
  const ejecutarGuardadoReal = async () => {
    setConfirmarAbierto(false); // Cerramos la advertencia

    try {
      setCargando(true);
      const payload = { ...datos, id_usuario: idUsuario };
      const respuesta = await clienteAxios.post("/pacientes", payload);

      setIdGenerado(respuesta.data.id_paciente);
      setModalAbierto(true); // Abrimos el modal de éxito (el del ID)
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.mensaje || "Error al guardar el expediente");
    } finally {
      setCargando(false);
    }
  };

  const finalizarRegistro = () => {
    setModalAbierto(false);
    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        bgcolor: "#F4F7FE",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        sx={{
          maxWidth: 900,
          width: "95%",
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent>
          {/* HEADER DEL FORMULARIO */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1,
              color: "primary.main",
            }}
          >
            <Box
              sx={{
                bgcolor: "secondary.light",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
                mr: 2,
              }}
            >
              <AssignmentIndIcon
                sx={{ fontSize: 32, color: "secondary.dark" }}
              />
            </Box>
            <Typography variant="h4" fontWeight="800">
              Completar Expediente
            </Typography>
          </Box>
          <Typography color="text.secondary" mb={5} ml={8}>
            Para brindarte la mejor atención, necesitamos tus datos oficiales.
          </Typography>

          <form onSubmit={solicitarGuardado}>
            {/* SECCIÓN: DATOS PERSONALES */}
            <Box
              sx={{
                bgcolor: "#FAFBFC",
                p: 3,
                borderRadius: 3,
                mb: 4,
                border: "1px solid #E2E8F0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <AccountCircleOutlinedIcon
                  sx={{ color: "secondary.main", mr: 1 }}
                />
                <Typography variant="h6" color="text.primary" fontWeight="bold">
                  Identidad
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Nombre(s)"
                    name="nombres"
                    required
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Apellido Paterno"
                    name="apellido_paterno"
                    required
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Apellido Materno"
                    name="apellido_materno"
                    required
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Fecha de Nacimiento"
                    name="fecha_nacimiento"
                    required
                    value={datos.fecha_nacimiento}
                    onChange={handleChange}
                    // Truco: Es texto normal, pero al hacer click se vuelve un selector de fecha
                    type={datos.fecha_nacimiento ? "date" : "text"}
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => {
                      if (!datos.fecha_nacimiento) e.target.type = "text";
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Sexo"
                    name="sexo"
                    required
                    value={datos.sexo}
                    onChange={handleChange}
                  >
                    <MenuItem value="MASCULINO">Masculino</MenuItem>
                    <MenuItem value="FEMENINO">Femenino</MenuItem>
                    <MenuItem value="OTRO">Otro</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="CURP"
                    name="curp"
                    required
                    value={datos.curp}
                    inputProps={{ maxLength: 18 }}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeOutlinedIcon color="disabled" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* SECCIÓN: DIRECCIÓN Y CONTACTO */}
            <Box
              sx={{
                bgcolor: "#FAFBFC",
                p: 3,
                borderRadius: 3,
                mb: 4,
                border: "1px solid #E2E8F0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <HomeOutlinedIcon sx={{ color: "secondary.main", mr: 1 }} />
                <Typography variant="h6" color="text.primary" fontWeight="bold">
                  Contacto y Residencia
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Teléfono Móvil"
                    name="telefono"
                    required
                    type="tel"
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ContactPhoneOutlinedIcon color="disabled" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Calle"
                    name="calle"
                    required
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Número (Ext/Int)"
                    name="numero"
                    required
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Código Postal"
                    name="cp"
                    required
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Colonia"
                    name="colonia"
                    required
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Ciudad / Municipio"
                    name="ciudad"
                    required
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Estado"
                    name="estado"
                    required
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={cargando}
                sx={{ px: 6, py: 1.5, fontSize: "1.1rem", borderRadius: 2 }}
              >
                {cargando ? "Generando..." : "Guardar Expediente"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* MODAL DE ADVERTENCIA ANTES DE GUARDAR */}
      <Dialog
        open={confirmarAbierto}
        onClose={() => setConfirmarAbierto(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            color: "warning.main",
            fontWeight: "bold",
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 32, mr: 1 }} />
          Verifica tu información
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, mt: 1 }}>
            Estás a punto de generar tu expediente médico oficial.
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              p: 2,
              bgcolor: "#FFF4E5",
              borderRadius: 2,
              border: "1px solid #FFD8A8",
            }}
          >
            <strong>Importante:</strong> Una vez guardados,{" "}
            <strong>no podrás modificar estos datos</strong> desde tu cuenta por
            motivos de seguridad. Cualquier corrección futura deberá ser
            solicitada directamente al personal médico autorizado.
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 3, fontWeight: "bold", textAlign: "center" }}
          >
            ¿Estás seguro de que todos los datos ingresados son correctos?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "space-between" }}>
          <Button
            onClick={() => setConfirmarAbierto(false)}
            variant="outlined"
            color="inherit"
          >
            Revisar de nuevo
          </Button>
          <Button
            onClick={ejecutarGuardadoReal}
            variant="contained"
            color="primary"
            disabled={cargando}
          >
            Sí, información correcta
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DEL ID GENERADO */}
      <Dialog
        open={modalAbierto}
        disableEscapeKeyDown
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            color: "primary.main",
            fontWeight: "bold",
            fontSize: "1.8rem",
          }}
        >
          ¡Registro Exitoso!
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pb: 2 }}>
          <Typography variant="body1" mb={3} fontSize="1.1rem">
            Tu expediente ha sido creado. Tu número de paciente es:
          </Typography>
          <Box
            sx={{
              bgcolor: "secondary.light",
              p: 3,
              borderRadius: 2,
              display: "inline-block",
              border: "2px dashed",
              borderColor: "secondary.main",
            }}
          >
            <Typography
              variant="h3"
              fontWeight="900"
              letterSpacing={4}
              color="primary.dark"
            >
              {idGenerado}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mt={3}>
            Este número es tu identificador oficial en la clínica.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={finalizarRegistro}
            size="large"
            sx={{ px: 4 }}
          >
            Ir a mi Panel Principal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompletarPerfil;
