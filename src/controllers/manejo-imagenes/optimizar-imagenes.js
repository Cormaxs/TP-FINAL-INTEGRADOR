import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';

// 🔁 Desactivar cache interna de sharp
sharp.cache(false);

// Función auxiliar para mostrar uso de memoria (en MB)
function logMem(etiqueta = '') {
  const mem = process.memoryUsage();
  const toMB = bytes => (bytes / 1024 / 1024).toFixed(2) + ' MB';
  console.log(`🧠 Memoria usada ${etiqueta}:`);
  console.log(`  RSS       : ${toMB(mem.rss)}`);
  console.log(`  Heap total: ${toMB(mem.heapTotal)}`);
  console.log(`  Heap used : ${toMB(mem.heapUsed)}`);
  console.log(`  Externa   : ${toMB(mem.external)}\n`);
}

export async function optimizarImagenes(inputPath) {
  const { dir, name } = path.parse(inputPath);
  const outputPath = path.join(dir, `${name}.webp`);
  const tempFilePath = path.join(dir, `${name}_temp.webp`);

  try {
    logMem('antes de procesar');

    // Encapsular en un IIFE para liberar memoria luego
    await (async () => {
      const inputBuffer = await fs.readFile(inputPath);
      logMem('después de leer imagen');

      const tempSharp = sharp(inputBuffer, { failOnError: false });
      const metadata = await tempSharp.metadata();
      tempSharp.destroy(); // liberar inmediatamente

      const width = metadata.width;
      const height = metadata.height;

      let targetWidth;
      if (Math.max(width, height) > 2000) {
        targetWidth = 2000;
      } else if (Math.max(width, height) > 1080) {
        targetWidth = 1080;
      } else {
        targetWidth = 720;
      }

      let quality = 80;
      let webpBuffer;
      let optimizedSizeKB;

      do {
        const image = sharp(inputBuffer, { failOnError: false });
        const resizedImage = image.resize({
          width: targetWidth,
          withoutEnlargement: true
        });

        webpBuffer = await resizedImage.webp({ quality }).toBuffer();
        optimizedSizeKB = webpBuffer.length / 1024;

        image.destroy(); // liberar inmediatamente
        logMem(`tras calidad ${quality} y tamaño ${optimizedSizeKB.toFixed(2)} KB`);

        if (optimizedSizeKB > 250) {
          quality = Math.max(10, quality - 5);
        }
      } while (optimizedSizeKB > 250 && quality > 10);

      await fs.writeFile(tempFilePath, webpBuffer);
      await fs.rename(tempFilePath, outputPath);
    })();

    logMem('al final, antes de return');
    return outputPath;

  } catch (error) {
    await Promise.all([
      fs.unlink(tempFilePath).catch(() => {}),
      fs.unlink(outputPath).catch(() => {})
    ]);
    console.error('❌ Error al procesar la imagen:', error);
    throw error;

  } finally {
    // Aquí no usamos global.gc() intencionalmente
    logMem('después del finally (sin GC manual)');
  }
}
