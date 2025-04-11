import { Router } from "express";
import {traerTodosUsuarios, buscadorSitio } from "../controllers/datosPublicosController.js"

export const publico = Router();


// Ruta principal
publico.get("/usuarios", traerTodosUsuarios);


//buscar por name
publico.get("/buscador", buscadorSitio)

