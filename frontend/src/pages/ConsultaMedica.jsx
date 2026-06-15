// frontend/src/pages/ConsultaMedica.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  IconButton,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  Alert,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import clienteAxios from "../api/axios";

// --- LISTAS MAESTRAS PARA ESTANDARIZACIÓN ESTADÍSTICA ---
const TIPOS_SANGRE = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "No reg.",
];
const ALERGIAS_COMUNES = [
  "Penicilina",
  "AINEs (Ibuprofeno/Aspirina)",
  "Sulfas",
  "Látex",
  "Mariscos",
  "Nueces/Cacahuates",
  "Polvo",
  "Ninguna",
];
const CRONICAS_COMUNES = [
  "Diabetes Mellitus Tipo 1",
  "Diabetes Mellitus Tipo 2",
  "Hipertensión Arterial",
  "Asma",
  "Hipotiroidismo",
  "Obesidad",
  "Epilepsia",
  "Ninguna",
];
const HABITOS_COMUNES = [
  "Tabaquismo Activo",
  "Alcoholismo",
  "Uso de Drogas Recreativas",
  "Sedentarismo",
  "Ninguno",
];

const pasos = [
  "Expediente Base (Inmutables)",
  "Signos Vitales y Exploración",
  "Receta Médica",
];

const ConsultaMedica = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id_cita, id_paciente, nombre_paciente } = location.state || {};

  const [pasoActivo, setPasoActivo] = useState(0);
  const [esPrimeraCita, setEsPrimeraCita] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // El estado maneja arrays para los Autocompletes múltiples
  const [datosExpediente, setDatosExpediente] = useState({
    tipo_sangre: "No reg.",
    alergias: [],
    antecedentes_heredofamiliares: "",
    enfermedades_cronicas: [],
    antecedentes_quirurgicos: "",
    habitos_toxicomania: [],
  });

  useEffect(() => {
    if (!id_cita || !id_paciente) {
      alert("Error: Faltan datos de la cita.");
      navigate(-1);
      return;
    }

    const revisarExpediente = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const respuesta = await clienteAxios.get(
          `/doctores/expediente/${id_paciente}`,
          config,
        );

        if (respuesta.data.existe) {
          setEsPrimeraCita(false);
          const bd = respuesta.data.datos;
          // Transformamos los strings separados por comas de la BD a arrays para el Autocomplete
          setDatosExpediente({
            tipo_sangre: bd.tipo_sangre || "No reg.",
            alergias: bd.alergias ? bd.alergias.split(", ") : [],
            antecedentes_heredofamiliares:
              bd.antecedentes_heredofamiliares || "",
            enfermedades_cronicas: bd.enfermedades_cronicas
              ? bd.enfermedades_cronicas.split(", ")
              : [],
            antecedentes_quirurgicos: bd.antecedentes_quirurgicos || "",
            habitos_toxicomania: bd.habitos_toxicomania
              ? bd.habitos_toxicomania.split(", ")
              : [],
          });
        } else {
          setEsPrimeraCita(true);
        }
      } catch (error) {
        console.error("Error al buscar expediente:", error);
      } finally {
        setCargando(false);
      }
    };

    revisarExpediente();
  }, [id_cita, id_paciente, navigate]);

  const handleSiguiente = async () => {
    // Si estamos en el Paso 0, guardamos en la base de datos antes de avanzar
    if (pasoActivo === 0) {
      try {
        setGuardando(true);
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Transformamos los arrays de nuevo a strings separados por comas para MySQL
        const payload = {
          id_paciente,
          tipo_sangre: datosExpediente.tipo_sangre,
          alergias: datosExpediente.alergias.join(", "),
          antecedentes_heredofamiliares:
            datosExpediente.antecedentes_heredofamiliares,
          enfermedades_cronicas:
            datosExpediente.enfermedades_cronicas.join(", "),
          antecedentes_quirurgicos: datosExpediente.antecedentes_quirurgicos,
          habitos_toxicomania: datosExpediente.habitos_toxicomania.join(", "),
        };

        await clienteAxios.post("/doctores/expediente", payload, config);

        // Una vez guardado con éxito, avanzamos de pantalla
        setPasoActivo((prevPaso) => prevPaso + 1);
      } catch (error) {
        console.error("Error al guardar expediente:", error);
        alert("Hubo un error al guardar los datos del paciente.");
      } finally {
        setGuardando(false);
      }
    } else {
      setPasoActivo((prevPaso) => prevPaso + 1);
    }
  };

  const handleAtras = () => setPasoActivo((prevPaso) => prevPaso - 1);

  const renderContenidoPaso = (paso) => {
    switch (paso) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              {esPrimeraCita
                ? "El paciente no cuenta con antecedentes. Por favor, realice la entrevista inicial completa."
                : "Revise los antecedentes del paciente. Agregue o elimine información si el paciente reporta cambios."}
            </Alert>
            <Grid container spacing={3}>
              {/* TIPO DE SANGRE */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Sangre</InputLabel>
                  <Select
                    value={datosExpediente.tipo_sangre}
                    label="Tipo de Sangre"
                    onChange={(e) =>
                      setDatosExpediente({
                        ...datosExpediente,
                        tipo_sangre: e.target.value,
                      })
                    }
                  >
                    {TIPOS_SANGRE.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* ALERGIAS */}
              <Grid item xs={12} sm={8}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={ALERGIAS_COMUNES}
                  value={datosExpediente.alergias}
                  onChange={(_, newValue) =>
                    setDatosExpediente({
                      ...datosExpediente,
                      alergias: newValue,
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Alergias Conocidas"
                      placeholder="Seleccione o escriba..."
                    />
                  )}
                />
              </Grid>

              {/* ENFERMEDADES CRÓNICAS */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={CRONICAS_COMUNES}
                  value={datosExpediente.enfermedades_cronicas}
                  onChange={(_, newValue) =>
                    setDatosExpediente({
                      ...datosExpediente,
                      enfermedades_cronicas: newValue,
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Enfermedades Crónicas"
                      placeholder="Seleccione o escriba..."
                    />
                  )}
                />
              </Grid>

              {/* HÁBITOS Y TOXICOMANÍAS */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={HABITOS_COMUNES}
                  value={datosExpediente.habitos_toxicomania}
                  onChange={(_, newValue) =>
                    setDatosExpediente({
                      ...datosExpediente,
                      habitos_toxicomania: newValue,
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Hábitos de Riesgo"
                      placeholder="Seleccione o escriba..."
                    />
                  )}
                />
              </Grid>

              {/* ANTECEDENTES HEREDOFAMILIARES (Texto libre recomendado por la variabilidad) */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Antecedentes Heredofamiliares"
                  placeholder="Ej. Padre finado por infarto agudo al miocardio, Madre con DM2..."
                  value={datosExpediente.antecedentes_heredofamiliares}
                  onChange={(e) =>
                    setDatosExpediente({
                      ...datosExpediente,
                      antecedentes_heredofamiliares: e.target.value,
                    })
                  }
                />
              </Grid>

              {/* ANTECEDENTES QUIRÚRGICOS */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Antecedentes Quirúrgicos / Hospitalizaciones"
                  placeholder="Ej. Apendicectomía en 2015, sin complicaciones..."
                  value={datosExpediente.antecedentes_quirurgicos}
                  onChange={(e) =>
                    setDatosExpediente({
                      ...datosExpediente,
                      antecedentes_quirurgicos: e.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ p: 3, textAlign: "center" }}>
            [ Formulario de Signos Vitales y Diagnóstico ]
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: 3, textAlign: "center" }}>
            [ Buscador de Medicamentos ]
          </Box>
        );
      default:
        return null;
    }
  };

  if (cargando)
    return (
      <Typography sx={{ mt: 5, textAlign: "center" }}>
        Preparando entorno clínico...
      </Typography>
    );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 4 }}>
      <Container maxWidth="md">
        {/* BANNER MODO PRUEBAS */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Modo Pruebas Activo:</strong> El sistema de bloqueo por
          horario de consulta está temporalmente deshabilitado.
        </Alert>

        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ bgcolor: "white", boxShadow: 1 }}
          >
            <ArrowBackIcon color="primary" />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" color="#0F766E">
            Consulta Actual: {nombre_paciente}
          </Typography>
        </Box>

        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Stepper activeStep={pasoActivo} alternativeLabel sx={{ mb: 4 }}>
            {pasos.map((etiqueta) => (
              <Step key={etiqueta}>
                <StepLabel>{etiqueta}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box
            sx={{
              minHeight: 250,
              bgcolor: "#F1F5F9",
              borderRadius: 2,
              border: "1px solid #CBD5E1",
            }}
          >
            {renderContenidoPaso(pasoActivo)}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              disabled={pasoActivo === 0 || guardando}
              onClick={handleAtras}
              variant="outlined"
            >
              Atrás
            </Button>

            {pasoActivo === pasos.length - 1 ? (
              <Button variant="contained" color="success">
                Finalizar y Emitir Receta
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSiguiente}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar y Continuar"}
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ConsultaMedica;
