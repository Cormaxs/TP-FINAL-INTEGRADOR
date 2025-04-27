import express from 'express';
import multer from 'multer';
import {verificarToken} from "../../middleware/token/verificarToken.js"
import { subirImagen, subirImagenCategoria, eliminarImagenCategoria, eliminarCategoria } from '../../controllers/manejo-imagenes/crud-imagenes.js';
import { sanitizarDatos } from '../../middleware/subidaImagenes/validacionesImg.js';
import { noUser } from '../../middleware/subidaImagenes/validacionesImg.js';

export const fotos = express.Router();

const upload = multer({
    dest: 'imagenes/',
    limits: {
      fileSize: 100 * 1024 * 1024 // 100 MB en bytes
    }
  });



//ruta dinamica para subir img perfil y portada, agregar un middleware de verificacion de token he id y recien permitir edicion
fotos.post('/:tipo/:id',verificarToken, upload.single('imagen'), subirImagen);

//sube imagenes a la categoria
fotos.post("/categorias/:categoria/:id",verificarToken, noUser,sanitizarDatos,  upload.array('imagenes', 5), subirImagenCategoria)


fotos.delete("/categorias/:categoria/:id/:imagen",verificarToken, sanitizarDatos, eliminarImagenCategoria)

//agregar eliminar categoria
fotos.delete("/categorias/:categoria/:id",verificarToken, sanitizarDatos, eliminarCategoria);