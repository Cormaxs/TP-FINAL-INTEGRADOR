import { Router } from "express";
import {validarUsuario,datosActualizar} from "../../middleware/validar-campos/userMiddleware.js"
import { crearUsuario, traerUsuario,modificarUsuario, eliminarUsuario} from "../../controllers/autenticacion/crudController.js"
import { verificarToken, verificarRol, verificarAdmin } from "../../middleware/token/verificarToken.js";
export const userRoutes = Router();


//crear user
userRoutes.post("/register",validarUsuario, crearUsuario)

//modificar usuario 
userRoutes.put("/modificar/:id",verificarToken, verificarRol(['client', 'photographer', 'admin']), datosActualizar, modificarUsuario )

//traer usuario -> pasar a publico
userRoutes.get("/:id", traerUsuario);

//eliminar usuario
userRoutes.delete("/eliminar/:id",verificarToken, verificarRol(['client', 'photographer', 'admin']), eliminarUsuario)




//eliminar usuario siendo admin
userRoutes.delete("/eliminar/adm/:id",verificarToken,verificarAdmin, eliminarUsuario)

