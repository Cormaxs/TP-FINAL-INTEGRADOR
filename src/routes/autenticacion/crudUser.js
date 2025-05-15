import { Router } from "express";
import {validarUsuario,datosActualizar} from "../../middleware/validar-campos/userMiddleware.js"
import { crearUsuario, traerUsuario,modificarUsuario, eliminarUsuario} from "../../controllers/autenticacion/crudController.js"
import { verificarToken } from "../../middleware/token/verificarToken.js";
export const userRoutes = Router();



userRoutes.post("/register",validarUsuario, crearUsuario)


userRoutes.put("/modificar/:id",verificarToken, datosActualizar, modificarUsuario )


userRoutes.get("/:id", traerUsuario);


userRoutes.delete("/eliminar/:id",verificarToken, eliminarUsuario)



