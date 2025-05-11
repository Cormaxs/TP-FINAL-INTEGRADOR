import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';

export async function optimizarImagenes(inputPath) {
  let outputPath = '';
  let tempFilePath = ''; // Para manejar archivos temporales

  try {
    // Crear ruta de salida con extensión .webp
    const { dir, name } = path.parse(inputPath);
    outputPath = path.join(dir, `${name}.webp`);
    tempFilePath = path.join(dir, `${name}_temp.webp`);

    // Leer el archivo en buffer primero para cerrar el stream inmediatamente
    const inputBuffer = await fs.readFile(inputPath);
    
    // Procesar la imagen
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();
    const width = metadata.width;
    const height = metadata.height;

    // Determinar ancho objetivo
    let targetWidth;
    if (Math.max(width, height) > 2000) {
      targetWidth = 2000;
    } else if (Math.max(width, height) > 1080) {
      targetWidth = 1080;
    } else {
      targetWidth = 720;
    }

    // Redimensionar y convertir
    let quality = 80;
    let resizedImage = image.resize({ 
      width: targetWidth, 
      withoutEnlargement: true 
    });

    // Optimización en pasos
    let webpBuffer;
    let optimizedSizeKB;
    
    do {
      webpBuffer = await resizedImage.webp({ quality }).toBuffer();
      optimizedSizeKB = webpBuffer.length / 1024;
      
      if (optimizedSizeKB > 250) {
        quality = Math.max(10, quality - 5);
      }
    } while (optimizedSizeKB > 250 && quality > 10);

    // Escribir en archivo temporal primero
    await fs.writeFile(tempFilePath, webpBuffer);
    
    // Renombrar a la ubicación final (operación atómica)
    await fs.rename(tempFilePath, outputPath);

    return outputPath;

  } catch (error) {
    // Limpieza de archivos temporales en caso de error
    await Promise.all([
      fs.unlink(tempFilePath).catch(() => {}),
      fs.unlink(outputPath).catch(() => {})
    ]);
    
    console.error('Error al procesar la imagen:', error);
    throw error;
  }
}