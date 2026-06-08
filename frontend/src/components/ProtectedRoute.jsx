// frontend/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ rolRequerido }) => {
  const token = localStorage.getItem("token");

  // 1. Si no hay token en absoluto, lo mandamos al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // 2. Decodificamos el token para saber quién es
    const decodificado = jwtDecode(token);

    // 3. Verificamos si el token ya expiró (la fecha de expiración 'exp' viene en segundos)
    const tiempoActual = Date.now() / 1000;
    if (decodificado.exp < tiempoActual) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    // 4. Si la ruta exige un rol específico y el usuario no lo tiene, lo rechazamos
    if (rolRequerido && decodificado.rol !== rolRequerido) {
      console.warn("Acceso denegado: Rol incorrecto");
      return <Navigate to="/login" replace />;
    }

    // 5. Si pasa todas las pruebas, renderizamos la vista que solicitó (Outlet)
    return <Outlet />;
  } catch (error) {
    // Si alguien intentó alterar el token manualmente y lo corrompió
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
