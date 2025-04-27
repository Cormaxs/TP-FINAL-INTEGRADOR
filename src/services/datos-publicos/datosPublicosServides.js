import {User} from "../../models/fotografoModel.js"
import { coleccionErrores } from "../../middleware/manejoDeErrores/coleccion-errores.js";


export async function buscadorSitioTodo(filtrosBusqueda = {}) {
  // Extraer parámetros de paginación y otros filtros
  const { page = 1, limit = 10, categoria, ...otrosFiltros } = filtrosBusqueda;
  
  // Construir filtro de búsqueda para MongoDB
  const filtroDB = { rol: 'photographer' }; // Filtro base para fotógrafos

  try {
    // Filtro por categoría si existe
    if (categoria && categoria.trim() !== '') {
      filtroDB['categorias.categoria'] = { 
        $regex: categoria,
        $options: 'i'
      };
    }

    // Filtros para otros campos (nombre, ubicación)
    Object.entries(otrosFiltros).forEach(([campo, valor]) => {
      if (typeof valor === 'string' && valor.trim() !== '') {
        filtroDB[campo] = { 
          $regex: valor,
          $options: 'i'
        };
      }
    });

    // Ejecutar consulta con paginación
    const [total, resultados] = await Promise.all([
      User.countDocuments(filtroDB),
      User.find(filtroDB)
        .select('-password -email -__v')
        .skip((page - 1) * limit)
        .limit(limit)
    ]);

    // Calcular metadatos de paginación
    const totalPaginas = Math.ceil(total / limit);
    
    return {
      paginaActual: page,
      totalPaginas,
      totalResultados: total,
      anterior: page > 1 ? page - 1 : null,
      siguiente: page < totalPaginas ? page + 1 : null,
      resultados
    };
  } catch(err) {
    throw coleccionErrores.errorBusqueda(err);
  }
}