import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CustomError } from '../../utils/crearError.js';


// Obtener la ruta ABSOLUTA del directorio raíz del proyecto
//const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = process.cwd(); // Esto siempre apunta a donde ejecutas node
const imagesDir = join(rootDir, 'imagenes');


export async function crearUserID(id) {
    try {
        // Verificar/crear carpeta de usuario
        const userDir = join(imagesDir, id);
        await fs.mkdir(userDir, { recursive: true });
        
        // Crear subcarpetas
        await Promise.all([
            fs.mkdir(join(userDir, 'categorias'), { recursive: true }),
            fs.mkdir(join(userDir, 'perfil-portada'), { recursive: true })
        ]);
        return {
            rutaUsuario: userDir,
            categorias: join(userDir, 'categorias'),
            portada: join(userDir, 'perfil-portada')
        };
    } catch (err) {
        throw CustomError(500, "error al crear carpetas", err);
    }
}


