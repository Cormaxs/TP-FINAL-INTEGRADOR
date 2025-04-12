import express from 'express';
import multer from 'multer';
import { subirImagenPerfil, subirImagenPortada } from '../../controllers/subida-fotos-controller/perfil-portada.js';

export const fotos = express.Router();

const upload = multer({dest: 'uploads/'})
fotos.post('/perfil/:id', upload.single('perfil'), subirImagenPerfil);
fotos.post('/portada/:id', upload.single('portada'), subirImagenPortada);








