import nodemailer from "nodemailer";
import dotenv from "dotenv"
import { verificarCuentaServices } from "../../services/crud-user/verificarCuenta.js";

dotenv.config();
//datos del correo
const transporter = nodemailer.createTransport({
    host: process.env.SERVICE_MAIL, // asegurate de que esto es correcto
    port: 465,                            // o 587 si el proveedor lo indica
    secure: true,                         // true si usás el puerto 465
    auth: {
      user: process.env.CORREO,
      pass: process.env.PASSWORDCORREO
    },
    
  });
  


// Definimos el contenido del correo
function mailOptions(destinatario,tema, html, text) {
    return {
    from: process.env.CORREO,
    to: destinatario,
    subject: tema,
    text: text ,
    html: html
}  
};

//manda un correo para que verifique la cuenta
export function verificarCorreo(datos, id) {
    try {
         transporter.sendMail(mailOptions(datos.email, "probando nodemialer", html(datos.nombre, id ), "aca va el texto"), function (error, info) {
            if (error) {
                console.log('Error al enviar:', error);
              } else {
                console.log('Correo enviado:', info.response);
              }
        })
    } catch (err) {
        console.log(err)
    }
}

//devuelve la activacion por correo
export async function verificarCuenta(req, res){
    const {id} = req.params;
            const verificada = await verificarCuentaServices(id)
            console.log(verificada)
            res.status(200).json({message: "cuenta verificada"})
}


function html (nombre, id){ 
    return`<!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifica tu cuenta</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
        <!-- Contenedor principal -->
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <!-- Logo/Header -->
            <div style="text-align: center; padding: 20px 0;">
                <h1 style="color: #3b82f6; font-size: 24px; font-weight: bold;">Bienvenido a fotografoscatamarca</h1>
            </div>
            
            <!-- Contenido -->
            <div style="padding: 30px 20px;">
                <p style="color: #4b5563; margin-bottom: 20px; line-height: 1.6;">
                    ¡Hola ${nombre}!<br><br>
                    Gracias por crear una cuenta con nosotros. Estamos emocionados de tenerte a bordo.
                    Para comenzar a usar tu cuenta, por favor verifica tu dirección de correo electrónico.
                </p>
                
                <!-- Botón de verificación -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.BASE_URL}/auth/correo/${id}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                        Verificar mi correo
                    </a>
                </div>
                
                <!-- Texto alternativo para el link -->
                <p style="color: #6b7280; text-align: center; font-size: 14px;">
                    O copia y pega este enlace en tu navegador:<br>
                    <span style="color: #3b82f6; word-break: break-all;">[URL_VERIFICACION]</span>
                </p>
                
                <!-- Detalles de la cuenta -->
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 30px;">
                    <h3 style="color: #374151; font-size: 16px; font-weight: bold; margin-bottom: 10px;">Detalles de tu cuenta:</h3>
                    <ul style="color: #4b5563; padding-left: 20px; margin: 0;">
                        <li style="margin-bottom: 8px;">Nombre de usuario: ${nombre}</li>
                        <li style="margin-bottom: 8px;">Fecha de registro: ${new Date().toLocaleDateString('es-ES', { day: '2-digit',month: '2-digit',year: 'numeric'})}</li>
                        <li>Si no creaste esta cuenta, por favor ignora este correo.</li>
                    </ul>
                </div>
            </div>
            
            <!-- Pie de página -->
            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 14px;">
                <p>© [AÑO_ACTUAL] [NombreApp]. Todos los derechos reservados.</p>
                <p style="margin-top: 10px;">
                    <a href="[URL_PRIVACIDAD]" style="color: #3b82f6; text-decoration: none;">Política de Privacidad</a> | 
                    <a href="[URL_TERMINOS]" style="color: #3b82f6; text-decoration: none;">Términos de Servicio</a>
                </p>
            </div>
        </div>
    </body>
    </html>`
}