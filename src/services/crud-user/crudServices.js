import { User } from "../../models/fotografoModel.js"
import {CustomError} from "../../utils/crearError.js"

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
       throw new CustomError(300, "error interno del servidor", error)
    }
}

export async function buscarUserId(id) {
    try {
        const usuario = await User.findById(id)
        .select('-password')
        .select('-email')
        .select('-__v');
        return usuario; // puede ser null si no existe
    } catch (err) {
        throw new CustomError(404, "Error al buscar usuario por ID:"); // relanzamos para que el controller lo pueda manejar
    }
}

export async function modificarUserId(data, id) {
    try {
        const userActualizado = await User.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true } // <- devuelve el documento actualizado
          )
          .select('-password')
          .select('-email')
          .select('-__v');
        if (userActualizado) {
            return userActualizado;
        } return false;
    } catch (err) {
        throw new CustomError(500, "error al actualizar los datos")
    }
}

export async function eliminarUserId(id) {
    try {
        const eliminado = await User.findByIdAndDelete({ _id: id })
        if (eliminado) {
            return eliminado;
        } return false
    } catch (err) {
        throw new CustomError(500, "error al eliminar usuario")
    }
}