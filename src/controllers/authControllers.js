import { compararPassword} from "../utils/bcrypt.js"
import {User} from "../models/fotografoModel.js"
import {crearToken} from "../utils/jwt.js"


//inicia sesion verificando el token JWT
export async function iniciarSesion(req, res) {
    const { email, password } = req.body;
  
    try {
      const usuario = await User.findOne({ email }); 
      const esValida = await compararPassword(password, usuario.password);
      if (usuario && esValida){
        const token = await crearToken(usuario);
       return  res.status(200).json({
          valido: true,
          mensaje: "Autenticación exitosa",
          token,
          usuario: {
            id: usuario._id,
            email: usuario.email,
            nombre: usuario.nombre,
          }
        });
      }
      return res.status(404).json({ valido: false, mensaje: "Los datos ingresados no coinciden" });
  
  
    } catch (error) {
      console.error("Error en login:", error.message);
      res.status(500).json({ valido: false, mensaje: "Error en el servidor" });
    }
  }


  