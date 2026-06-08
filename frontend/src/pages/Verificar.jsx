// frontend/src/pages/Verificar.jsx
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import clienteAxios from "../api/axios";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";

const Verificar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Rescatamos el correo si venimos de la pantalla de registro
  const correoInicial = location.state?.correo || "";

  const [datos, setDatos] = useState({ correo: correoInicial, codigo: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setCargando(true);
      const respuesta = await clienteAxios.post("/auth/verificar", datos);

      // Guardamos el token en localStorage para mantener la sesión activa
      localStorage.setItem("token", respuesta.data.token);

      // CAMBIO AQUÍ: Como es una cuenta nueva (Paciente), lo mandamos
      // directo a llenar sus datos obligatorios en lugar del dashboard.
      navigate("/completar-perfil");
    } catch (error) {
      console.error("Error al verificar:", error);
      setError(error.response?.data?.mensaje || "Código inválido o expirado.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #F8FAFC 0%, #E0F7F7 100%)",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", p: { xs: 2, sm: 4 } }}>
        <CardContent sx={{ p: 0, textAlign: "center" }}>
          <Box
            sx={{
              bgcolor: "primary.light",
              color: "white",
              p: 2,
              borderRadius: "50%",
              display: "inline-flex",
              mb: 3,
              boxShadow: "0px 4px 15px rgba(190, 132, 199, 0.4)",
            }}
          >
            <MarkEmailReadOutlinedIcon fontSize="large" />
          </Box>

          <Typography
            variant="h5"
            color="primary.main"
            fontWeight="800"
            gutterBottom
          >
            Verifica tu correo
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Hemos enviado un código de 6 dígitos a tu bandeja de entrada.
            Introdúcelo a continuación.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="correo"
              type="email"
              variant="outlined"
              margin="normal"
              value={datos.correo}
              onChange={handleChange}
              required
              disabled={!!correoInicial} // Lo bloqueamos si ya viene del registro
            />

            <TextField
              fullWidth
              label="Código de 6 dígitos"
              name="codigo"
              type="text"
              variant="outlined"
              margin="normal"
              value={datos.codigo}
              onChange={handleChange}
              required
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: "center",
                  letterSpacing: "0.5em",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                },
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={cargando || datos.codigo.length < 6}
              sx={{ mt: 3 }}
            >
              {cargando ? "Verificando..." : "Activar Cuenta"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Verificar;
