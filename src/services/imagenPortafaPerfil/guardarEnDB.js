import { User } from "../../models/fotografoModel.js"
import { coleccionErrores } from "../../middleware/manejoDeErrores/coleccion-errores.js"; 


//guarda link img perfil - portada en DB
  export const guardarEnDB = async (link, id, tipo) => {
    try {
        const usuario = await User.findById(id);
        if (!usuario) throw coleccionErrores.idNoEncontrado(id);
        usuario.fotos[tipo] = link;   // Actualiza el campo correspondiente dinámicamente
        await usuario.save();
        return true;
    } catch (error) {
        throw coleccionErrores.errAlGuardarImagen(error, tipo)
    }
};



// Agrega imágenes a una categoría del usuario (crea la categoría si no existe)
export async function agregarImgCategoria(idUser, nombreCategoria, precio, imagenes) {
    try {
      // Validar usuario
      const usuario = await User.findById(idUser);
      if (!usuario) throw coleccionErrores.idNoEncontrado(idUser);
  
      // Procesar imágenes (eliminar duplicados)
      const nuevasImagenesUnicas = [...new Set(imagenes)];
  
      // Buscar si ya tiene la categoría
      const categoriaIndex = usuario.categorias.findIndex(
        c => c.categoria.toLowerCase() === nombreCategoria.toLowerCase()
      );
  
      if (categoriaIndex >= 0) {
        // Si la categoría existe, combinar imágenes y actualizar precio
        const categoria = usuario.categorias[categoriaIndex];
        const imagenesActuales = categoria.imagenes;
        const imagenesCombinadas = [...new Set([...imagenesActuales, ...nuevasImagenesUnicas])];
  
        categoria.imagenes = imagenesCombinadas;
        categoria.precio = precio; // <- Ahora sí se actualiza el precio correctamente
        categoria.ultimaActualizacion = Date.now();
      } else {
        // Si no existe, crear nueva categoría
        usuario.categorias.push({
          categoria: nombreCategoria,
          precio: precio,
          imagenes: nuevasImagenesUnicas,
          ultimaActualizacion: Date.now()
        });
      }
  
      await usuario.save();
  
      return {
        success: true,
        categoria: {
          nombre: nombreCategoria,
          imagenes: categoriaIndex >= 0
            ? usuario.categorias[categoriaIndex].imagenes
            : nuevasImagenesUnicas
        }
      };
    } catch (error) {
      throw coleccionErrores.errAlGuardarImagen(error);
    }
  }
  


  export async function eliminarFotosCategoria(idUser, nombreCategoria, imagenesAEliminar) {
    try {
        // Validar usuario
        const usuario = await User.findById(idUser);
        if (!usuario) throw coleccionErrores.idNoEncontrado(idUser)

        // Normalizar nombre de categoría
        const nombreCategoriaNormalizado = nombreCategoria.toLowerCase();

        // Buscar la categoría del usuario
        const categoria = usuario.categorias.find(
            c => c.categoria && c.categoria.toLowerCase() === nombreCategoriaNormalizado
        );

        if (!categoria) throw coleccionErrores.categoriaNotFound(categoria)
          
        // Extraer solo los nombres de archivo para comparación
        const nombresArchivosAEliminar = imagenesAEliminar.map(url => {
            try {
                return url.split('/').pop(); // Extrae nombre img  de la URL
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

    } catch (error) {  throw coleccionErrores.errDeleteIMG(error) }
}


export async function eliminarCategoriaDB(userId, categoryName) {

  const usuario = await User.findById(userId);
  if (!usuario) throw coleccionErrores.idNoEncontrado(userId)

  const initialCount = usuario.categorias.length;
  usuario.categorias = usuario.categorias.filter(
      cat => cat.categoria.toLowerCase() !== categoryName.toLowerCase()
  );

  if (usuario.categorias.length === initialCount) throw coleccionErrores.categoriaNotFound(usuario.categorias)
  

  await usuario.save();

  return {
      categoriasRestantes: usuario.categorias.map(c => c.categoria),
      categoriaEliminada: categoryName
  };
}

