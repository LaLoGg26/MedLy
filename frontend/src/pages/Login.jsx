// frontend/src/pages/Login.jsx
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
import ReCAPTCHA from "react-google-recaptcha";
import clienteAxios from "../api/axios"; // NUEVO: Importamos Axios

// Íconos
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const navigate = useNavigate();
  // const captchaRef = useRef(null); // Descomenta si vas a usar el CAPTCHA activo

  const [credenciales, setCredenciales] = useState({
    correo: "",
    contrasena: "",
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState(""); // Estado para errores
  const [cargando, setCargando] = useState(false);

  // Por ahora dejamos el captcha como válido siempre para facilitar pruebas
  // Cuando lo actives, cámbialo a false
  const [captchaValido, setCaptchaValido] = useState(true);

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    setError(""); // Limpia el error al escribir
  };

  const handleCaptchaChange = (token) => {
    if (token) setCaptchaValido(true);
    else setCaptchaValido(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setCargando(true);
      const respuesta = await clienteAxios.post("/auth/login", credenciales);

      localStorage.setItem("token", respuesta.data.token);

      // FORZAMOS LA CONVERSIÓN A NÚMERO
      const rol = Number(respuesta.data.usuario.rol);
      const perfilCompletado = respuesta.data.perfil_completado;

      if (rol === 1) {
        navigate("/admin");
      } else if (rol === 2) {
        navigate("/doctor");
      } else {
        if (!perfilCompletado) {
          navigate("/completar-perfil");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error en login:", error);

      if (error.response?.data?.requiere_verificacion) {
        navigate("/verificar", { state: { correo: credenciales.correo } });
      } else {
        setError(
          error.response?.data?.mensaje || "Error al conectar con el servidor.",
        );
      }
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
      }}
    >
      <Card sx={{ maxWidth: 420, width: "100%", p: { xs: 2, sm: 4 } }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.light",
                color: "white",
                p: 1.5,
                borderRadius: "50%",
                display: "flex",
                mb: 2,
                boxShadow: "0px 4px 15px rgba(190, 132, 199, 0.4)",
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
              MedLy
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Tu salud, conectada
            </Typography>
          </Box>

          {/* NUEVO: Alerta de Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
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
              value={credenciales.correo}
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
              value={credenciales.contrasena}
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

            <Box
              sx={{ display: "flex", justifyContent: "flex-end", mt: 1, mb: 2 }}
            >
              <Link
                component="button"
                variant="caption"
                color="text.secondary"
                underline="hover"
                onClick={(e) => e.preventDefault()}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>

            {/* <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <ReCAPTCHA
                ref={captchaRef}
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" 
                onChange={handleCaptchaChange}
              />
            </Box> */}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={!captchaValido || cargando}
            >
              {cargando ? "Iniciando..." : "Iniciar Sesión"}
            </Button>
          </form>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              ¿No tienes una cuenta?{" "}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/register")}
                color="secondary.dark"
                fontWeight="bold"
                underline="hover"
              >
                Regístrate ahora
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
