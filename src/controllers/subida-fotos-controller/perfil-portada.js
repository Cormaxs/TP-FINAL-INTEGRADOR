// controllers/perfilController.js
import fs from 'fs';
import path from 'path';
import { guardarEnDB} from '../../services/imagenPortafaPerfil/guardarEnDB.js';

//guarda img en el servidor y pasa url
const guardarImagen = (file, tipo, id) => {
    const carpetaDestino = path.join('uploads', tipo);
    fs.mkdirSync(carpetaDestino, { recursive: true });
    const nombreUnico = `${id}.webp`;
    
    const rutaFinal = path.join(carpetaDestino, nombreUnico);
    
    fs.renameSync(file.path, rutaFinal);
    return rutaFinal;
};

//sube img a DB
export const subirImagen = async (req, res) => {
    const { id, tipo } = req.params;
     // Validar que el tipo sea permitido
    const tiposPermitidos = ['perfil', 'portada'];
    if (!tiposPermitidos.includes(tipo)) {
        return res.status(400).json({ error: "solo se permite perfil-portada" });
    }
    try {
        const rutaGuardada = guardarImagen(req.file, tipo, id);
        const url = `${req.protocol}://${req.get('host')}/${rutaGuardada.replace(/\\/g, '/')}`;
        await guardarEnDB(url, id, tipo);
        res.json({ 
            mensaje: `Imagen de ${tipo} subida correctamente`,
            url,
            tipo
        });
    } catch (error) {
        res.status(500).json({ 
            error: `Error al guardar la imagen de ${tipo}`,
            detalle: error.message 
        });
    }
};