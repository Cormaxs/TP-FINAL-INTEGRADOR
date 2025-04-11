import {User} from "../models/userModel.js"
import {CustomError} from "../utils/crearError.js"


//trae los datos de los usuarios, los que se puedan ver
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
    throw new CustomError(400, "Error al obtener los usuarios");
  }
}



//agregar las demas qerrys
export async function buscadorSitioTodo(filtrosBusqueda = {}) {
  let { name = '', place = '', page = 1, limit = 10 } = filtrosBusqueda;

  // Asegurar que page y limit sean enteros positivos
  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    throw new CustomError(400, "Parámetros de paginación inválidos");
  }

  const filtro = {
    nombre: { $regex: name, $options: 'i' },
    ubicacion: { $regex: place, $options: 'i' }
  };

  try {
    // Total sin paginación (para saber cuántos hay)
    const totalResultados = await User.countDocuments(filtro);

    const resultados = await User.find(filtro)
      .select('-password -email -__v') // opcional: excluir campos sensibles
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPaginas = Math.ceil(totalResultados / limit);

    return {
      page,
      totalPages: totalPaginas,
      totalResults: totalResultados,
      anterior: page > 1 ? page - 1 : null,
      siguiente: page < totalPaginas ? page + 1 : null,
      resultados
    };

  } catch (err) {
    console.error('Error en buscadorSitioTodo:');
    throw err;
  }
}
