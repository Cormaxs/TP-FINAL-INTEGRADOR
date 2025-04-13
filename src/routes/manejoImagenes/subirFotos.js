import express from 'express';
import multer from 'multer';
import {verificarToken} from "../../middleware/verificarToken.js"
import { subirImagen } from '../../controllers/subida-fotos-controller/perfil-portada.js';

export const fotos = express.Router();

const upload = multer({
    dest: 'uploads/',
    limits: {
      fileSize: 50 * 1024 * 1024 // 50 MB en bytes
    }
  });

//ruta dinamica para subir img perfil y portada, agregar un middleware de verificacion de token he id y recien permitir edicion
fotos.post('/:tipo/:id',verificarToken, upload.single('imagen'), subirImagen);







