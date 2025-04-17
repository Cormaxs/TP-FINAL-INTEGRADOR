import { Router } from "express";
import {validarUsuario,datosActualizar} from "../../middleware/validar-campos/userMiddleware.js"
import { crearUsuario, traerUsuario,modificarUsuario, eliminarUsuario} from "../../controllers/autenticacion/crudController.js"
import { verificarToken } from "../../middleware/verificarToken.js";
export const userRoutes = Router();


//crear user
userRoutes.post("/register",validarUsuario, crearUsuario)

//modificar usuario 
userRoutes.put("/modificar/:id", datosActualizar, modificarUsuario )

//traer usuario
userRoutes.get("/:id", traerUsuario);

//eliminar usuario
userRoutes.delete("/eliminar/:id", eliminarUsuario)




