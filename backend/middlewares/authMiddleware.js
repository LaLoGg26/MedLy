// backend/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  // 1. Obtener el token del encabezado (header) de la petición
  const authHeader = req.header("Authorization");

  // 2. Si no hay token, rechazamos la petición
  if (!authHeader) {
    return res
      .status(401)
      .json({ mensaje: "Acceso denegado. No se proporcionó un token." });
  }

  try {
    // Los tokens suelen enviarse en el formato: "Bearer eyJhbGciOi..."
    // Extraemos solo la parte del token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    // 3. Verificar si el token es real y no ha expirado
    const verificado = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Guardamos los datos del usuario (id, rol) dentro de la petición
    // para que el siguiente controlador sepa quién hizo la petición
    req.usuario = verificado;

    // 5. Todo está en orden, permitimos que siga su camino
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token inválido o expirado." });
  }
};

// EXTRA: Middleware para verificar roles (súper útil para doctores vs pacientes)
export const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: "Acceso denegado. No tienes permisos para esta acción.",
      });
    }
    next();
  };
};
