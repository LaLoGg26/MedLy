// frontend/src/pages/NuevoMedico.jsx
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
  AppBar,
  Toolbar,
  IconButton,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios";

// Íconos limpios (A prueba de errores de caché de Vite)
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";

const NuevoMedico = () => {
  const navigate = useNavigate();

  // 1. Datos básicos fijos del médico
  const [datos, setDatos] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    sexo: "",
    curp: "",
    telefono: "",
    correo_personal: "",
    cedula: "",
    calle: "",
    colonia: "",
    codigo_postal: "",
    ciudad: "",
    estado: "",
  });

  // 2. Estados para el manejo dinámico del catálogo y especialidades
  const [catalogoEspecialidades, setCatalogoEspecialidades] = useState([]);
  const [espTemporal, setEspTemporal] = useState({
    id_especialidad: "",
    cedula_especialidad: "",
  });
  const [especialidadesAsignadas, setEspecialidadesAsignadas] = useState([]);

  const [modalExito, setModalExito] = useState(false);
  const [credenciales, setCredenciales] = useState({
    correo: "",
    password: "",
  });
  const [cargando, setCargando] = useState(false);

  // Cargar el catálogo del backend al montar la página
  useEffect(() => {
    const obtenerCatalogo = async () => {
      try {
        const respuesta = await clienteAxios.get("/admin/especialidades");
        setCatalogoEspecialidades(respuesta.data);
      } catch (error) {
        console.error("Error al cargar catálogo:", error);
        alert("No se pudo cargar el catálogo de especialidades.");
      }
    };
    obtenerCatalogo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validación: Las cédulas solo llevan números
    if (
      (name === "cedula" || name === "cedula_especialidad") &&
      !/^\d*$/.test(value)
    ) {
      return;
    }

    const valorFinal = name === "correo_personal" ? value : value.toUpperCase();
    setDatos({ ...datos, [name]: valorFinal });
  };

  // Agrega una especialidad a la lista de vista previa antes de enviar todo
  const handleAgregarEspecialidadLista = () => {
    if (!espTemporal.id_especialidad || !espTemporal.cedula_especialidad) {
      alert(
        "Debes seleccionar una especialidad y escribir su cédula correspondiente.",
      );
      return;
    }

    if (espTemporal.cedula_especialidad.length < 7) {
      alert("La cédula de la especialidad debe tener entre 7 y 8 dígitos.");
      return;
    }

    // Buscamos el nombre de la especialidad para mostrarlo en el Chip
    const encontrada = catalogoEspecialidades.find(
      (e) => e.id_especialidad === espTemporal.id_especialidad,
    );

    // Evitar duplicar la misma especialidad en la lista de alta
    const yaExiste = listadoYaTieneId(espTemporal.id_especialidad);
    if (yaExiste) {
      alert("Esta especialidad ya está agregada en la lista de alta.");
      return;
    }

    setEspecialidadesAsignadas([
      ...especialidadesAsignadas,
      {
        id_especialidad: espTemporal.id_especialidad,
        cedula_especialidad: espTemporal.cedula_especialidad,
        nombre: encontrada.nombre_especialidad,
      },
    ]);

    // Limpiamos los selectores temporales
    setEspTemporal({ id_especialidad: "", cedula_especialidad: "" });
  };

  const listadoYaTieneId = (id) => {
    return blackjackId(id);
  };

  const blackjackId = (id) => {
    return especialidadesAsignadas.some((e) => e.id_especialidad === id);
  };

  const handleRemoverEspecialidadLista = (index) => {
    setEspecialidadesAsignadas(
      especialidadesAsignadas.filter((_, i) => i !== index),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (datos.cedula.length < 7) {
      alert("La Cédula Profesional General debe tener al menos 7 dígitos.");
      return;
    }

    try {
      setCargando(true);

      // Construimos el cuerpo final inyectando el horario por defecto y el arreglo mapeado
      const payload = {
        ...datos,
        horario: "POR ASIGNAR",
        especialidades: especialidadesAsignadas, // Mandamos el arreglo [{id_especialidad, cedula_especialidad}]
      };

      const respuesta = await clienteAxios.post("/admin/doctores", payload);

      setCredenciales({
        correo: respuesta.data.correo_generado,
        password: respuesta.data.id_doctor,
      });

      setModalExito(true);
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.mensaje || "Error al registrar al médico.");
    } finally {
      setCargando(false);
    }
  };

  const finalizarRegistro = () => {
    setModalExito(false);
    navigate("/admin");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F4F7FE", pb: 6 }}>
      {/* BARRA SUPERIOR DE NAVEGACIÓN */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: "#1E293B" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/admin")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" color="white" fontWeight="bold">
            Registro de Nuevo Médico
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Card
          sx={{
            maxWidth: 1000,
            width: "95%",
            p: { xs: 2, md: 4 },
            borderRadius: 4,
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 4,
                color: "primary.main",
              }}
            >
              <LocalHospitalOutlinedIcon sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h4" fontWeight="800">
                Alta de Personal Médico
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              {/* SECCIÓN 1: IDENTIDAD */}
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
                  <Typography
                    variant="h6"
                    color="text.primary"
                    fontWeight="bold"
                  >
                    Identidad Oficial
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
                      type={datos.fecha_nacimiento ? "date" : "text"}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => {
                        if (!datos.fecha_nacimiento) e.target.type = "text";
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CakeOutlinedIcon color="disabled" />
                          </InputAdornment>
                        ),
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WcOutlinedIcon color="disabled" />
                          </InputAdornment>
                        ),
                      }}
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

              {/* SECCIÓN 2: PERFIL PROFESIONAL */}
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
                  <WorkOutlineOutlinedIcon
                    sx={{ color: "secondary.main", mr: 1 }}
                  />
                  <Typography
                    variant="h6"
                    color="text.primary"
                    fontWeight="bold"
                  >
                    Perfil Profesional e Historial Académico
                  </Typography>
                </Box>
                <Grid container spacing={3} mb={3}>
                  {/* Cédula Obligatoria de Médico General */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cédula Profesional Requerida (Médico General)"
                      name="cedula"
                      required
                      value={datos.cedula}
                      onChange={handleChange}
                      inputProps={{ maxLength: 8 }}
                      helperText="Pilar básico legal: 7 u 8 dígitos numéricos emitidos por la SEP"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2, borderStyle: "dashed" }} />

                {/* ASIGNADOR DE ESPECIALIDADES DEL CATÁLOGO */}
                <Typography
                  variant="subtitle2"
                  color="secondary"
                  fontWeight="bold"
                  mt={2}
                  mb={1}
                >
                  Vincular Especialidades Especiales (Opcional)
                </Typography>
                <Grid container spacing={2} alignItems="center" mb={2}>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      select
                      label="Seleccionar especialidad disponible"
                      value={espTemporal.id_especialidad}
                      onChange={(e) =>
                        setEspTemporal({
                          ...espTemporal,
                          id_especialidad: e.target.value,
                        })
                      }
                    >
                      {catalogoEspecialidades.map((esp) => (
                        <MenuItem
                          key={esp.id_especialidad}
                          value={esp.id_especialidad}
                        >
                          {esp.nombre_especialidad}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Cédula de Especialidad"
                      value={espTemporal.cedula_especialidad}
                      onChange={(e) =>
                        setEspTemporal({
                          ...espTemporal,
                          cedula_especialidad: e.target.value.replace(
                            /\D/g,
                            "",
                          ),
                        })
                      }
                      inputProps={{ maxLength: 8 }}
                      placeholder="8 dígitos numéricos"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="secondary"
                      startIcon={<AddIcon />}
                      onClick={handleAgregarEspecialidadLista}
                      sx={{ py: 1.5 }}
                    >
                      Asignar Rama
                    </Button>
                  </Grid>
                </Grid>

                {/* Vista previa de especialidades asignadas antes de guardar */}
                {especialidadesAsignadas.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      p: 2,
                      bgcolor: "#F0FDF4",
                      borderRadius: 2,
                      border: "1px solid #BBF7D0",
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      color="success.main"
                      sx={{ width: "100%" }}
                    >
                      ESPECIALIDADES A AGREGAR EN ESTE REGISTRO:
                    </Typography>
                    {especialidadesAsignadas.map((esp, idx) => (
                      <Chip
                        key={idx}
                        label={`${esp.nombre} (Cédula: ${esp.cedula_especialidad})`}
                        size="small"
                        color="success"
                        variant="outlined"
                        onDelete={() => handleRemoverEspecialidadLista(idx)}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* SECCIÓN 3: DIRECCIÓN Y CONTACTO */}
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
                  <Typography
                    variant="h6"
                    color="text.primary"
                    fontWeight="bold"
                  >
                    Contacto y Residencia
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Correo Electrónico Personal"
                      name="correo_personal"
                      type="email"
                      required
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon color="disabled" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
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
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Calle y Número"
                      name="calle"
                      required
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} md={2}>
                    <TextField
                      fullWidth
                      label="C.P."
                      name="codigo_postal"
                      required
                      onChange={handleChange}
                      inputProps={{ maxLength: 5 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8} md={6}>
                    <TextField
                      fullWidth
                      label="Colonia"
                      name="colonia"
                      required
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ciudad / Municipio"
                      name="ciudad"
                      required
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
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

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => navigate("/admin")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={cargando}
                  sx={{ px: 6 }}
                >
                  {cargando ? "Procesando Alta..." : "Registrar Médico"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>

      {/* MODAL DE ÉXITO Y CREDENCIALES */}
      <Dialog
        open={modalExito}
        disableEscapeKeyDown
        PaperProps={{ sx: { borderRadius: 3, p: 2, maxWidth: 500 } }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            color: "success.main",
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          ¡Médico Registrado con Éxito!
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" mb={2} textAlign="center">
            La cuenta ha sido creada y el correo de bienvenida ha sido enviado
            al profesional. Estas son sus credenciales oficiales:
          </Typography>

          <Box
            sx={{
              bgcolor: "#F8FAFC",
              p: 3,
              borderRadius: 2,
              border: "1px solid #E2E8F0",
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
              textTransform="uppercase"
            >
              Correo Institucional
            </Typography>
            <Typography
              variant="h6"
              color="primary.main"
              fontWeight="bold"
              sx={{ mb: 2, wordBreak: "break-all" }}
            >
              {credenciales.correo}
            </Typography>

            <Typography
              variant="subtitle2"
              color="text.secondary"
              textTransform="uppercase"
            >
              Contraseña Temporal
            </Typography>
            <Typography
              variant="h5"
              color="error.main"
              fontWeight="bold"
              letterSpacing={2}
            >
              {credenciales.password}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            El médico deberá utilizar estas credenciales para su primer inicio
            de sesión en MedLy.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={finalizarRegistro}
            size="large"
            sx={{ px: 4 }}
          >
            Volver al Panel de Control
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NuevoMedico;
