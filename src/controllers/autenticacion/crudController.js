import { encriptarPassword } from "../../utils/bcrypt.js"
import { crearUserServices, buscarUserId, modificarUserId, eliminarUserId } from "../../services/crud-user/crudServices.js"
import { eliminarUsuarioCarpeta } from "../manejo-imagenes/crud-imagenes.js";
import { verificarCorreo } from "./correo/verificarCorreo.js";

export async function crearUsuario(req, res) {

    const datos = req.body;
    const { password } = datos;
    datos.password = await encriptarPassword(password);
    const resultado = await crearUserServices(datos);

    if (resultado) {
        verificarCorreo(datos, resultado.id)
        return res.status(201).json({ message: "usuario creado correctamente" });
    }
    return res.status(300).json({ message: `El correo ${datos.email} ya esta en uso` })
}


//me llegan solo los campos llenos
export async function modificarUsuario(req, res) {
    const data = req.body;
    const { id } = req.params;
    if (data.password) data.password = await encriptarPassword(data.password);
    const guardado = await modificarUserId(data, id)
    if (guardado) return res.status(201).send({ message: "Datos actualizados correctamente: ", guardado });
    return res.status(400).send({ message: "Datos no guardados, intente nuevamente" })
}

export async function traerUsuario(req, res) {
    const { id } = req.params;
    const usuario = await buscarUserId(id);
    if (usuario) {
        return res.status(200).json({ mensaje: "Usuario encontrado", usuario });
    }
    return res.status(404).json({ message: "Usuario no encontrado" });
}

export async function eliminarUsuario(req, res) {
    const { id } = req.params;
    const datos = req.body;
        const eliminado = await eliminarUserId(id);
        if (eliminado) {
            //eliminar carpeta de usuario
            await eliminarUsuarioCarpeta(id)
            return res.status(201).send({ message: `usuario eliminado correctamente` });
        }
        return res.status(400).send({ message: "Problemas al eliminar usuario" })
}