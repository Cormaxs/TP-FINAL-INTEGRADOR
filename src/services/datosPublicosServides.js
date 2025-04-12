import {User} from "../models/fotografoModel.js"


export async function buscadorSitioTodo(filtrosBusqueda = {}) {
  // 1. Extraer parámetros de paginación y otros filtros
  const { page = 1, limit = 10, ...otrosFiltros } = filtrosBusqueda;
  
  // 2. Construir filtro de búsqueda para MongoDB
  const filtroDB = {};
  
  // Solo procesar campos con valores de texto no vacíos
  Object.entries(otrosFiltros).forEach(([campo, valor]) => {
    if (typeof valor === 'string' && valor.trim() !== '') {
      filtroDB[campo] = { 
        $regex: valor,       // Busca coincidencias parciales
        $options: 'i'       // Ignora mayúsculas/minúsculas
      };
    }
  });

  // 3. Ejecutar consulta con paginación
  const [total, resultados] = await Promise.all([
    User.countDocuments(filtroDB),                          // Contar total de documentos
    User.find(filtroDB)                                    // Buscar documentos
      .select('-password -email -__v')                     // Excluir campos sensibles
      .skip((page - 1) * limit)                            // Saltar resultados anteriores
      .limit(limit)                                        // Limitar por página
  ]);

  // 4. Calcular metadatos de paginación
  const totalPaginas = Math.ceil(total / limit);
  
  return {
    paginaActual: page,
    totalPaginas,
    totalResultados: total,
    anterior: page > 1 ? page - 1 : null,
    siguiente: page < totalPaginas ? page + 1 : null,
    resultados
  };
}
