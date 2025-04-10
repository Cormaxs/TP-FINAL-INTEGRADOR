import { Router } from "express";
import {verificarToken} from "../middleware/verificarToken.js"
import {traerTodosUsuarios, iniciarSesion } from "../controllers/userControllers.js"

export const cuenta = Router();


// Ruta principal
cuenta.get("/usuarios", traerTodosUsuarios);
  
cuenta.post("/login", iniciarSesion);

//ruta protegida, mantiene sesion activa
cuenta.post("/sesion", verificarToken, (req, res)=>{
    res.send("estas activo")
})

