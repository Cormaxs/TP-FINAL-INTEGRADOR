import nodemailer from "nodemailer";
import dotenv from "dotenv"


dotenv.config();
//datos del correo
export const transporter = nodemailer.createTransport({
    host: process.env.SERVICE_MAIL, // asegurate de que esto es correcto
    port: 465,                            // o 587 si el proveedor lo indica
    secure: true,                         // true si usás el puerto 465
    auth: {
      user: process.env.CORREO,
      pass: process.env.PASSWORDCORREO
    },
    
  });
  

// Definimos el contenido del correo
export function mailOptions(destinatario,tema, html, text) {
    return {
    from: process.env.CORREO,
    to: destinatario,
    subject: tema,
    text: text ,
    html: html
}  
};