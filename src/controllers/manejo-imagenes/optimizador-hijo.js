import sharp from 'sharp';
import fs from 'fs';

const MAX_SIZE = 200 * 1024;
const MIN_QUALITY = 30;
const MIN_DIMENSION = 320;
const DIMENSION_STEP = 100;

process.on('message', async ({ buffer, rutaDestino }) => {
  try {
    const bufferOriginal = Buffer.from(buffer, 'base64');
    const metadata = await sharp(bufferOriginal).metadata();

    let dimensionObjetivo = Math.min(metadata.width, metadata.height);
    dimensionObjetivo = Math.min(dimensionObjetivo, 2000);

    let calidad = 80;
    let bufferOptimizado;

    do {
      const temp = await sharp(bufferOriginal)
        .resize({ width: dimensionObjetivo, height: dimensionObjetivo, fit: 'inside' })
        .webp({ quality: calidad })
        .toBuffer();

      if (temp.length <= MAX_SIZE) {
        bufferOptimizado = temp;
        break;
      }

      if (calidad > MIN_QUALITY) {
        calidad -= 10;
      } else if (dimensionObjetivo > MIN_DIMENSION) {
        dimensionObjetivo -= DIMENSION_STEP;
        calidad = 80;
      } else {
        bufferOptimizado = temp;
        break;
      }
    } while (true);

    fs.writeFileSync(rutaDestino, bufferOptimizado);
    process.send({ success: true });
    process.exit(0);

  } catch (error) {
    process.send({ success: false, error: error.message });
    process.exit(1);
  }
});
