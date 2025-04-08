import {crearUserServices, buscarUserId, traerTodosusuarios} from "../services/userServices.js"

export async function crearUsuario(req, res) {
  try {
    const datos = req.body;
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