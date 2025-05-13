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

  // Validación temprana
  if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No se han subido archivos" });
  }

  try {
      // 1. Preparar estructura de directorios
      const { categorias: rutaCategorias } = await crearUserID(id);
      const rutaCategoria = join(rutaCategorias, categoria);
      await fs.mkdir(rutaCategoria, { recursive: true });

      // 2. Procesar imágenes en serie para mejor control de memoria
      const resultados = [];
      const errores = [];

      for (const file of req.files) {
          let rutaOptimizada;
          try {
              // 3. Optimizar imagen
              rutaOptimizada = await optimizarImagenes(file.path);
              
              // 4. Generar nombre único basado en timestamp
              const timestamp = Date.now();
              const nombreFinal = `${timestamp}_${path.basename(rutaOptimizada)}`;
              const rutaFinal = join(rutaCategoria, nombreFinal);

              // 5. Mover archivo (operación atómica)
              await fs.rename(rutaOptimizada, rutaFinal);

              // 6. Generar URL pública
              const rutaRelativa = path.join('imagenes', id, 'categorias', categoria, nombreFinal)
                  .replace(/\\/g, '/');
              const url = `${req.protocol}://${req.get('host')}/${rutaRelativa}`;

              resultados.push({
                  url,
                  nombreArchivo: nombreFinal,
                  categoria,
                  extension: '.webp',
                  size: (await fs.stat(rutaFinal)).size
              });

          } catch (error) {
              errores.push({
                  nombreArchivo: file.originalname,
                  error: error.message
              });
              console.error(`Error procesando ${file.originalname}:`, error);
              
              // Limpieza de archivos temporales en caso de error
              if (rutaOptimizada) {
                  await fs.unlink(rutaOptimizada).catch(() => {});
              }
          } finally {
              // Eliminar archivo temporal original siempre
              await fs.unlink(file.path).catch(() => {});
          }
      }

      // 7. Manejo de resultados/errores
      if (resultados.length === 0) {
          throw new Error(`Ninguna imagen se pudo procesar: ${errores.map(e => e.error).join(', ')}`);
      }

      // 8. Guardar en MongoDB
      const urlsImagenes = resultados.map(r => r.url);
      const resultadoMongo = await agregarImgCategoria(id, categoria, precio, urlsImagenes);

      if (!resultadoMongo.success) {
          throw new Error(resultadoMongo.error);
      }

      res.json({
          success: true,
          mensaje: `${resultados.length} imágenes procesadas en categoría ${categoria}`,
          resultados,
          ...(errores.length > 0 && { advertencias: errores }),
          mongoResult: resultadoMongo
      });

  } catch (error) {
      // Limpieza general en caso de error
      if (req.files) {
          await Promise.allSettled(
              req.files.map(file => fs.unlink(file.path).catch(() => {}))
          );
      }
      
      console.error('Error al subir imágenes por categoría:', error);
      res.status(500).json({
          error: "Error al procesar imágenes",
          ...(process.env.NODE_ENV === 'development' && { 
              detalle: error.message,
              stack: error.stack 
          })
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


