import { Router } from "express";
import { buscadorSitio } from "../../controllers/datos-publicos/datosPublicosController.js"


export const publico = Router();

//buscador general, si mando sin parametros, me devuelve todos los users
publico.get("/buscador", buscadorSitio)

