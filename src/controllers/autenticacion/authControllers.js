import { compararPassword } from "../../utils/bcrypt.js"
import { crearToken } from "../../utils/jwt.js"
import { existeCorreo, estadoCuentaEmail, estadoCuentaId} from "../../services/crud-user/verificarCuenta.js";
import { coleccionErrores } from "../../middleware/manejoDeErrores/coleccion-errores.js";

//inicia sesion 
export async function iniciarSesion(req, res) {
  const { email, password } = req.body;
  const usuario = await existeCorreo(email);
  if (!usuario.email) return res.status(404).json({ message: "Los datos ingresados no coinciden" });
  const esValida = await compararPassword(password, usuario.password);
  console.log(esValida)
  if (esValida) {
    await estadoCuentaEmail(email, "true");
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
  }throw coleccionErrores.compareHashError();
}

export async function lagout(req, res) {
  const {id} = req.usuario;
 const retorno =   await estadoCuentaId(id, "false");
  console.log("estado: ", retorno, req.usuario)
  res.status(200).json({message: "Sesion cerrada correctamente"})
}

export async function sesionActiva(req, res){
  const {email} = req.usuario;
  const retorno = await estadoCuentaEmail(email, "true");
  console.log(retorno, req.usuario)
  res.status(200).json({message: "Sesion activa"})
}