import { Router } from "express";
import {verificarToken} from "../../middleware/token/verificarToken.js"
import {iniciarSesion, lagout, sesionActiva} from "../../controllers/autenticacion/authControllers.js"
import { verificarCuenta } from "../../controllers/autenticacion/correo/verificarCorreo.js";
import { recuperarPassword, cambiarContraseña } from "../../controllers/autenticacion/correo/recuperarContraseña.js";

export const autenticaciones = Router();
  
//inicio de seion
autenticaciones.post("/login", iniciarSesion);

//cierre de sesion, invalida el token y cambia de estado de sesion activa a false
autenticaciones.post("/lagout/:id", verificarToken, lagout)

//ruta protegida, mantiene sesion activa
autenticaciones.post("/sesion/:id", verificarToken, sesionActiva)

//verificar cuenta correo
autenticaciones.get("/correo/:id", verificarCuenta)

//recuperar contraseña, paso correo por body desde front
autenticaciones.post("/recuperarPassword", recuperarPassword)
//cambia la contraseña desde el frontend
autenticaciones.post("/actualizarPassword", cambiarContraseña)