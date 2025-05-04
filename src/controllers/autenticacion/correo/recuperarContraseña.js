//mandar link para recuperar contraseña
import { mailOptions, transporter } from "./config-email.js";
import { existeCorreo } from "../../../services/crud-user/verificarCuenta.js";
import { encriptarPassword } from "../../../utils/bcrypt.js";
import { cambiarContraseñaServices } from "../../../services/crud-user/verificarCuenta.js";

//manda mensaje al correo pasado con el link para recuperar contraseña
export async function recuperarPassword(req, res) {
    const { email } = req.body;
    await existeCorreo(email);
    const info = await transporter.sendMail(mailOptions(
        email,
        "recuperar contraseña",
        html(" ", " ", "recuperar contraseña"),
        "gracias por elegirnos"
    ));
    if (info) return res.status(200).json({ mensaje: "Correo enviado correctamente" });
    res.status(400).json({ message: "El correo no existe o no esta registrado" })
}


export async function cambiarContraseña(req, res) {
    const { email, password } = req.body;
    const hashear = await encriptarPassword(password);
    await cambiarContraseñaServices(email, hashear);
    return res.status(200).json({ message: "contraseña cambiada con exito" })
}


 












export function html(nombre, id, tema) {
    const esRecuperar = tema === "recuperar contraseña";
    const link = esRecuperar
        ? `https://fotografoscatamarca.com/update-password`
        : `${process.env.BASE_URL}/auth/correo/${id}`;

    const botonTexto = esRecuperar ? "Restablecer contraseña" : "Verificar mi correo";
    const mensajePrincipal = esRecuperar
        ? `Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no hiciste esta solicitud, puedes ignorar este correo.`
        : `Gracias por crear una cuenta con nosotros. Estamos emocionados de tenerte a bordo. Para comenzar a usar tu cuenta, por favor verifica tu dirección de correo electrónico.`;

    const textoAlternativo = esRecuperar
        ? "Si el botón no funciona, copia y pega este enlace en tu navegador:"
        : "O copia y pega este enlace en tu navegador:";

    const añoActual = new Date().getFullYear();

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${esRecuperar ? "Restablece tu contraseña" : "Verifica tu cuenta"}</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; padding: 20px 0;">
                <h1 style="color: #3b82f6; font-size: 24px; font-weight: bold;">
                    ${esRecuperar ? "Restablecer contraseña" : "Bienvenido a fotografoscatamarca"}
                </h1>
            </div>

            <div style="padding: 30px 20px;">
                <p style="color: #4b5563; margin-bottom: 20px; line-height: 1.6;">
                    ¡Hola ${nombre}!<br><br>
                    ${mensajePrincipal}
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${link}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                        ${botonTexto}
                    </a>
                </div>

                <p style="color: #6b7280; text-align: center; font-size: 14px;">
                    ${textoAlternativo}<br>
                    <span style="color: #3b82f6; word-break: break-all;">${link}</span>
                </p>

                <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 30px;">
                    <h3 style="color: #374151; font-size: 16px; font-weight: bold; margin-bottom: 10px;">Detalles de tu cuenta:</h3>
                    <ul style="color: #4b5563; padding-left: 20px; margin: 0;">
                        <li style="margin-bottom: 8px;">Nombre de usuario: ${nombre}</li>
                        <li style="margin-bottom: 8px;">Fecha: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</li>
                        <li>${esRecuperar ? "Si no solicitaste el cambio de contraseña, ignora este correo." : "Si no creaste esta cuenta, por favor ignora este correo."}</li>
                    </ul>
                </div>
            </div>

            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 14px;">
                <p>© ${añoActual} fotografoscatamarca. Todos los derechos reservados.</p>
                <p style="margin-top: 10px;">
                    <a href="[URL_PRIVACIDAD]" style="color: #3b82f6; text-decoration: none;">Política de Privacidad</a> | 
                    <a href="[URL_TERMINOS]" style="color: #3b82f6; text-decoration: none;">Términos de Servicio</a>
                </p>
            </div>
        </div>
    </body>
    </html>`;
}
