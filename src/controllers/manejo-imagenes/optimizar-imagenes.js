import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';

// Función para optimizar una imagen y convertirla a .webp sin agotar la RAM
export async function optimizarImagenes(inputPath) {
  let outputPath = '';
  let tempFilePath = '';
  let image = null; // Instancia de sharp que destruiremos después

  try {
    // Construir las rutas de salida
    const { dir, name } = path.parse(inputPath);
    outputPath = path.join(dir, `${name}.webp`);
    tempFilePath = path.join(dir, `${name}_temp.webp`);

    // Leer la imagen original como buffer
    const inputBuffer = await fs.readFile(inputPath);

    // Inicializar sharp con el buffer
    image = sharp(inputBuffer, { failOnError: false });

    // Obtener dimensiones de la imagen
    const metadata = await image.metadata();
    const width = metadata.width;
    const height = metadata.height;

    // Determinar el ancho de destino según la resolución original
    let targetWidth;
    if (Math.max(width, height) > 2000) {
      targetWidth = 2000;
    } else if (Math.max(width, height) > 1080) {
      targetWidth = 1080;
    } else {
      targetWidth = 720;
    }

    // Ajustes de calidad y bucle para reducir el tamaño
    let quality = 80;
    let webpBuffer;
    let optimizedSizeKB;

    do {
      // Liberar instancia anterior si existe
      if (image) image.destroy();

      // Re-crear la instancia para evitar residuos en memoria
      image = sharp(inputBuffer, { failOnError: false });

      // Redimensionar y generar el buffer .webp
      const resizedImage = image.resize({
        width: targetWidth,
        withoutEnlargement: true
      });

      webpBuffer = await resizedImage.webp({ quality }).toBuffer();
      optimizedSizeKB = webpBuffer.length / 1024;

      if (optimizedSizeKB > 250) {
        quality = Math.max(10, quality - 5); // Reducir calidad si es necesario
      }
    } while (optimizedSizeKB > 250 && quality > 10);

    // Escribir primero un archivo temporal para seguridad
    await fs.writeFile(tempFilePath, webpBuffer);

    // Renombrar para guardar como final
    await fs.rename(tempFilePath, outputPath);

    return outputPath;

  } catch (error) {
    // En caso de error, eliminar archivos temporales
    await Promise.all([
      fs.unlink(tempFilePath).catch(() => {}),
      fs.unlink(outputPath).catch(() => {})
    ]);
    console.error('❌ Error al procesar la imagen:', error);
    throw error;

  } finally {
    // Liberar recursos nativos de sharp
    if (image) image.destroy();
  }
}
