import { buscadorSitioTodo } from "../../services/datos-publicos/datosPublicosServides.js"


export async function buscadorSitio(req, res) {
  const filtrosBusqueda = {
    nombre: req.query.nombre,
    ubicacion: req.query.ubicacion,
    rol: req.query.rol,
    categoria: req.query.categoria,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
  };
  const resultados = await buscadorSitioTodo(filtrosBusqueda)
  res.status(200).send(resultados)
}


