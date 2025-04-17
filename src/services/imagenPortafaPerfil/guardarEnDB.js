import { User } from "../../models/fotografoModel.js"

//guarda link img perfil - portada en DB
  export const guardarEnDB = async (link, id, tipo) => {
    try {
        const usuario = await User.findById(id);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Actualiza el campo correspondiente dinámicamente
        usuario.fotos[tipo] = link;
        await usuario.save();
        
        return true;
    } catch (error) {
        console.error(`Error al guardar imagen de ${tipo}:`, error);
        throw error;
    }
};



// Agrega imágenes a una categoría del usuario (crea la categoría si no existe)
export async function agregarImgCategoria(idUser, nombreCategoria, imagenes) {
    try {
      //Validar usuario
      const usuario = await User.findById(idUser);
      if (!usuario) throw new Error('Usuario no encontrado');
  
      //Procesar imágenes (eliminar duplicados)
      const imagenesUnicas = [...new Set(imagenes)];
  
      //Buscar si ya tiene la categoría
      const categoriaIndex = usuario.categorias.findIndex(
        c => c.categoria.toLowerCase() === nombreCategoria.toLowerCase()
      );
  
      if (categoriaIndex >= 0) {
        // Actualizar existente
        usuario.categorias[categoriaIndex].imagenes = imagenesUnicas;
        usuario.categorias[categoriaIndex].ultimaActualizacion = Date.now();
      } else {
        // Agregar nueva
        usuario.categorias.push({
          categoria: nombreCategoria,
          imagenes: imagenesUnicas
        });
      }
      await usuario.save();
  
      return {
        success: true,
        categoria: {
          nombre: nombreCategoria,
          imagenes: imagenesUnicas
        }
      };
  
    } catch (error) {
      console.error('Error en agregarImgCategoria:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }



  export async function eliminarFotosCategoria(idUser, nombreCategoria, imagenesAEliminar) {
    try {
        // Validar usuario
        const usuario = await User.findById(idUser);
        if (!usuario) {
            return { success: false, error: 'Usuario no encontrado' };
        }

        // Normalizar nombre de categoría
        const nombreCategoriaNormalizado = nombreCategoria.toLowerCase();

        // Buscar la categoría del usuario
        const categoria = usuario.categorias.find(
            c => c.categoria && c.categoria.toLowerCase() === nombreCategoriaNormalizado
        );

        if (!categoria) {
            return { success: false, error: 'Categoría no encontrada' };
        }

        // Extraer solo los nombres de archivo para comparación
        const nombresArchivosAEliminar = imagenesAEliminar.map(url => {
            try {
                return url.split('/').pop(); // Extrae "fili.jpg" de la URL
            } catch {
                return url;
            }
        });

        // Filtrar las imágenes
        categoria.imagenes = categoria.imagenes.filter(imagenUrl => {
            const nombreArchivo = imagenUrl.split('/').pop();
            return !nombresArchivosAEliminar.includes(nombreArchivo);
        });

        // Actualizar fecha de modificación
        categoria.ultimaActualizacion = Date.now();

        // Guardar cambios
        await usuario.save();

        return {
            success: true,
            message: `Imagen eliminada de la categoría ${nombreCategoria}`,
            categoria: {
                nombre: nombreCategoria,
                imagenes: categoria.imagenes
            }
        };

    } catch (error) {
        console.error('Error en eliminarFotosCategoria:', error);
        return {
            success: false,
            error: error.message
        };
    }
}


export async function eliminarCategoriaDB(userId, categoryName) {
  if (!userId || !categoryName) {
      throw new Error('ID de usuario y nombre de categoría son requeridos');
  }

  const usuario = await User.findById(userId);
  if (!usuario) {
      throw new Error('Usuario no encontrado');
  }

  const initialCount = usuario.categorias.length;
  usuario.categorias = usuario.categorias.filter(
      cat => cat.categoria.toLowerCase() !== categoryName.toLowerCase()
  );

  if (usuario.categorias.length === initialCount) {
      throw new Error('Categoría no encontrada en el usuario');
  }

  await usuario.save();

  return {
      categoriasRestantes: usuario.categorias.map(c => c.categoria),
      categoriaEliminada: categoryName
  };
}