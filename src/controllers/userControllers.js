import {crearUserServices, buscarUserId, traerTodosusuarios} from "../services/userServices.js"
import {encriptarPassword, compararPassword} from "../utils/bcrypt.js"
import {User} from "../models/userModels.js"
import {crearToken} from "../utils/jwt.js"



export async function crearUsuario(req, res) {
  try {
    const datos = req.body;
    const {password} = datos;
    datos.password = await encriptarPassword(password);
    console.log(datos)
    const resultado = await crearUserServices(datos);
    if (resultado) {
      return res.status(201).send("Datos guardados y usuario creado");
    }
      return res.send("No se pudo guardar el usuario");

  } catch (error) {
    console.error("Error en crearUsuario:", error.message);

    // Respondemos con un error genérico para el cliente
    res.status(500).send("Error interno del servidor");
  }
}


export async function buscarUsuario(req, res) {
  try {
    const { id } = req.params;
    const usuario = await buscarUserId(id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json({
      mensaje: "Usuario encontrado",
      usuario,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
}


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


//usa paginacion para traer de a pocos 10 usuarios(db poco potente)
export async function traerTodosUsuarios(req, res) {
  try {
    const page = parseInt(req.query.page) || 1; //por defecto pagina 1
    const limit = parseInt(req.query.limit) || 10; // por defecto 10 resultados

    const resultado = await traerTodosusuarios(page, limit);
    res.json(resultado); // ✅ aquí usamos res.json correctamente
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener los usuarios" });
  }
}



