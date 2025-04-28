import { User } from "../../models/fotografoModel.js";
import { coleccionErrores } from "../../middleware/manejoDeErrores/coleccion-errores.js";

export async function buscadorSitioTodo(filtrosBusqueda = {}) {
  const { page = 1, limit = 10, categoria, nombre, rol, ...otrosFiltros } = filtrosBusqueda;

  // Filtro base para fotógrafos y administradores
  const filtroDB = {};

  // Si no se pasa un rol, buscar por fotógrafos y administradores
  if (!rol || rol.length === 0) {
    filtroDB['rol'] = { 
      $in: ['photographer', 'admin'] // Buscar por ambos roles si no se pasa un rol específico
    };
  } else {
    // Si se pasa un rol, buscar solo por ese rol
    filtroDB['rol'] = { 
      $in: rol // Filtrar por el rol o roles especificados
    };
  }

  try {
    // Filtro por categoría si existe
    if (categoria && categoria.trim() !== '') {
      filtroDB['categorias.categoria'] = {
        $regex: categoria,
        $options: 'i',
      };
    }

    // Filtro por nombre: si hay más de un nombre, usar $in
    if (nombre && nombre.length > 0) {
      filtroDB['nombre'] = {
        $in: nombre.map((n) => new RegExp(n, 'i')), // Hacer una búsqueda case-insensitive por cada nombre
      };
    }

    // Filtros para otros campos (ubicación, rol, etc.)
    Object.entries(otrosFiltros).forEach(([campo, valor]) => {
      if (typeof valor === 'string' && valor.trim() !== '') {
        filtroDB[campo] = {
          $regex: valor,
          $options: 'i',
        };
      }
    });

    // Ejecutar consulta con paginación
    const [total, resultados] = await Promise.all([
      User.countDocuments(filtroDB),
      User.find(filtroDB)
        .select('-password -email -__v')
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    // Calcular metadatos de paginación
    const totalPaginas = Math.ceil(total / limit);

    return {
      paginaActual: page,
      totalPaginas,
      totalResultados: total,
      anterior: page > 1 ? page - 1 : null,
      siguiente: page < totalPaginas ? page + 1 : null,
      resultados,
    };
  } catch (err) {
    throw coleccionErrores.errorBusqueda(err);
  }
}
