import { encriptarPassword } from "../../utils/bcrypt.js"
import { crearUserServices, buscarUserId, modificarUserId, eliminarUserId } from "../../services/crud-user/crudServices.js"
import { CustomError } from "../../utils/crearError.js";

export async function crearUsuario(req, res) {
    try {
        const datos = req.body;
        const { password } = datos;
     
        datos.password = await encriptarPassword(password);
        
        const resultado = await crearUserServices(datos);
        if (resultado) {
            return res.status(201).json({message: "usuario creado correctamente"});
        }
        return res.status(300).json({message: "El correo o numero de telefono ya estan en uso"})

    } catch (error) {
        // Respondemos con un error genérico para el cliente
        throw new CustomError(500, "Error interno al crear el usuario");
    }
}

//me llegan solo los campos llenos
export async function modificarUsuario(req, res) {
    const data = req.body;
    const { id } = req.params;
    try {
        if (data.password) {
            data.password = await encriptarPassword(data.password);
        }
        const guardado = await modificarUserId(data, id)
        if (guardado) {
            return res.status(201).send({ message: "Datos actualizados correctamente: ", guardado});
        } return res.status(400).send({ message: "Datos no guardados, intente nuevamente" })
    } catch (err) {
        return CustomError(500, "Error del servidor", err)
    }
}

export async function traerUsuario(req, res) {
    try {
        const { id } = req.params;
        const usuario = await buscarUserId(id);
        if (usuario) {
            return res.status(200).json({ mensaje: "Usuario encontrado", usuario});
        }
        return res.status(404).json({message: "Usuario no encontrado"});
    } catch (err) {
        throw CustomError(500, "error del servidor")
    }
}

export async function eliminarUsuario(req, res) {
    const { id } = req.params;
    try {
        const eliminado = await eliminarUserId(id);
        if (eliminado) {
            return res.status(201).send({ message: `usuario eliminado correctamente` });
        } 
        return res.status(400).send({ message: "Problemas al eliminar usuario" })
    } catch (err) {
        throw CustomError(500, "Error al eliminar el usuario", err)
    }
}