import { encriptarPassword } from "../utils/bcrypt.js"
import { crearUserServices, buscarUserId, modificarUserId, eliminarUserId } from "../services/crudServices.js"


export async function crearUsuario(req, res) {
    try {
        const datos = req.body;
        const { password } = datos;
        datos.password = await encriptarPassword(password);
        const resultado = await crearUserServices(datos);
        if (resultado) {
            return res.status(201).send("Datos guardados y usuario creado");
        }
        return res.send("No se pudo guardar el usuario");

    } catch (error) {
        console.error("Error en crearUsuario:", error.message);

        // Respondemos con un error genérico para el cliente
        res.status(500).send("Error interno del servidor");
    }
}

export async function modificarUsuario(req, res) {
    const data = req.body;
    const { id } = req.params;

    try {
        if (data.password) {
            data.password = await encriptarPassword(data.password);
        }
        const guardado = await modificarUserId(data, id)//actualiza solo los datos que no esten vacios
        if (guardado) {
            return res.status(201).send({ message: "Datos actualizados correctamente: ", data });
        } return res.status(400).send({ message: "Datos no guardados, intente nuevamente" })
    } catch (err) {
        return res.status(500).send({ message: "Error del servidor" });
    }
}

export async function traerUsuario(req, res) {
    try {
        const { id } = req.params;
        const usuario = await buscarUserId(id);
        if (usuario) {
            return res.json({
                mensaje: "Usuario encontrado",
                usuario
            });
        }

        return res.status(404).json({ mensaje: "Usuario no encontrado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error del servidor" });
    }
}



export async function eliminarUsuario(req, res) {

    const { id } = req.params;
    try {
        const eliminado = await eliminarUserId(id);
        if (eliminado) {
            return res.status(201).send({ message: `usuario eliminado correctamente` });
        } return res.status(400).send({ message: "Problemas al eliminar usuario" })
    } catch (err) {
        console.err("error de controller", err)
    }
}