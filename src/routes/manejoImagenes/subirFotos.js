import express from 'express';
import multer from 'multer';
import {verificarToken} from "../../middleware/token/verificarToken.js"
import { subirImagen, subirImagenCategoria, eliminarImagenCategoria, eliminarCategoria,actualizarPrecioCategoria, actualizarnombreCategoria } from '../../controllers/manejo-imagenes/crud-imagenes.js';
import { sanitizarDatos } from '../../middleware/subidaImagenes/validacionesImg.js';
import { noUser } from '../../middleware/subidaImagenes/validacionesImg.js';
import { optimizarImagenes } from '../../controllers/manejo-imagenes/optimizar-imagenes.js';

export const fotos = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 1000 * 1024 * 1024 // 100 MB en bytes
    }
  });

 

//subir img perfil y portada, agregar un middleware de verificacion de token he id y recien permitir edicion
fotos.post('/:tipo/:id', verificarToken, upload.single('imagen'),  optimizarImagenes, subirImagen);

//sube imagenes a la categoria
fotos.post("/categorias/:categoria/:id",  verificarToken, noUser, upload.array('imagenes', 10), optimizarImagenes, subirImagenCategoria)
fotos.post("/categorias/:categoria/:id/agregar", verificarToken, noUser, upload.array('imagenes', 10),  optimizarImagenes, subirImagenCategoria)

fotos.delete("/categorias/:categoria/:id/:imagen",verificarToken, noUser, sanitizarDatos, eliminarImagenCategoria)

//agregar eliminar categoria
fotos.delete("/categorias/:categoria/:id",verificarToken, noUser, sanitizarDatos, eliminarCategoria);

fotos.put("/updatePrice/:categoria/:id",verificarToken, noUser, actualizarPrecioCategoria )

fotos.put("/updateNameCategoria/:categoria/:id",noUser, actualizarnombreCategoria )