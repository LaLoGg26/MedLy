// frontend/src/api/axios.js
import axios from "axios";

const clienteAxios = axios.create({
  baseURL: "http://localhost:3000/api",
});

// NUEVO: Interceptor de solicitudes
clienteAxios.interceptors.request.use(
  (config) => {
    // Buscamos el token en el navegador
    const token = localStorage.getItem("token");

    // Si existe, lo agregamos a las cabeceras de la petición
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default clienteAxios;
