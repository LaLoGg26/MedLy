// frontend/src/hooks/useAutoLogout.js
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const useAutoLogout = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const cerrarSesion = () => {
    localStorage.removeItem("token"); // Borramos el pase de acceso
    console.log("Sesión cerrada por inactividad.");
    navigate("/login");
  };

  const reiniciarTemporizador = () => {
    // Si ya había un temporizador corriendo, lo cancelamos
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Iniciamos uno nuevo por 5 minutos (300,000 ms)
    timeoutRef.current = setTimeout(cerrarSesion, 300000);

    // NOTA PARA PRUEBAS: Si quieres probarlo rápido sin esperar 5 minutos,
    // cambia el 300000 por 5000 (5 segundos).
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return; // Si no hay token, no hacemos nada

    try {
      const decodificado = jwtDecode(token);

      // La regla de oro: Esto SOLO aplica para Pacientes (rol 3)
      if (decodificado.rol !== 3) return;

      // Lista de eventos que consideramos "actividad"
      const eventosActividad = [
        "mousemove",
        "keydown",
        "mousedown",
        "scroll",
        "touchstart",
      ];

      // Agregamos los "escuchadores" a la ventana completa
      eventosActividad.forEach((evento) =>
        window.addEventListener(evento, reiniciarTemporizador),
      );

      // Iniciamos el contador la primera vez que entra
      reiniciarTemporizador();

      // Función de limpieza: Se ejecuta cuando el usuario sale del componente
      return () => {
        eventosActividad.forEach((evento) =>
          window.removeEventListener(evento, reiniciarTemporizador),
        );
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      cerrarSesion(); // Si el token está corrupto, lo sacamos por seguridad
    }
  }, [navigate]);
};

export default useAutoLogout;
