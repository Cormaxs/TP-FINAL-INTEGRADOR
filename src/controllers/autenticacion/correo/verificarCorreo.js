import { mailOptions, transporter } from "./config-email.js";
import { verificarCuentaServices } from "../../../services/crud-user/verificarCuenta.js";
import { coleccionErrores } from "../../../middleware/manejoDeErrores/coleccion-errores.js";
import {html} from "./recuperarContraseña.js"

// Manda un correo para que verifique la cuenta
export async function verificarCorreo(datos, id) {
    try {
        const correo = datos.email;
        const asunto = "Verificar mi correo";
        const contenidoHTML = html(datos.nombre, id);
        const textoPlano = "Acá va el texto";

        await transporter.sendMail(
            mailOptions(correo, asunto, contenidoHTML, textoPlano)
        );
    } catch (err) {
        throw coleccionErrores.errEnvCorreo(err)
    }
}

 
//devuelve la activacion por correo
export async function verificarCuenta(req, res) {
    const { id } = req.params;
    await verificarCuentaServices(id)
    res.status(200).json({ message: "cuenta verificada" })
}


