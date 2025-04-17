// src/middlewares/validarUsuario.js
import { body, validationResult } from "express-validator";

export const validarUsuario = [
  body("email")
    .notEmpty().withMessage("El email es obligatorio")
    .isEmail().withMessage("El formato del email es inválido"),

  // Podés agregar más validaciones:
  body("nombre")
    .notEmpty().withMessage("El nombre es obligatorio"),

  body("password")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),

  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    next();
  }
];

//verifica los campos vacios y pasa los que no lo estan
export const datosActualizar = (req, res, next) => {
  const datos = req.body;
  const {rol} = req.usuario;

  const datosFiltrados = Object.fromEntries(
    Object.entries(datos).filter(
      ([clave, valor]) => valor !== "" && valor !== null && valor !== undefined
    )
  );

  if (Object.keys(datosFiltrados).length === 0) {
    return res.status(400).json({ message: "No se enviaron datos válidos para actualizar." });
  }
  //solo cuando ya sea admin dejo que cambie la casilla de admin
  if( datosFiltrados.rol === 'admin' && rol !== datosFiltrados.rol) return res.status(400).json({message: "No posee permisos de administrador"})

  req.body = datosFiltrados; // Reemplazamos por los datos limpios
  next(); // Pasamos al siguiente middleware o controlador
};
