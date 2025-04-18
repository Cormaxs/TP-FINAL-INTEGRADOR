
import { CustomError } from "../../utils/crearError.js";

//centralizar todos los errores
export const coleccionErrores = {
  conflictoUsuario: () => new CustomError(409, "El correo o número de teléfono ya están en uso"),

  idNoEncontrado: (id ) => new CustomError(404, `${id} no encontrado`), 
  
  errorCrearUser: (error) => new CustomError(408, "No se pudo crear la cuenta, intente mas tarde", error),

  failHash : (error) => new CustomError(500, "Error al hashear contraseña", error),

  compareHashError: (error)=> new CustomError(401, "Contraseña incorrecta", error),

  errUpdateDates: (error) => new CustomError(409, "Error al actualizar los datos", error),

  errDeleteUser: (error) => new CustomError(404, "No autorizado para eliminar usuarios", error),

  errorBusqueda: (error) => new CustomError(406, "campos no validos", error),

  correoNoExiste: (error) => new CustomError(404, "El correo no existe", error),

  errUpdatePassword: (error) => new CustomError(405, "Cuenta inexistente, no se pudo actualizar password", error),

  errEnvCorreo:(error) => new CustomError("Error al enviar correo en el servidor", error),
  
}

