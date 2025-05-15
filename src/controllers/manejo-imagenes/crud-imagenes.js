import { promises as fs } from 'fs';
import path, { join }  from 'path';
import { guardarEnDB, agregarImgCategoria, eliminarCategoriaDB, eliminarFotosCategoria, updatePriceCategoria, updateNameCategoria } from '../../services/imagenPortafaPerfil/guardarEnDB.js';
import { crearUserID } from '../crearCarpetas/crearCarpetas.js';
import { coleccionErrores } from '../../middleware/manejoDeErrores/coleccion-errores.js';


const rootDir = process.cwd();
const imagesDir = join(rootDir, 'imagenes');

export const subirImagen = async (req, res) => {
  const { id, tipo } = req.params;

  // Validación básica del tipo de imagen
  if (tipo !== 'perfil' && tipo !== 'portada') {
    return res.status(400).json({ 
      success: false, 
      error: "Tipo de imagen no válido. Debe ser 'perfil' o 'portada'." 
    });
  }

  try {
    // 1. Crear estructura de directorios
    await crearUserID(id);
    const destinoDir = join(imagesDir, id, 'perfil-portada');
    await fs.mkdir(destinoDir, { recursive: true });

    // 2. Eliminar imágenes anteriores del mismo tipo
    try {
      const archivos = await fs.readdir(destinoDir);
      for (const archivo of archivos) {
        if (archivo.startsWith(tipo)) {
          await fs.unlink(join(destinoDir, archivo));
        }
      }
    } catch (err) {
      // Si no existe el directorio o no hay archivos, continuamos
      if (err.code !== 'ENOENT') throw err;
    }

    // 3. Mover el archivo directamente
    const extension = `${path.extname(req.file.originalname)}.webp`;
    const nombreArchivoFinal = `${tipo}-${id}${extension}`;
    const rutaFinal = join(destinoDir, nombreArchivoFinal);
    
    await fs.rename(req.file.path, rutaFinal);

    // 4. Generar URL pública
    const rutaRelativa = join('imagenes', id, 'perfil-portada', nombreArchivoFinal)
      .replace(/\\/g, '/');
    const url = `${req.protocol}://${req.get('host')}/${rutaRelativa}`;

    // 5. Guardar en la base de datos
    await guardarEnDB(url, id, tipo);

    res.status(200).json({
      success: true,
      url,
      rutaLocal: rutaRelativa,
      nombreArchivo: nombreArchivoFinal
    });

  } catch (error) {
    // Limpieza en caso de error
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      success: false,
      error: "Error al subir imagen",
      detalle: error.message
    });
  }
};



//sube img categorias en carpeta local
export const subirImagenCategoria = async (req, res) => {
  const { id, categoria } = req.params;
  const { precio } = req.body;

  // Validación básica
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No se han subido archivos" });
  }

  try {
    // 1. Crear estructura de directorios
    const { categorias: rutaCategorias } = await crearUserID(id);
    const rutaCategoria = join(rutaCategorias, categoria);
    await fs.mkdir(rutaCategoria, { recursive: true });

    // 2. Procesar imágenes
    const resultados = [];
    
    for (const file of req.files) {
      try {
        // Generar nombre único
        const timestamp = Date.now();
        const nombreFinal = `${timestamp}_${file.originalname}.webp`;
        const rutaFinal = join(rutaCategoria, nombreFinal);

        // Mover archivo directamente
        await fs.rename(file.path, rutaFinal);

        // Generar URL pública
        const rutaRelativa = path.join('imagenes', id, 'categorias', categoria, nombreFinal)
          .replace(/\\/g, '/');
        const url = `${req.protocol}://${req.get('host')}/${rutaRelativa}`;

        resultados.push({
          url,
          nombreArchivo: nombreFinal,
          categoria,
          extension: path.extname(file.originalname),
          size: (await fs.stat(rutaFinal)).size
        });

      } catch (error) {
        // Si hay error, eliminar archivo temporal
        await fs.unlink(file.path).catch(() => {});
        console.error(`Error moviendo ${file.originalname}:`, error);
        throw error; // Detenemos el proceso ante el primer error
      }
    }

    // 3. Guardar en MongoDB
    const urlsImagenes = resultados.map(r => r.url);
    const resultadoMongo = await agregarImgCategoria(id, categoria, precio, urlsImagenes);

    if (!resultadoMongo.success) {
      throw new Error(resultadoMongo.error);
    }

    res.json({
      success: true,
      mensaje: `${resultados.length} imágenes subidas a categoría ${categoria}`,
      resultados,
      mongoResult: resultadoMongo
    });

  } catch (error) {
    console.error('Error al subir imágenes:', error);
    res.status(500).json({
      error: "Error al subir imágenes",
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

export const actualizarnombreCategoria = async (req, res) => {

  const { id, categoria } = req.params;  // Tomamos id y categoria desde params
  const { nuevacategoria } = req.body;  // Tomamos el nuevo nombre de la categoría desde el cuerpo de la petición
  
  try {
    const respuesta = await updateNameCategoria(id, categoria, nuevacategoria);
    res.status(200).json(respuesta);  // Devolvemos una respuesta exitosa
  } catch (error) {
    res.status(500).json({ mensaje: error.message });  // En caso de error, devolvemos un mensaje de error
  }
};
