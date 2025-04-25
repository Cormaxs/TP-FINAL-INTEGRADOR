import { User } from "../../models/fotografoModel.js";
import { coleccionErrores } from "../../middleware/manejoDeErrores/coleccion-errores.js";

export async function verificarCuentaServices(id) {
    const actualizar = await User.findByIdAndUpdate(id, { $set: { cuentaVerificada: true } })
    if (!actualizar.email) throw coleccionErrores.correoNoExiste()
    return actualizar
}

export async function existeCorreo(email) { 
    const existe = await User.findOne({ email });
    if (!existe) throw coleccionErrores.correoNoExiste();
    return existe;//cambio de true
}


export async function cambiarContraseñaServices(email, nuevaPassword) {
    const cambio = await User.findOneAndUpdate({ email }, { $set: { password: nuevaPassword } })
    if (!cambio) throw coleccionErrores.errUpdatePassword()
}

//activar mediante email
export async function estadoCuentaEmail(email, nuevoEstado) {
   
    try {
        const existeEmail = await User.findOneAndUpdate(
            { email: email },
            { $set: { estado: nuevoEstado } },
            { new: true }
        )
        console.log("email existe",existeEmail)
       return existeEmail
    } catch (err) {
        throw coleccionErrores.correoNoExiste(err)
    }

}


//activar mediante id
export async function estadoCuentaId(id, nuevoEstado) {
    try {
        const existeEmail = await User.findOneAndUpdate(
            { _id: id },
            { $set: { estado: nuevoEstado } },
            { new: true }
        )
       return existeEmail
    } catch (err) {
        throw coleccionErrores.correoNoExiste(err)
    }

}