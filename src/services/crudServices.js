import { User } from "../models/userModels.js"


export async function crearUserServices(datos) {
    try {
        const usuario = new User(datos);
        const usuarioGuardado = await usuario.save();
        return usuarioGuardado;
    } catch (error) {
        console.error("Error al guardar el usuario:", error.message);
        throw new Error("No se pudo guardar el usuario");
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
        console.error("Error al buscar usuario por ID:", err.message);
        throw err; // relanzamos para que el controller lo pueda manejar
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
        console.error(err)
    }
}

export async function eliminarUserId(id) {
    try {
        const eliminado = await User.deleteOne({ _id: id })
        if (eliminado) {
            return true;
        } return false;
    } catch (err) {
        console.error("error de services", err)
    }
}