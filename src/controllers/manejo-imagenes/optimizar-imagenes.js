import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Desactiva caché para evitar consumo excesivo de memoria
sharp.cache(false);

const MAX_SIZE = 200 * 1024; // 200 KB
const MIN_QUALITY = 30;
const MIN_DIMENSION = 320;
const DIMENSION_STEP = 100;

export async function optimizarImagenes(req, res, next) {
  try {
    const archivos = req.files || (req.file ? [req.file] : []);

    if (archivos.length === 0) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    for (const imagen of archivos) {
      const nombreOriginal = imagen.originalname;
      const nombreBase = path.parse(nombreOriginal).name;
      const nombreFinal = `${Date.now()}-${nombreBase}.webp`;
      const rutaDestino = path.join('imagenes', nombreFinal);

      const metadata = await sharp(imagen.buffer).metadata();

      let dimensionObjetivo = Math.min(metadata.width, metadata.height);
      dimensionObjetivo = Math.min(dimensionObjetivo, 2000);

      let calidad = 80;
      let bufferOptimizado;

      do {
        const bufferTemp = await sharp(imagen.buffer)
          .resize({
            width: dimensionObjetivo,
            height: dimensionObjetivo,
            fit: 'inside'
          })
          .webp({ quality: calidad })
          .toBuffer();

        if (bufferTemp.length <= MAX_SIZE) {
          bufferOptimizado = bufferTemp;
          break;
        }

        if (calidad > MIN_QUALITY) {
          calidad -= 10;
        } else if (dimensionObjetivo > MIN_DIMENSION) {
          dimensionObjetivo -= DIMENSION_STEP;
          calidad = 80;
        } else {
          bufferOptimizado = bufferTemp;
          break;
        }
      } while (true);

      if (bufferOptimizado.length > MAX_SIZE) {
        console.warn(`⚠️ La imagen ${nombreOriginal} no pudo comprimirse por debajo de 200KB`);
      }

      fs.writeFileSync(rutaDestino, bufferOptimizado);

      // Limpiamos referencias
      imagen.buffer = null;
      imagen.path = rutaDestino;
      imagen.filename = nombreFinal;
      imagen.optimizada = true;

      bufferOptimizado = null;
    }

    // Forzamos GC si se habilitó con --expose-gc
    if (global.gc) {
      global.gc();
    }

    next();
  } catch (error) {
    console.error("Error al procesar las imágenes:", error);
    res.status(500).json({ error: 'Error al procesar las imágenes' });
  }
}
