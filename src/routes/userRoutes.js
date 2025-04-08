import { Router } from "express";
import {validarUsuario} from "../middleware/userMiddleware.js"
import { crearUsuario, buscarUsuario, traerTodosUsuarios } from "../controllers/userControllers.js"

const router = Router();

// Ruta principal
router.get("/users", traerTodosUsuarios);


router.get("/user/:id", buscarUsuario);
  


router.post("/user",validarUsuario, crearUsuario)

export default router;
