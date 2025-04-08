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
