import {User} from "../models/userModels.js"

export async function crearUserServices(datos) {
    try {
      const usuario = new User(datos);
      const usuarioGuardado = await usuario.save();
      return usuarioGuardado;
    } catch (error) {
      console.error("Error al guardar el usuario:", error.message);
      throw new Error("No se pudo guardar el usuario");
    }
  }

  export async function buscarUserId(id) {
    try {
      const usuario = await User.findById(id);
      return usuario; // puede ser null si no existe
    } catch (err) {
      console.error("Error al buscar usuario por ID:", err.message);
      throw err; // relanzamos para que el controller lo pueda manejar
    }
  }



export async function traerTodosusuarios(page, limit) {
  try {
    const usuarios = await User.find()//busco en db
    //skip -> ignora cierta cantidad de documentos
    //pagina numero de pagina a mostrar
    //limit cantidad de items por pagina
      .skip((page - 1) * limit)//ejemplo : .skip((3 - 1) * 10)=20 -> ignoro los primeros 20 items
      .limit(parseInt(limit));//limita la cantidad de items que trae

      //cuenta cuantos items hay en la coleccion, se usa para saber cuantas paginas hay en total
    const total = await User.countDocuments();

    //devuelve un objeto con los datos organizados
    return {
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),// cuántas páginas hay en total
      totalUsers: total,
      users: usuarios //los usuarios que se mostrarán en esta página
    };
  } catch (err) {
    console.error(err);
    throw new Error("Error al obtener los usuarios");
  }
}

