import { compararPassword} from "../../utils/bcrypt.js"
import {User} from "../../models/fotografoModel.js"
import {crearToken} from "../../utils/jwt.js"


//inicia sesion 
export async function iniciarSesion(req, res) {
    const { email, password } = req.body;
      const usuario = await User.findOne({ email});
      if(!usuario) return res.status(404).json({message: "Los datos ingresados no coinciden" });
      const esValida = await compararPassword(password, usuario.password);
      if (esValida){
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
  }


  