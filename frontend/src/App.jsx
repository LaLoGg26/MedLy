// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Verificar from "./pages/Verificar";
import DashboardPaciente from "./pages/DashboardPaciente";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardAdmin from "./pages/DashboardAdmin";
import CompletarPerfil from "./pages/CompletarPerfil";
import NuevoMedico from "./pages/NuevoMedico";

// NUEVO: Importamos el Dashboard del Doctor
import DashboardDoctor from "./pages/DashboardDoctor";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* RUTAS PÚBLICAS (Cualquiera puede entrar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verificar" element={<Verificar />} />

          {/* RUTAS PRIVADAS - ADMIN (Rol 1) */}
          <Route element={<ProtectedRoute rolRequerido={1} />}>
            <Route path="/admin" element={<DashboardAdmin />} />
            <Route path="/admin/nuevo-medico" element={<NuevoMedico />} />
          </Route>

          {/* NUEVO: RUTAS PRIVADAS - DOCTOR (Rol 2) */}
          <Route element={<ProtectedRoute rolRequerido={2} />}>
            <Route path="/doctor" element={<DashboardDoctor />} />
          </Route>

          {/* RUTAS PRIVADAS - PACIENTE (Rol 3) */}
          <Route element={<ProtectedRoute rolRequerido={3} />}>
            <Route path="/dashboard" element={<DashboardPaciente />} />
            <Route path="/completar-perfil" element={<CompletarPerfil />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
