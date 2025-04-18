import { User } from "../../models/fotografoModel.js"
import { coleccionErrores } from "../../middleware/manejoDeErrores/coleccion-errores.js";

export async function crearUserServices(datos) {
    const {email, numeroCelular} = datos;
    try { 
        const existentes = await User.findOne({
            $or:[
            {email: email},
           { numeroCelular: numeroCelular}
        ]
        });
        if(existentes) return false;
        
        const usuario = new User(datos);
        const usuarioGuardado = await usuario.save();
        return usuarioGuardado;
    } catch (error) {
       throw coleccionErrores.errorCrearUser(error) 
    }
}

export async function buscarUserId(id) {
    try {
        const usuario = await User.findOne({_id:id})
        .select('-password -email ');
        return usuario; // puede ser null si no existe
    } catch (err) {
        throw coleccionErrores.idNoEncontrado(id) 
    }
}

export async function modificarUserId(data, id) {
    try {
        const userActualizado = await User.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true } // <- devuelve el documento actualizado
          )
          .select('-password -email __v');
        if (userActualizado) return userActualizado;
        return false;
    } catch (err) {
        throw coleccionErrores.errUpdateDates(err)
    }
}

export async function eliminarUserId(id) {
    try {
        const eliminado = await User.findByIdAndDelete({ _id: id })
        if (eliminado) {
            return eliminado;
        } return false
    } catch (err) {
        throw coleccionErrores.errDeleteUser(err)
    }
}