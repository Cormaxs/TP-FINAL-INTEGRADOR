import { compararPassword } from "../../utils/bcrypt.js"
import { crearToken } from "../../utils/jwt.js"
import { existeCorreo, estadoCuenta} from "../../services/crud-user/verificarCuenta.js";

//inicia sesion 
export async function iniciarSesion(req, res) {
  const { email, password } = req.body;
  const usuario = await existeCorreo(email)
  if (!usuario) return res.status(404).json({ message: "Los datos ingresados no coinciden" });
  const esValida = await compararPassword(password, usuario.password);
  if (esValida) {
    await estadoCuenta(email, "true");
    const token = await crearToken(usuario);
    return res.status(200).json({
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

export async function lagout(req, res) {
  const {id} = req.usuario;
 const retorno =   await estadoCuenta(id, "false");
  console.log(retorno, req.usuario)
  res.status(200).json({message: "Sesion cerrada correctamente"})
}

export async function sesionActiva(req, res){
  const {id} = req.usuario;
  const retorno = await estadoCuenta(id, "true");
  console.log(retorno, req.usuario)
  res.status(200).json({message: "Sesion activa"})
}