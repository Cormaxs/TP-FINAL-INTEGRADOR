import { User } from "../../models/fotografoModel.js";

export async function verificarCuentaServices(id){
        try{
            const actualizar = await User.findByIdAndUpdate(id, {$set: {cuentaVerificada: true}})
            return actualizar
        }catch(err){
            console.error(err)
        }
}