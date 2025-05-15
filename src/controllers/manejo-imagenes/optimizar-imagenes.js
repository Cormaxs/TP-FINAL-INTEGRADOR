import path from 'path';
import fs from 'fs';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function optimizarImagenes(req, res, next) {
  try {
    const archivos = req.files || (req.file ? [req.file] : []);

    if (archivos.length === 0) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    const promesas = archivos.map((imagen) => {
      return new Promise((resolve, reject) => {
        const proceso = fork(path.join(__dirname, 'optimizador-hijo.js'));

        const nombreOriginal = imagen.originalname;
        const nombreBase = path.parse(nombreOriginal).name;
        const nombreFinal = `${Date.now()}-${nombreBase}.webp`;
        const rutaDestino = path.join('imagenes', nombreFinal);

        proceso.send({
          buffer: imagen.buffer.toString('base64'),
          rutaDestino
        });

        proceso.on('message', (msg) => {
          if (msg.success) {
            imagen.path = rutaDestino;
            imagen.filename = nombreFinal;
            imagen.optimizada = true;
            imagen.buffer = null;
            resolve();
          } else {
            reject(new Error(msg.error));
          }
        });

        proceso.on('error', reject);
        proceso.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Subproceso terminó con código ${code}`));
          }
        });
      });
    });

    await Promise.all(promesas);
    next();

  } catch (err) {
    console.error("Error al procesar las imágenes:", err);
    res.status(500).json({ error: 'Error al procesar las imágenes' });
  }
}
