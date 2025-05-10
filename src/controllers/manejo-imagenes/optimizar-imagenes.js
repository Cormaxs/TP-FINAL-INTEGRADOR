import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';

export async function optimizarImagenes(inputPath) {
  try {
    console.log(inputPath)
    const image = sharp(inputPath);
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

    // Generar ruta de salida cambiando extensión a .webp
    const { dir, name } = path.parse(inputPath);
    const outputPath = path.join(dir, `${name}.webp`);

    // Redimensionar y convertir
    let quality = 80;
    let resizedImage = image.resize({ width: targetWidth, withoutEnlargement: true });
    let webpBuffer = await resizedImage.webp({ quality }).toBuffer();
    let optimizedSizeKB = webpBuffer.length / 1024;

    // Reducir calidad si supera los 500KB
    while (optimizedSizeKB > 250 && quality > 10) {
      quality -= 5;
      webpBuffer = await resizedImage.webp({ quality }).toBuffer();
      optimizedSizeKB = webpBuffer.length / 1024;
     // console.log(`Reoptimizando con calidad ${quality}, tamaño: ${optimizedSizeKB.toFixed(2)} KB`);
    }

    // Guardar archivo optimizado
    await fs.writeFile(outputPath, webpBuffer);
    //console.log(`Imagen optimizada guardada como ${outputPath} (${optimizedSizeKB.toFixed(2)} KB)`);

    return outputPath;

  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    throw error; // Propagar el error para manejo externo
  }
}
