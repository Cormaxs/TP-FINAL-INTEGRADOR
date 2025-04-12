import { Router } from "express";
import { buscadorSitio } from "../controllers/datosPublicosController.js"


export const publico = Router();




//buscador general, si mando sin parametros, me devuelve todos los users
publico.get("/buscador", buscadorSitio)

