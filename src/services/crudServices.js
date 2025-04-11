import { User } from "../models/userModel.js"
import {CustomError} from "../utils/crearError.js"

export async function crearUserServices(datos) {
    const {email} = datos;
    try { 
        const emailExiste = await User.findOne({email});
        if(emailExiste){
            throw new CustomError(409, "El email ya está registrado"); // ✅ Detenemos el proceso
        }
        const usuario = new User(datos);
        const usuarioGuardado = await usuario.save();
        return usuarioGuardado;
    } catch (error) {
        console.error(err)
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
        const userActualizado = await User.updateOne(
            //busqueda
            { _id: id },
            //datos actualizar
            { $set: data }
        );
        if (userActualizado) {
            return true;
        } return false;
    } catch (err) {
        throw new CustomError(500, "error al actualizar los datos")
    }
}

export async function eliminarUserId(id) {
    try {
        const eliminado = await User.deleteOne({ _id: id })
        if (eliminado) {
            return true;
        } return false;
    } catch (err) {
        throw new CustomError(500, "error al eliminar usuario")
    }
}