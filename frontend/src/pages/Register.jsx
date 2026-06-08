// frontend/src/pages/Register.jsx
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios"; // Nuestra configuración de Axios

// Íconos
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Register = () => {
  const navigate = useNavigate();
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Eliminamos "rol" del estado principal, lo enviaremos directamente en la petición
  const [datos, setDatos] = useState({
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const [error, setError] = useState(""); // Para mostrar errores del backend
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
    setError(""); // Limpiar el error cuando el usuario empiece a escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(datos.contrasena)) {
      setError(
        "La contraseña debe tener mínimo 8 caracteres, e incluir al menos una mayúscula, una minúscula y un número.",
      );
      return;
    }

    // 2. Validar que ambas contraseñas coincidan
    if (datos.contrasena !== datos.confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setCargando(true);
      const respuesta = await clienteAxios.post("/auth/register", {
        correo: datos.correo,
        contrasena: datos.contrasena,
        rol: 3,
      });

      console.log("Registro exitoso:", respuesta.data);
      navigate("/verificar", { state: { correo: datos.correo } });
    } catch (error) {
      console.error("Error en registro:", error);
      setError(
        error.response?.data?.mensaje ||
          "Hubo un error al registrar el usuario",
      );
    } finally {
      setCargando(false);
    }
  };

  const handleClickShowPassword = () => setMostrarPassword((show) => !show);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #F8FAFC 0%, #E0F7F7 100%)",
        p: 2,
        py: 4,
      }}
    >
      <Card sx={{ maxWidth: 450, width: "100%", p: { xs: 2, sm: 4 } }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                bgcolor: "secondary.main",
                color: "secondary.contrastText",
                p: 1.5,
                borderRadius: "50%",
                display: "flex",
                mb: 2,
                boxShadow: "0px 4px 15px rgba(169, 230, 230, 0.5)",
              }}
            >
              <MedicalServicesIcon fontSize="large" />
            </Box>
            <Typography
              variant="h4"
              color="primary.main"
              fontWeight="800"
              letterSpacing={1}
            >
              Crear Cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Portal exclusivo para Pacientes
            </Typography>
          </Box>

          {/* Mostrar mensaje de error si existe */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="contrasena"
              type={mostrarPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={datos.contrasena}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {mostrarPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirmar Contraseña"
              name="confirmarContrasena"
              type={mostrarPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={datos.confirmarContrasena}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={cargando} // Deshabilitar mientras procesa
              sx={{ mt: 4, mb: 2 }}
            >
              {cargando ? "Registrando..." : "Registrarme"}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              ¿Ya tienes una cuenta?{" "}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/login")}
                color="secondary.dark"
                fontWeight="bold"
                underline="hover"
              >
                Inicia sesión aquí
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
