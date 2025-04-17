import { Router } from "express";
import {verificarToken} from "../../middleware/verificarToken.js"
import {iniciarSesion } from "../../controllers/autenticacion/authControllers.js"

export const autenticaciones = Router();
  
//inicio de seion
autenticaciones.post("/login", iniciarSesion);


//cierre de sesion, invalida el token y cambia de estado de sesion activa a false
autenticaciones.post("/lagout", verificarToken, (req, res)=>{
    res.send("cerrado")
})

//ruta protegida, mantiene sesion activa
autenticaciones.post("/sesion", verificarToken, (req, res)=>{
    res.send("estas activo")
})