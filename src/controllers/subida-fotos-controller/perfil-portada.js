// controllers/perfilController.js
import fs from 'fs';
import path from 'path';
import { guardarPerfilnDB, guardarPortadaDB} from '../../services/imagenPortafaPerfil/guardarEnDB.js';

const guardarImagenPerfil = (file, id) => {
    const carpetaDestino = path.join('uploads', 'perfil');
    
    // Crear carpeta si no existe (sin verificar si ya existe)
    fs.mkdirSync(carpetaDestino, { recursive: true });
    
    // Generar nombre único con timestamp para evitar colisiones
    const nombreUnico = id + '_' + file.originalname;
    const rutaFinal = path.join(carpetaDestino, nombreUnico);
    
    // Mover el archivo
    fs.renameSync(file.path, rutaFinal);
    
    return rutaFinal;
};

export const subirImagenPerfil = async (req, res) => { 
    const {id} = req.params;
    try {
        const rutaGuardada = guardarImagenPerfil(req.file, id);
        const url = `${req.protocol}://${req.get('host')}/${rutaGuardada.replace(/\\/g, '/')}`;
        //una ves que obtengo el link lo guardo en la base de datos
       await  guardarPerfilnDB(url, id);
        res.json({ 
            mensaje: "Imagen subida correctamente",
            url
        });
    } catch (error) {
        res.status(500).json({ error: "Error al guardar la imagen" });
    }
};

const guardarImagenPortada = (file, id) => {
    const carpetaDestino = path.join('uploads', 'portada');
    
    // Crear carpeta si no existe (sin verificar si ya existe)
    fs.mkdirSync(carpetaDestino, { recursive: true });
    
    // Generar nombre único con timestamp para evitar colisiones
    const nombreUnico = id + '_' + file.originalname;
    const rutaFinal = path.join(carpetaDestino, nombreUnico);
    
    // Mover el archivo
    fs.renameSync(file.path, rutaFinal);
    
    return rutaFinal;
};

export const subirImagenPortada = async (req, res) => { 
    const {id} = req.params;
    try {
        const rutaGuardada = guardarImagenPortada(req.file, id);
        const url = `${req.protocol}://${req.get('host')}/${rutaGuardada.replace(/\\/g, '/')}`;
        //una ves que obtengo el link lo guardo en la base de datos
       await  guardarPortadaDB(url, id);
        res.json({ 
            mensaje: "Imagen subida correctamente",
            url
        });
    } catch (error) {
        res.status(500).json({ error: "Error al guardar la imagen" });
    }
};