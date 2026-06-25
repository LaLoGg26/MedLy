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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  Alert,
  Skeleton,
  Fade,
  Chip,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import clienteAxios from "../api/axios";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";

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

  const [datosExpediente, setDatosExpediente] = useState({
    tipo_sangre: "No reg.",
    alergias: [],
    antecedentes_heredofamiliares: "",
    enfermedades_cronicas: [],
    antecedentes_quirurgicos: "",
    habitos_toxicomania: [],
  });

  const [datosConsulta, setDatosConsulta] = useState({
    peso: "",
    talla: "",
    temperatura: "",
    presion_arterial: "",
    frecuencia_cardiaca: "",
    frecuencia_respiratoria: "",
    saturacion_oxigeno: "",
    motivo_consulta: "",
    exploracion_fisica: "",
    diagnostico: "",
    notas_adicionales: "",
  });

  const [indicacionesGenerales, setIndicacionesGenerales] = useState("");
  const [medicamentos, setMedicamentos] = useState([
    // Iniciamos con un medicamento vacío por defecto
    {
      medicamento: "",
      dosis: "",
      frecuencia: "",
      duracion: "",
      notas_medicamento: "",
    },
  ]);

  // Funciones para manejar el array dinámico de medicamentos
  const agregarMedicamento = () => {
    setMedicamentos([
      ...medicamentos,
      {
        medicamento: "",
        dosis: "",
        frecuencia: "",
        duracion: "",
        notas_medicamento: "",
      },
    ]);
  };

  const removerMedicamento = (index) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== index));
  };

  const actualizarMedicamento = (index, campo, valor) => {
    const nuevosMedicamentos = [...medicamentos];
    nuevosMedicamentos[index][campo] = valor;
    setMedicamentos(nuevosMedicamentos);
  };

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
    try {
      setGuardando(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (pasoActivo === 0) {
        const payloadExpediente = {
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
        await clienteAxios.post(
          "/doctores/expediente",
          payloadExpediente,
          config,
        );
        setPasoActivo(1);
      } else if (pasoActivo === 1) {
        if (!datosConsulta.motivo_consulta || !datosConsulta.diagnostico) {
          alert(
            "El Motivo de Consulta y el Diagnóstico son campos obligatorios.",
          );
          setGuardando(false);
          return;
        }

        const payloadConsulta = {
          id_cita,
          ...datosConsulta,
        };
        await clienteAxios.post(
          "/doctores/consulta-actual",
          payloadConsulta,
          config,
        );
        setPasoActivo(2);
      }
    } catch (error) {
      console.error("Error al guardar datos:", error);
      alert("Hubo un error al guardar la información en el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  const handleFinalizarConsulta = async () => {
    try {
      setGuardando(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        id_cita,
        indicaciones_generales: indicacionesGenerales,
        medicamentos,
      };

      await clienteAxios.post("/doctores/emitir-receta", payload, config);

      alert("¡Consulta finalizada con éxito! El paciente ha sido atendido.");
      navigate("/doctor/agenda"); // Lo regresamos a su agenda
    } catch (error) {
      console.error("Error al emitir receta:", error);
      alert("Hubo un error al procesar la receta.");
    } finally {
      setGuardando(false);
    }
  };

  const handleAtras = () => setPasoActivo((prevPaso) => prevPaso - 1);

  // ESTILO PREMIUM GLOBAL PARA INPUTS
  const inputEstiloPremium = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: "#F8FAFC",
      },
      "&.Mui-focused": {
        backgroundColor: "#FFFFFF",
        boxShadow: "0 0 0 4px rgba(15, 118, 110, 0.15)",
      },
    },
  };

  // ESTILO MEJORADO PARA LOS ADORNOS (kg, cm, rpm, etc)
  const renderAdornment = (text) => (
    <InputAdornment position="end">
      <Typography fontWeight="700" color="#0F766E" sx={{ userSelect: "none" }}>
        {text}
      </Typography>
    </InputAdornment>
  );

  const renderContenidoPaso = (paso) => {
    switch (paso) {
      case 0:
        return (
          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <Fade in={true} timeout={600}>
              <Alert
                severity={esPrimeraCita ? "info" : "success"}
                sx={{
                  mb: 4,
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
              >
                {esPrimeraCita
                  ? "El paciente no cuenta con antecedentes. Por favor, realice la entrevista inicial completa."
                  : "Expediente localizado. Revise los antecedentes y actualice la información si el paciente reporta cambios."}
              </Alert>
            </Fade>

            <div className="grid grid-cols-12 gap-5 items-start w-full">
              <div className="col-span-12 sm:col-span-4 w-full">
                <FormControl fullWidth sx={inputEstiloPremium}>
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
                    sx={{ borderRadius: "12px" }}
                  >
                    {TIPOS_SANGRE.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        <Typography
                          fontWeight={tipo === "No reg." ? "normal" : "bold"}
                          color={
                            tipo.includes("-") ? "error.main" : "text.primary"
                          }
                        >
                          {tipo}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div className="col-span-12 sm:col-span-8 w-full">
                <Autocomplete
                  multiple
                  freeSolo
                  fullWidth
                  options={ALERGIAS_COMUNES}
                  value={datosExpediente.alergias}
                  onChange={(_, newValue) =>
                    setDatosExpediente({
                      ...datosExpediente,
                      alergias: newValue,
                    })
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="filled"
                        label={option}
                        {...getTagProps({ index })}
                        sx={{
                          bgcolor: "#FEE2E2",
                          color: "#991B1B",
                          fontWeight: 600,
                          border: "1px solid #FCA5A5",
                          borderRadius: "8px",
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Alergias Conocidas"
                      placeholder="Añadir alergia..."
                      sx={inputEstiloPremium}
                    />
                  )}
                />
              </div>

              <div className="col-span-12 sm:col-span-6 w-full">
                <Autocomplete
                  multiple
                  freeSolo
                  fullWidth
                  options={CRONICAS_COMUNES}
                  value={datosExpediente.enfermedades_cronicas}
                  onChange={(_, newValue) =>
                    setDatosExpediente({
                      ...datosExpediente,
                      enfermedades_cronicas: newValue,
                    })
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="filled"
                        label={option}
                        {...getTagProps({ index })}
                        sx={{
                          bgcolor: "#FEF3C7",
                          color: "#92400E",
                          fontWeight: 600,
                          border: "1px solid #FCD34D",
                          borderRadius: "8px",
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Enfermedades Crónicas"
                      placeholder="Añadir enfermedad..."
                      sx={inputEstiloPremium}
                    />
                  )}
                />
              </div>

              <div className="col-span-12 sm:col-span-6 w-full">
                <Autocomplete
                  multiple
                  freeSolo
                  fullWidth
                  options={HABITOS_COMUNES}
                  value={datosExpediente.habitos_toxicomania}
                  onChange={(_, newValue) =>
                    setDatosExpediente({
                      ...datosExpediente,
                      habitos_toxicomania: newValue,
                    })
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="filled"
                        label={option}
                        {...getTagProps({ index })}
                        sx={{
                          bgcolor: "#E0F2FE",
                          color: "#075985",
                          fontWeight: 600,
                          border: "1px solid #BAE6FD",
                          borderRadius: "8px",
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Hábitos de Riesgo"
                      placeholder="Añadir hábito..."
                      sx={inputEstiloPremium}
                    />
                  )}
                />
              </div>

              <div className="col-span-12 w-full">
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Antecedentes Heredofamiliares"
                  placeholder="Ej. Padre finado por infarto agudo al miocardio, Madre con DM2..."
                  value={datosExpediente.antecedentes_heredofamiliares}
                  onChange={(e) =>
                    setDatosExpediente({
                      ...datosExpediente,
                      antecedentes_heredofamiliares: e.target.value,
                    })
                  }
                  sx={inputEstiloPremium}
                />
              </div>

              <div className="col-span-12 w-full">
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Antecedentes Quirúrgicos / Hospitalizaciones"
                  placeholder="Ej. Apendicectomía en 2015, sin complicaciones..."
                  value={datosExpediente.antecedentes_quirurgicos}
                  onChange={(e) =>
                    setDatosExpediente({
                      ...datosExpediente,
                      antecedentes_quirurgicos: e.target.value,
                    })
                  }
                  sx={inputEstiloPremium}
                />
              </div>
            </div>
          </Box>
        );

      case 1:
        return (
          <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, sm: 4 } }}>
              {/* SUB-TARJETA: SIGNOS VITALES */}
              <Box
                sx={{
                  bgcolor: "#F8FAFC",
                  p: 3,
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  mb: 4,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="800"
                  color="#0F766E"
                  mb={3}
                  sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                >
                  Signos Vitales y Somatometría
                </Typography>

                <div className="grid grid-cols-12 gap-4 w-full">
                  <div className="col-span-6 sm:col-span-3">
                    <TextField
                      fullWidth
                      label="Peso"
                      type="number"
                      value={datosConsulta.peso}
                      onChange={(e) =>
                        setDatosConsulta({
                          ...datosConsulta,
                          peso: e.target.value,
                        })
                      }
                      InputProps={{ endAdornment: renderAdornment("kg") }}
                      sx={inputEstiloPremium}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <TextField
                      fullWidth
                      label="Talla (cm)"
                      type="number"
                      value={datosConsulta.talla}
                      onChange={(e) =>
                        setDatosConsulta({
                          ...datosConsulta,
                          talla: e.target.value,
                        })
                      }
                      InputProps={{ endAdornment: renderAdornment("m") }}
                      sx={inputEstiloPremium}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <TextField
                      fullWidth
                      label="Temperatura (C°)"
                      type="number"
                      value={datosConsulta.temperatura}
                      onChange={(e) =>
                        setDatosConsulta({
                          ...datosConsulta,
                          temperatura: e.target.value,
                        })
                      }
                      InputProps={{ endAdornment: renderAdornment("°C") }}
                      sx={inputEstiloPremium}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <TextField
                      fullWidth
                      label="Tensión Arterial"
                      placeholder="120/80"
                      value={datosConsulta.presion_arterial}
                      onChange={(e) =>
                        setDatosConsulta({
                          ...datosConsulta,
                          presion_arterial: e.target.value,
                        })
                      }
                      InputProps={{ endAdornment: renderAdornment("mmHg") }}
                      sx={inputEstiloPremium}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-4">
                    <TextField
                      fullWidth
                      label="Frecuencia Cardíaca"
                      type="number"
                      value={datosConsulta.frecuencia_cardiaca}
                      onChange={(e) =>
                        setDatosConsulta({
                          ...datosConsulta,
                          frecuencia_cardiaca: e.target.value,
                        })
                      }
                      InputProps={{ endAdornment: renderAdornment("lpm") }}
                      sx={inputEstiloPremium}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <TextField
                      fullWidth
                      label="Frecuencia Respiratoria"
                      type="number"
                      value={datosConsulta.frecuencia_respiratoria}
                      onChange={(e) =>
                        setDatosConsulta({
                          ...datosConsulta,
                          frecuencia_respiratoria: e.target.value,
                        })
                      }
                      InputProps={{ endAdornment: renderAdornment("rpm") }}
                      sx={inputEstiloPremium}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <TextField
                      fullWidth
                      label="Saturación SpO2"
                      type="number"
                      value={datosConsulta.saturacion_oxigeno}
                      onChange={(e) =>
                        setDatosConsulta({
                          ...datosConsulta,
                          saturacion_oxigeno: e.target.value,
                        })
                      }
                      InputProps={{ endAdornment: renderAdornment("%") }}
                      sx={inputEstiloPremium}
                    />
                  </div>
                </div>
              </Box>

              {/* SUB-TARJETA: DETALLES CLÍNICOS */}
              <Box
                sx={{
                  bgcolor: "#ffffff",
                  p: 3,
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="800"
                  color="#0F172A"
                  mb={3}
                  sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                >
                  Detalles Clínicos de la Consulta
                </Typography>

                <div className="grid grid-cols-12 gap-5 w-full">
                  <div className="col-span-12">
                    <TextField
                      fullWidth
                      required
                      multiline
                      minRows={2}
                      label="Motivo de la Consulta"
                      placeholder="Describa el motivo principal por el que acude el paciente..."
                      value={datosConsulta.motivo_consulta}
                      onChange={(e) =>
                        setDatosConsulta({
                          ...datosConsulta,
                          motivo_consulta: e.target.value,
                        })
                      }
                      sx={inputEstiloPremium}
                    />
                  </div>
                  <div className="col-span-12">
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Exploración Física"
                      placeholder="Hallazgos relevantes durante la inspección, palpación, etc..."
                      value={datosConsulta.exploracion_fisica}
                      onChange={(e) =>
                        setDatosConsulta({
                          ...datosConsulta,
                          exploracion_fisica: e.target.value,
                        })
                      }
                      sx={inputEstiloPremium}
                    />
                  </div>
                  <div className="col-span-12">
                    <TextField
                      fullWidth
                      required
                      multiline
                      minRows={2}
                      label="Diagnóstico Clínico"
                      placeholder="Diagnóstico presuntivo o definitivo..."
                      value={datosConsulta.diagnostico}
                      onChange={(e) =>
                        setDatosConsulta({
                          ...datosConsulta,
                          diagnostico: e.target.value,
                        })
                      }
                      sx={inputEstiloPremium}
                    />
                  </div>
                  <div className="col-span-12">
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Notas Adicionales (Opcional)"
                      placeholder="Información extra, recomendaciones generales..."
                      value={datosConsulta.notas_adicionales}
                      onChange={(e) =>
                        setDatosConsulta({
                          ...datosConsulta,
                          notas_adicionales: e.target.value,
                        })
                      }
                      sx={inputEstiloPremium}
                    />
                  </div>
                </div>
              </Box>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, sm: 4 } }}>
              {/* SECCIÓN DE MEDICAMENTOS */}
              <Box sx={{ mb: 5 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="800"
                  color="#0F766E"
                  mb={3}
                  sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                >
                  Prescripción Médica (Farmacia)
                </Typography>

                {medicamentos.map((med, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      pt: { xs: 5, sm: 3 }, // Padding top extra en móvil para el botón de borrar
                      mb: 3,
                      bgcolor: "#ffffff",
                      borderRadius: "16px",
                      border: "1px solid #E2E8F0",
                      borderLeft: "4px solid #0F766E", // Acento visual estilo "Ticket de receta"
                      position: "relative",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: "0 6px 15px rgba(15, 118, 110, 0.08)",
                      },
                    }}
                  >
                    {/* Botón de eliminar reposicionado y estilizado */}
                    <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                      <IconButton
                        color="error"
                        onClick={() => removerMedicamento(index)}
                        disabled={medicamentos.length === 1}
                        sx={{
                          bgcolor:
                            medicamentos.length === 1
                              ? "transparent"
                              : "#FEF2F2",
                          "&:hover": { bgcolor: "#FEE2E2" },
                        }}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Uso de Tailwind Grid para evitar deformaciones */}
                    <div className="grid grid-cols-12 gap-4 w-full">
                      <div className="col-span-12 sm:col-span-6 w-full">
                        <TextField
                          fullWidth
                          required
                          label="Medicamento (Sustancia Activa)"
                          placeholder="Ej. Paracetamol 500mg"
                          value={med.medicamento}
                          onChange={(e) =>
                            actualizarMedicamento(
                              index,
                              "medicamento",
                              e.target.value,
                            )
                          }
                          sx={inputEstiloPremium}
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-2 w-full">
                        <TextField
                          fullWidth
                          required
                          label="Dosis"
                          placeholder="Ej. 1 Tableta"
                          value={med.dosis}
                          onChange={(e) =>
                            actualizarMedicamento(
                              index,
                              "dosis",
                              e.target.value,
                            )
                          }
                          sx={inputEstiloPremium}
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-2 w-full">
                        <TextField
                          fullWidth
                          required
                          label="Frecuencia"
                          placeholder="Cada 8 hrs"
                          value={med.frecuencia}
                          onChange={(e) =>
                            actualizarMedicamento(
                              index,
                              "frecuencia",
                              e.target.value,
                            )
                          }
                          sx={inputEstiloPremium}
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-2 w-full">
                        <TextField
                          fullWidth
                          required
                          label="Duración"
                          placeholder="Por 5 días"
                          value={med.duracion}
                          onChange={(e) =>
                            actualizarMedicamento(
                              index,
                              "duracion",
                              e.target.value,
                            )
                          }
                          sx={inputEstiloPremium}
                        />
                      </div>
                    </div>
                  </Box>
                ))}

                {/* Botón "Área de Drop" muy visual e interactivo */}
                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlinedIcon />}
                  onClick={agregarMedicamento}
                  sx={{
                    width: "100%",
                    py: 1.5,
                    borderStyle: "dashed",
                    borderWidth: "2px",
                    borderRadius: "12px",
                    color: "#0F766E",
                    borderColor: "#99F6E4",
                    textTransform: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#F0FDFA",
                      borderColor: "#0D9488",
                      borderWidth: "2px",
                    },
                  }}
                >
                  Añadir otro medicamento
                </Button>
              </Box>

              {/* SECCIÓN DE INDICACIONES */}
              <Box
                sx={{
                  bgcolor: "#F8FAFC",
                  p: 3,
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="800"
                  color="#0F172A"
                  mb={3}
                  sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                >
                  Indicaciones Generales y Cuidados
                </Typography>

                <div className="w-full">
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Recomendaciones para el paciente"
                    placeholder="Ej. Evitar grasas, reposo absoluto por 3 días, tomar abundantes líquidos..."
                    value={indicacionesGenerales}
                    onChange={(e) => setIndicacionesGenerales(e.target.value)}
                    sx={inputEstiloPremium}
                  />
                </div>
              </Box>
            </Box>
          </Fade>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: { xs: 3, md: 6 } }}>
      <Container maxWidth="lg">
        {/* BANNER MODO PRUEBAS */}
        <Alert
          severity="warning"
          variant="standard"
          sx={{
            mb: 4,
            borderRadius: "12px",
            border: "1px solid #FDE047",
            "& .MuiAlert-icon": { color: "#CA8A04" },
          }}
        >
          <strong>Modo Pruebas Activo:</strong> El sistema de bloqueo por
          horario de consulta está temporalmente deshabilitado.
        </Alert>

        {/* HEADER DE CONSULTA */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              transition: "transform 0.2s",
              "&:hover": { bgcolor: "white", transform: "scale(1.05)" },
            }}
          >
            <ArrowBackIcon sx={{ color: "#0F766E" }} />
          </IconButton>
          <Typography
            variant="h4"
            fontWeight="800"
            color="#0F172A"
            sx={{ letterSpacing: "-0.5px" }}
          >
            {cargando ? (
              <Skeleton width={300} />
            ) : (
              `Consulta: ${nombre_paciente}`
            )}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: "24px",
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
            border: "1px solid #E2E8F0",
            overflow: "hidden",
          }}
        >
          {/* ÁREA DEL STEPPER */}
          <Box
            sx={{
              bgcolor: "#ffffff",
              borderBottom: "1px solid #F1F5F9",
              px: { xs: 2, md: 6 },
              py: 4,
            }}
          >
            {cargando ? (
              <Skeleton variant="rounded" height={40} />
            ) : (
              <Stepper activeStep={pasoActivo} alternativeLabel>
                {pasos.map((etiqueta) => (
                  <Step key={etiqueta}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          "&.Mui-active": { color: "#0F766E" },
                          "&.Mui-completed": { color: "#14B8A6" },
                        },
                      }}
                    >
                      <Typography fontWeight={500}>{etiqueta}</Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}
          </Box>

          {/* CONTENEDOR DINÁMICO DEL PASO */}
          <Box
            sx={{ minHeight: 400, bgcolor: "#ffffff", position: "relative" }}
          >
            {cargando ? (
              <Box sx={{ p: { xs: 2, sm: 4 } }}>
                <div className="grid grid-cols-12 gap-5 w-full">
                  <div className="col-span-12 sm:col-span-4">
                    <Skeleton variant="rounded" height={56} width="100%" />
                  </div>
                  <div className="col-span-12 sm:col-span-8">
                    <Skeleton variant="rounded" height={56} width="100%" />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <Skeleton variant="rounded" height={56} width="100%" />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <Skeleton variant="rounded" height={56} width="100%" />
                  </div>
                  <div className="col-span-12">
                    <Skeleton variant="rounded" height={100} width="100%" />
                  </div>
                  <div className="col-span-12">
                    <Skeleton variant="rounded" height={100} width="100%" />
                  </div>
                </div>
              </Box>
            ) : (
              // Se removió el Fade externo aquí para colocarlo individualmente dentro de cada return de renderContenidoPaso y evitar conflictos de renderizado condicional.
              renderContenidoPaso(pasoActivo)
            )}
          </Box>

          {/* BARRA DE ACCIONES */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              px: { xs: 3, md: 6 },
              py: 3,
              bgcolor: "#F8FAFC",
              borderTop: "1px solid #E2E8F0",
            }}
          >
            <Button
              disabled={pasoActivo === 0 || guardando || cargando}
              onClick={handleAtras}
              variant="outlined"
              sx={{
                borderRadius: "10px",
                px: 4,
                color: "#475569",
                borderColor: "#CBD5E1",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { bgcolor: "#F1F5F9", borderColor: "#94A3B8" },
              }}
            >
              Regresar
            </Button>

            {pasoActivo === pasos.length - 1 ? (
              <Button
                variant="contained"
                color="success"
                onClick={handleFinalizarConsulta}
                disabled={guardando}
              >
                {guardando ? "Finalizando..." : "Finalizar y Emitir Receta"}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSiguiente}
                disabled={guardando || cargando}
                startIcon={
                  guardando ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
                sx={{
                  bgcolor: "#0F766E",
                  borderRadius: "10px",
                  px: 4,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(15, 118, 110, 0.3)",
                  "&:hover": { bgcolor: "#0D9488" },
                }}
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
