import {User} from "../models/fotografoModel.js"
import {CustomError} from "../utils/crearError.js"

//agregar las demas qerrys, si le paso vacio me devuelve todos los usuarios

export async function buscadorSitioTodo(filtrosBusqueda = {}) {
  let { page, limit, ...restoFiltros } = filtrosBusqueda;

  // Asegurar que page y limit sean enteros positivos
  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    throw new CustomError(400, "Parámetros de paginación inválidos");
  }

  // Crear filtro dinámico para todos los campos string excepto paginación
  const filtro = {};
  for (const [campo, valor] of Object.entries(restoFiltros)) {
    if (typeof valor === 'string' && valor.trim() !== '') {
      filtro[campo] = { $regex: valor, $options: 'i' }; // búsqueda insensible a mayúsculas
    }
  }

  try {
    const totalResultados = await User.countDocuments(filtro);

    const resultados = await User.find(filtro)
      .select('-password -email -__v') // excluir campos sensibles
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

