import { promises as fs } from 'fs';
import path, { join }  from 'path';
import { guardarEnDB, agregarImgCategoria, eliminarCategoriaDB, eliminarFotosCategoria } from '../../services/imagenPortafaPerfil/guardarEnDB.js';
import { crearUserID } from '../crearCarpetas/crearCarpetas.js';
import { coleccionErrores } from '../../middleware/manejoDeErrores/coleccion-errores.js';


const rootDir = process.cwd();
const imagesDir = join(rootDir, 'imagenes');

export const subirImagen = async (req, res) => {
    const { id, tipo } = req.params;
    try {
        // Validar que el tipo sea 'perfil' o 'portada'
        if (tipo !== 'perfil' && tipo !== 'portada') {
            return res.status(400).json({ success: false, error: "Tipo de imagen no válido. Debe ser 'perfil' o 'portada'." });
        }

        // Crear estructura de carpetas
        await crearUserID(id);
        
        // Definir ruta de destino
        const destinoDir = join(imagesDir, id, 'perfil-portada');
        
        // Eliminar archivos anteriores del mismo tipo (perfil o portada)
        const archivos = await fs.readdir(destinoDir);
        for (const archivo of archivos) {
            if (archivo.startsWith(tipo)) { // Si el archivo comienza con 'perfil' o 'portada'
                await fs.unlink(join(destinoDir, archivo)); // Elimina el archivo anterior
            }
        }

        // Generar nuevo nombre de archivo
        const nombreArchivo = `${tipo}-${id}${path.extname(req.file.originalname) || '.webp'}`;
        const rutaFinal = join(destinoDir, nombreArchivo);
        
        // Mover el archivo subido a la ruta final
        await fs.rename(req.file.path, rutaFinal);
        
        // Generar URL pública
        const rutaRelativa = join('imagenes', id, 'perfil-portada', nombreArchivo);
        const url = `${req.protocol}://${req.get('host')}/${rutaRelativa.replace(/\\/g, '/')}`;
        
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
    const {precio} = req.body;
    try {
        // Verificar/crear estructura de carpetas
        const { categorias: rutaCategorias } = await crearUserID(id);
        const rutaCategoria = join(rutaCategorias, categoria);
        
        // Crear carpeta de categoría si no existe
        await fs.mkdir(rutaCategoria, { recursive: true });
        
        //Procesar cada imagen
        const resultados = await Promise.all(
            req.files.map(async (file) => {
                const nombreArchivo = file.originalname;
                const rutaFinal = join(rutaCategoria, nombreArchivo);
                
                // Eliminar archivo existente si hay uno
                try {
                    await fs.access(rutaFinal);
                    await fs.unlink(rutaFinal);
                } catch (err) {
                    if (err.code !== 'ENOENT') throw err;
                }
                
                // Mover archivo a su ubicación final
                await fs.rename(file.path, rutaFinal);
                
                // Generar URL
                const rutaRelativa = join('imagenes', id, 'categorias', categoria, nombreArchivo);
                const url = `${req.protocol}://${req.get('host')}/${rutaRelativa.replace(/\\/g, '/')}`;
                
                return {
                    url,
                    nombreArchivo,
                    categoria,
                    extension: path.extname(file.originalname),
                };
            })
        );

        // Actualizar MongoDB con las URLs de las imágenes
        const urlsImagenes = resultados.map(r => r.url);
        const resultadoMongo = await agregarImgCategoria(id, categoria,precio, urlsImagenes);
        
        if (!resultadoMongo.success) {
            throw new Error(resultadoMongo.error);
        }

        res.json({
            success: true,
            mensaje: `${req.files.length} imágenes procesadas en categoría ${categoria}`,
            archivosSobrescritos: resultados.filter(r => r.sobrescrito).length,
            resultados,
            mongoResult: resultadoMongo
        });
    } catch (error) {
        // Limpiar archivos temporales en caso de error
        if (req.files) {
            await Promise.all(
                req.files.map(file => fs.unlink(file.path).catch(console.error))
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