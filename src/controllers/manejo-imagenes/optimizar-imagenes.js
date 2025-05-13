import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';

// Configuración de Sharp para mejor manejo de memoria
sharp.cache(false);
sharp.concurrency(1);

// Función mejorada para mostrar uso de memoria en MB
function logMemoryUsage(stepName) {
  const memoryUsage = process.memoryUsage();
  
  const data = {
    Paso: stepName,
    'Memoria Total (RSS)': `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
    'Heap Total': `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    'Heap Usado': `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    'Memoria Externa': `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
    'Buffers': `${(memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`
  };

  console.table([data]);
}

export async function optimizarImagenes(inputPath) {
  const startMemory = process.memoryUsage();
  logMemoryUsage('Inicio del proceso');

  const { dir, name } = path.parse(inputPath);
  const outputPath = path.join(dir, `${name}.webp`);
  const tempFilePath = path.join(dir, `${name}_temp_${Date.now()}.webp`);

  try {
    // 1. Lectura del archivo
    const inputBuffer = await fs.readFile(inputPath);
    logMemoryUsage('Después de leer el archivo');

    // 2. Obtención de metadatos
    const metadata = await sharp(inputBuffer, { 
      failOnError: false,
      limitInputPixels: false
    }).metadata();
    logMemoryUsage('Después de obtener metadatos');

    const maxDimension = Math.max(metadata.width || 0, metadata.height || 0);
    let targetWidth = maxDimension > 2000 ? 2000 : 
                     maxDimension > 1080 ? 1080 : 720;

    // 3. Proceso de optimización
    let quality = 80;
    let webpBuffer;
    let optimizedSizeKB;
    let iteration = 1;

    do {
      const pipelineStartMem = process.memoryUsage();
      
      const pipeline = sharp(inputBuffer, { 
        failOnError: false,
        unlimited: true
      });

      webpBuffer = await pipeline
        .resize({
          width: targetWidth,
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3
        })
        .webp({ 
          quality,
          alphaQuality: quality,
          lossless: false,
          nearLossless: false,
          smartSubsample: true
        })
        .toBuffer();

      await pipeline.end();
      
      optimizedSizeKB = webpBuffer.length / 1024;
      logMemoryUsage(`Iteración ${iteration} - Calidad ${quality} (${optimizedSizeKB.toFixed(2)}KB)`);
      
      // Mostrar diferencia de memoria en esta iteración
      const pipelineEndMem = process.memoryUsage();
      const memDiff = {
        'Heap Diff': `${((pipelineEndMem.heapUsed - pipelineStartMem.heapUsed) / 1024 / 1024).toFixed(2)} MB`,
        'External Diff': `${((pipelineEndMem.external - pipelineStartMem.external) / 1024 / 1024).toFixed(2)} MB`
      };
      console.table([memDiff]);

      quality = optimizedSizeKB > 250 ? Math.max(10, quality - 5) : quality;
      iteration++;
    } while (optimizedSizeKB > 250 && quality > 10);

    // 4. Escritura del archivo
    await fs.writeFile(tempFilePath, webpBuffer);
    logMemoryUsage('Después de escribir archivo temporal');
    
    await fs.rename(tempFilePath, outputPath);
    logMemoryUsage('Después de renombrar archivo');

    // Estadísticas finales
    const endMemory = process.memoryUsage();
    const totalMemoryUsed = {
      'Memoria Total Usada': `${((endMemory.rss - startMemory.rss) / 1024 / 1024).toFixed(2)} MB`,
      'Heap Total Usado': `${((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2)} MB`,
      'Tiempo de Procesamiento': `${process.uptime()} segundos`
    };
    console.table([totalMemoryUsed]);

    return outputPath;

  } catch (error) {
    console.error('❌ Error durante el procesamiento:', error);
    
    // Limpieza de archivos temporales con reporte
    try {
      await fs.unlink(tempFilePath);
      console.log('🗑️ Archivo temporal eliminado');
    } catch (cleanError) {
      console.error('⚠️ No se pudo eliminar el archivo temporal:', cleanError);
    }
    
    throw error;
  } finally {
    // Forzar garbage collection si está disponible (solo para diagnóstico)
    if (global.gc) {
      global.gc();
      logMemoryUsage('Después de GC manual');
    }
  }
}
