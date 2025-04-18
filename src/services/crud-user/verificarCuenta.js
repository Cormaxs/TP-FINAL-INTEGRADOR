import { User } from "../../models/fotografoModel.js";
import { coleccionErrores } from "../../middleware/manejoDeErrores/coleccion-errores.js";

export async function verificarCuentaServices(id){
            const actualizar = await User.findByIdAndUpdate(id, {$set: {cuentaVerificada: true}})
            if(!actualizar.email) throw coleccionErrores.correoNoExiste()
            return actualizar      
}

export async function existeCorreo(email) {
    const existe = await User.findOne({ email });
    if (!existe) throw coleccionErrores.correoNoExiste();
    return true; 
}


export async function cambiarContraseñaServices(email, nuevaPassword){
    const cambio= await User.findOneAndUpdate({email}, {$set: {password: nuevaPassword}})
    if(!cambio) throw coleccionErrores.errUpdatePassword()
}