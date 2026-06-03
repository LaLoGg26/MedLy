// frontend/src/api/axios.js
import axios from "axios";

const clienteAxios = axios.create({
  // La URL base de tu backend
  baseURL: "http://localhost:3000/api",
});

export default clienteAxios;
