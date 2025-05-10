import { promises as fs } from 'fs';
import path, { join }  from 'path';
import { guardarEnDB, agregarImgCategoria, eliminarCategoriaDB, eliminarFotosCategoria, updatePriceCategoria } from '../../services/imagenPortafaPerfil/guardarEnDB.js';
import { crearUserID } from '../crearCarpetas/crearCarpetas.js';
import { coleccionErrores } from '../../middleware/manejoDeErrores/coleccion-errores.js';
import { optimizarImagenes } from './optimizar-imagenes.js'; 

const rootDir = process.cwd();
const imagesDir = join(rootDir, 'imagenes');

export const subirImagen = async (req, res) => {
  const { id, tipo } = req.params;

  try {
    if (tipo !== 'perfil' && tipo !== 'portada') {
      return res.status(400).json({ success: false, error: "Tipo de imagen no válido. Debe ser 'perfil' o 'portada'." });
    }

    // Crear carpetas necesarias
    await crearUserID(id);
    const destinoDir = join(imagesDir, id, 'perfil-portada');

    // Eliminar archivos anteriores del mismo tipo
    const archivos = await fs.readdir(destinoDir);
    for (const archivo of archivos) {
      if (archivo.startsWith(tipo)) {
        await fs.unlink(join(destinoDir, archivo));
        
      }
    }

    // Optimizar imagen desde la ruta temporal
    const rutaTemporal = req.file.path;
    const rutaOptimizada = await optimizarImagenes(rutaTemporal);

    // Renombrar archivo optimizado a nombre final en carpeta destino
    const nombreArchivoFinal = `${tipo}-${id}.webp`;
    const rutaFinal = join(destinoDir, nombreArchivoFinal);
    await fs.rename(rutaOptimizada, rutaFinal);
    await fs.unlink(req.file.path);


    // URL pública
    const rutaRelativa = join('imagenes', id, 'perfil-portada', nombreArchivoFinal);
    const url = `https://${req.get('host')}/${rutaRelativa.replace(/\\/g, '/')}`;

    // Guardar en la base de datos
    await guardarEnDB(url, id, tipo);

    res.status(200).json({
      success: true,
      url,
      rutaLocal: rutaRelativa
    });

  } catch (error) {
    throw coleccionErrores.errAlGuardarImagen(error);
  }
};



//sube img categorias en carpeta local
export const subirImagenCategoria = async (req, res) => {
    const { id, categoria } = req.params;
    const { precio } = req.body;
  
    try {
      // Verificar/crear estructura de carpetas
      const { categorias: rutaCategorias } = await crearUserID(id);
      const rutaCategoria = join(rutaCategorias, categoria);
      await fs.mkdir(rutaCategoria, { recursive: true });
  
      const resultados = await Promise.all(
        req.files.map(async (file) => {
          // Optimizar imagen y obtener nueva ruta (con extensión .webp)
          const rutaOptimizada = await optimizarImagenes(file.path);
  
          // Definir nombre final y ruta final
          const nombreFinal = path.basename(rutaOptimizada);
          const rutaFinal = join(rutaCategoria, nombreFinal);
  
          // Eliminar si ya existe
          try {
            await fs.access(rutaFinal);
            await fs.unlink(rutaFinal);
          } catch (err) {
            if (err.code !== 'ENOENT') throw err;
          }
  
          // Mover imagen optimizada a su ubicación final
          await fs.rename(rutaOptimizada, rutaFinal);
  
          // Eliminar archivo temporal original
          await fs.unlink(file.path);
  
          // Generar URL pública
          const rutaRelativa = join('imagenes', id, 'categorias', categoria, nombreFinal);
          const url = `https://${req.get('host')}/${rutaRelativa.replace(/\\/g, '/')}`;
  
          return {
            url,
            nombreArchivo: nombreFinal,
            categoria,
            extension: '.webp',
          };
        })
      );
  
      // Guardar en MongoDB
      const urlsImagenes = resultados.map(r => r.url);
      const resultadoMongo = await agregarImgCategoria(id, categoria, precio, urlsImagenes);
  
      if (!resultadoMongo.success) {
        throw new Error(resultadoMongo.error);
      }
  
      res.json({
        success: true,
        mensaje: `${req.files.length} imágenes procesadas en categoría ${categoria}`,
        resultados,
        mongoResult: resultadoMongo,
      });
  
    } catch (error) {
      // Eliminar archivos temporales si ocurre un error
      if (req.files) {
        await Promise.all(
          req.files.map(file => fs.unlink(file.path).catch(() => {}))
        );
      }
  
      console.error('Error al subir imágenes por categoría:', error);
      res.status(500).json({
        error: "Error al procesar imágenes",
        detalle: error.message
      });
    }
  };

//elimina archivos
export const eliminarImagenCategoria = async (req, res) => {
    const { id, categoria, imagen } = req.params;

    try {
        //Construir URL completa 
        const baseUrl = process.env.BASE_URL ;
        const imagenUrl = `${baseUrl}/imagenes/${id}/categorias/${categoria}/${imagen}`;

        //Eliminar de la base de datos
        const resultadoDB = await eliminarFotosCategoria(id, categoria, [imagenUrl]);
    
        if (!resultadoDB.success) return res.status(404).json(resultadoDB);
        

        // Eliminar archivo físico
        let resultadoFS;
        try {
            const rutaRelativa = path.join('imagenes', id, 'categorias', categoria, imagen);
            const rutaCompleta = path.join(process.cwd(), rutaRelativa);
            
            await fs.access(rutaCompleta);
            await fs.unlink(rutaCompleta);
            
            resultadoFS = {
                status: 'success',
                path: rutaRelativa
            };
        } catch (error) {
            resultadoFS = {
                status: 'error',
                error: error.code === 'ENOENT' ? 'Archivo no encontrado' : 'Error al eliminar archivo',
                detalle: error.message
            };
        }

        // Preparar respuesta
        const response = {
            success: true,
            message: `Operación completada para ${imagen} en categoría ${categoria}`,
            datos: {
                usuario: id,
                categoria: categoria,
                imagen: imagen,
                resultadoDB: resultadoDB,
                resultadoFS: resultadoFS
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error en eliminarImagenCategoria:', error);
        
        res.status(500).json({
            success: false,
            error: "Error al procesar la solicitud",
            detalle: process.env.NODE_ENV === 'development' 
                ? error.message 
                : 'Consulte con el administrador'
        });
    }
};


// Elimina una categoría completa (DB + archivos)
export const eliminarCategoria = async (req, res) => {
    const { id, categoria } = req.params;

    try {
        // Eliminar de DB 
        const resultadoDB = await eliminarCategoriaDB(id, categoria);

        // Eliminar archivos 
        const rutaCategoria = path.join(process.cwd(), 'imagenes', id, 'categorias', categoria);
        let resultadoFS;
        
        try {
            await fs.access(rutaCategoria);
            await fs.rm(rutaCategoria, { recursive: true, force: true });
            resultadoFS = { status: 'success', path: rutaCategoria };
        } catch (fsError) {
            resultadoFS = {
                status: fsError.code === 'ENOENT' ? 'warning' : 'error',
                error: fsError.code === 'ENOENT' 
                    ? 'La carpeta no existía' 
                    : 'Error al eliminar archivos',
                path: rutaCategoria
            };
            
            if (fsError.code !== 'ENOENT') throw fsError;
        }
        res.status(200).json({
            success: true,
            message: `Categoría ${categoria} eliminada`,
            detalles: {
                ...resultadoDB,
                filesystem: resultadoFS
            }
        });

    } catch (error) {
        console.error(`Error eliminando categoría ${categoria} para usuario ${id}:`, error);
        
        const statusCode = error.message.includes('no encontrado') ? 404 : 
                          error.message.includes('requeridos') ? 400 : 500;
        
        res.status(statusCode).json({
            success: false,
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};


//elimina la carpeta del usuario y todos sus datos
export const eliminarUsuarioCarpeta = async (id) => {

    try {
        // Ruta a la carpeta del usuario
        const rutaUsuario = path.join(process.cwd(), 'imagenes', id);
        
        // Verificar si existe y eliminar recursivamente
        await fs.access(rutaUsuario);
        await fs.rm(rutaUsuario, { recursive: true, force: true });
        
        return true;

    } catch (error) {
        console.error(`Error eliminando carpeta del usuario ${id}:`, error);
        
    }
};

export const actualizarPrecioCategoria= async (req,res) => {
    const respuesta = await updatePriceCategoria(req.params.id, req.body);
    res.send(respuesta)
}