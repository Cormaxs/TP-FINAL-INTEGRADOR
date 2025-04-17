import express from 'express';
import multer from 'multer';
import {verificarToken} from "../../middleware/token/verificarToken.js"
import { subirImagen, subirImagenCategoria, eliminarImagenCategoria, eliminarCategoria } from '../../controllers/manejo-imagenes/crud-imagenes.js';
import { sanitizarDatos } from '../../middleware/subidaImagenes/validacionesImg.js';


export const fotos = express.Router();

const upload = multer({
    dest: 'imagenes/',
    limits: {
      fileSize: 50 * 1024 * 1024 // 50 MB en bytes
    }
  });

//ruta dinamica para subir img perfil y portada, agregar un middleware de verificacion de token he id y recien permitir edicion
fotos.post('/:tipo/:id',verificarToken, upload.single('imagen'), subirImagen);

//sube imagenes a la categoria
fotos.post("/categorias/:categoria/:id",verificarToken, sanitizarDatos, upload.array('imagenes', 5), subirImagenCategoria)


fotos.delete("/categorias/:categoria/:id/:imagen",verificarToken, sanitizarDatos, eliminarImagenCategoria)

//agregar eliminar categoria
fotos.delete("/categorias/:categoria/:id",verificarToken, sanitizarDatos, eliminarCategoria);