import { Router } from "express";
import {validarUsuario} from "../middleware/userMiddleware.js"
import {verificarToken} from "../middleware/verificarToken.js"
import { crearUsuario, buscarUsuario, traerTodosUsuarios, iniciarSesion } from "../controllers/userControllers.js"

const router = Router();

// Ruta principal
router.get("/users", traerTodosUsuarios);


router.get("/user/:id", buscarUsuario);
  
router.post("/user/login", iniciarSesion);

router.post("/user",validarUsuario, crearUsuario)

//ruta protegida, mantiene sesion activa
router.post("/user/sesion", verificarToken, (req, res)=>{
    res.send("estas activo")
})

export default router;
