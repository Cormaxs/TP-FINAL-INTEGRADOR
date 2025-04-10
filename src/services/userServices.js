import {User} from "../models/userModels.js"




export async function traerTodosusuarios(page, limit) {
   page = encodeURIComponent(page);
   limit = encodeURIComponent(limit)
  try {
    const usuarios = await User.find()
    .select('-password')
    .select('-email')
    .select('-__v')
    //busco en db
    //skip -> ignora cierta cantidad de documentos
    //pagina numero de pagina a mostrar
    //limit cantidad de items por pagina
      .skip((page - 1) * limit)//ejemplo : .skip((3 - 1) * 10)=20 -> ignoro los primeros 20 items
      .limit(parseInt(limit));//limita la cantidad de items que trae

      //cuenta cuantos items hay en la coleccion, se usa para saber cuantas paginas hay en total
    const total = await User.countDocuments();

    const paginaActual = parseInt(page);
    const totalPaginas = Math.ceil(total / limit);
    
    return {
      page: paginaActual,
      totalPages: totalPaginas,
      totalUsers: total,
      anterior: paginaActual > 1 ? paginaActual - 1 : null,
      siguiente: paginaActual < totalPaginas ? paginaActual + 1 : null,
      users: usuarios
    };
    
  } catch (err) {
    console.error(err);
    throw new Error("Error al obtener los usuarios");
  }
}

