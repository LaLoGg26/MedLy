// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardPaciente from "./pages/DashboardPaciente";
// import Register from './pages/Register'; // Descomenta esto cuando crees el archivo Register.jsx

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline normaliza los estilos del navegador y aplica el color de fondo de nuestro tema */}
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}

          {/* Redirigir cualquier ruta desconocida al login por ahora */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardPaciente />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
