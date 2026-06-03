// frontend/src/pages/Login.jsx
import { useState, useRef } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha"; // Importamos el CAPTCHA

// Íconos
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const navigate = useNavigate();
  const captchaRef = useRef(null); // Referencia para manejar el CAPTCHA

  const [credenciales, setCredenciales] = useState({
    correo: "",
    contrasena: "",
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [captchaValido, setCaptchaValido] = useState(false); // Estado para habilitar el botón

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (token) => {
    // Si token existe, el usuario pasó la prueba
    if (token) {
      setCaptchaValido(true);
    } else {
      // Si el token expira o falla
      setCaptchaValido(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Obtenemos el token generado por Google para enviarlo al backend (más adelante)
    //const captchaToken = captchaRef.current.getValue();

    console.log("Intentando iniciar sesión con:", credenciales);
    //console.log("Token de CAPTCHA:", captchaToken);
    navigate("/dashboard");
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
          {/* LOGO Y TÍTULO */}
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

          {/* FORMULARIO */}
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

            {/* CONTENEDOR DEL CAPTCHA */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <ReCAPTCHA
                ref={captchaRef}
                // Clave de prueba oficial de Google (siempre aprueba para desarrollo)
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={handleCaptchaChange}
              />
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={!captchaValido} // Se bloquea si no hay CAPTCHA
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* FOOTER */}
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
