// frontend/src/theme/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#BE84C7", // Lila principal
      light: "#C0A5C7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#A9E6E6", // Turquesa
      light: "#A3EEEE",
      dark: "#9CF6F6",
      contrastText: "#2D3748",
    },
    background: {
      default: "#F8FAFC", // Un gris/azulado ultra claro, más limpio
      paper: "#ffffff",
    },
    text: {
      primary: "#2D3748", // Un gris oscuro más suave que el negro puro
      secondary: "#718096",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "1rem",
    },
  },
  shape: {
    borderRadius: 16, // Bordes más redondeados (estilo Apple/Moderno)
  },
  components: {
    // Personalizamos las tarjetas
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 10px 40px rgba(190, 132, 199, 0.12)", // Sombra difuminada usando el lila
          borderRadius: 24, // Tarjeta súper redondeada
        },
      },
    },
    // Personalizamos los campos de texto
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#FAFBFC", // Nuestro fondo limpio
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#C0A5C7",
          },
        },
        // NUEVO: Bloqueamos los estilos invasivos del navegador
        input: {
          color: "#2D3748", // Forzamos a que el texto escrito siempre sea oscuro
          "&:-webkit-autofill": {
            WebkitBoxShadow: "0 0 0 1000px #FAFBFC inset", // Mantiene nuestro fondo
            WebkitTextFillColor: "#2D3748", // Mantiene nuestra letra oscura
            transition: "background-color 5000s ease-in-out 0s", // Truco extra anti-parpadeo
          },
        },
      },
    },
    // Personalizamos los labels
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.95rem",
          color: "#4A5568", // Gris un poco más oscuro y sólido para que no se pierda
          fontWeight: 500,
          "&.Mui-focused": {
            color: "#BE84C7", // Lila al hacer clic
            fontWeight: 600,
          },
        },
      },
    },
    // Personalizamos el botón
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "12px 24px",
          boxShadow: "none", // Botón plano por defecto
          "&:hover": {
            boxShadow: "0px 6px 20px rgba(190, 132, 199, 0.3)", // Sombra lila al hacer hover
            backgroundColor: "#C0A5C7",
          },
        },
      },
    },
  },
});

export default theme;
